alter table public.teacher_payroll_config
  add column if not exists gunduz_kbs_data_type text not null default '101',
  add column if not exists nobet_kbs_data_type text not null default '110',
  add column if not exists rehberlik_kbs_data_type text not null default '110';

create or replace function public.recalculate_payroll_month(p_year int, p_month int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start date := make_date(p_year, p_month, 1);
  v_end date := (make_date(p_year, p_month, 1) + interval '1 month - 1 day')::date;
  v_run uuid;
  v_teacher record;
  v_week date;
  v_week_end date;
  v_regular_total numeric;
  v_obligation numeric;
  v_extra_remaining numeric;
  v_day record;
  v_day_regular numeric;
  v_substitute numeric;
  v_calendar record;
  v_duty_count int;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;

  insert into public.payroll_calculation_runs(period_start, period_end, calculated_by)
  values (v_start, v_end, auth.uid()) returning id into v_run;

  delete from public.payroll_day_entries
  where work_date between v_start and v_end and calculated = true and approved = false;

  for v_teacher in
    select p.user_id,
           coalesce(c.weekly_salary_obligation, 15) as obligation,
           coalesce(c.has_class_guidance, false) as has_guidance,
           coalesce(c.gunduz_kbs_data_type, '101') as gunduz_code,
           coalesce(c.nobet_kbs_data_type, '110') as nobet_code,
           coalesce(c.rehberlik_kbs_data_type, '110') as rehberlik_code
    from public.profiles p
    left join public.teacher_payroll_config c on c.teacher_id = p.user_id
    where p.role = 'teacher' and coalesce(c.active, true)
  loop
    v_week := date_trunc('week', v_start::timestamp)::date;
    while v_week <= v_end loop
      v_week_end := v_week + 6;

      select coalesce(sum(case
        when pc.day_type is null or pc.day_type = 'workday' or pc.deemed_regular_performed then 1
        else 0 end), 0)
      into v_regular_total
      from generate_series(greatest(v_week, v_start), least(v_week_end, v_end), interval '1 day') g(d)
      join public.teacher_schedule ts
        on ts.teacher_id = v_teacher.user_id
       and ts.weekday = extract(isodow from g.d)::smallint
      left join public.payroll_calendar pc on pc.calendar_date = g.d::date
      left join public.absences a
        on a.teacher_id = v_teacher.user_id and a.absence_date = g.d::date
       and a.status <> 'resolved' and a.approval_status = 'approved'
      where a.id is null or pc.deemed_regular_performed = true;

      select coalesce(count(*),0) into v_substitute
      from public.substitute_assignments sa
      join public.absence_lessons al on al.id = sa.absence_lesson_id
      where sa.substitute_user_id = v_teacher.user_id
        and al.lesson_date between greatest(v_week, v_start) and least(v_week_end, v_end)
        and sa.approval_status = 'approved';

      v_regular_total := v_regular_total + v_substitute;
      v_obligation := least(v_teacher.obligation, v_regular_total);
      v_extra_remaining := greatest(v_regular_total - v_obligation, 0);

      for v_day in
        select g.d::date as work_date
        from generate_series(greatest(v_week, v_start), least(v_week_end, v_end), interval '1 day') g(d)
        order by g.d
      loop
        exit when v_extra_remaining <= 0;
        select * into v_calendar from public.payroll_calendar where calendar_date = v_day.work_date;

        select coalesce(count(*),0) into v_day_regular
        from public.teacher_schedule ts
        left join public.absences a on a.teacher_id = ts.teacher_id and a.absence_date = v_day.work_date
          and a.status <> 'resolved' and a.approval_status = 'approved'
        where ts.teacher_id = v_teacher.user_id
          and ts.weekday = extract(isodow from v_day.work_date)::smallint
          and (a.id is null or coalesce(v_calendar.deemed_regular_performed,false));

        select coalesce(count(*),0) into v_substitute
        from public.substitute_assignments sa
        join public.absence_lessons al on al.id = sa.absence_lesson_id
        where sa.substitute_user_id = v_teacher.user_id
          and al.lesson_date = v_day.work_date
          and sa.approval_status = 'approved';

        if v_day_regular + v_substitute > 0 then
          insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
          values (
            v_teacher.user_id, v_day.work_date, 'gunduz', least(v_extra_remaining, v_day_regular + v_substitute),
            case when v_substitute > 0 then 'substitute' else case when v_calendar.day_type = 'administrative_leave' then 'admin_leave' when v_calendar.day_type = 'official_holiday' then 'holiday_rule' else 'schedule' end end,
            v_run, v_teacher.gunduz_code, 'Haftalık ders yükü, onaylı devamsızlık ve onaylı vekaletlere göre hesaplandı'
          );
          v_extra_remaining := v_extra_remaining - least(v_extra_remaining, v_day_regular + v_substitute);
        end if;
      end loop;

      select count(*) into v_duty_count
      from public.teacher_duty_assignments tda
      left join public.payroll_calendar pc on pc.calendar_date = tda.duty_date
      left join public.absences a on a.teacher_id = tda.teacher_id and a.absence_date = tda.duty_date
        and a.status <> 'resolved' and a.approval_status = 'approved'
      where tda.teacher_id = v_teacher.user_id
        and tda.duty_date between greatest(v_week, v_start) and least(v_week_end, v_end)
        and a.id is null and coalesce(pc.duty_payable, true) = true;

      if v_duty_count > 0 then
        insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
        values (v_teacher.user_id, greatest(v_week, v_start), 'nobet', 3, 'duty', v_run, v_teacher.nobet_code, 'Fiilen yerine getirilen nöbet görevi; haftalık en fazla 3 saat');
      end if;

      if v_teacher.has_guidance then
        select g.d::date into v_day.work_date
        from generate_series(greatest(v_week, v_start), least(v_week_end, v_end), interval '1 day') g(d)
        left join public.payroll_calendar pc on pc.calendar_date = g.d::date
        left join public.absences a on a.teacher_id = v_teacher.user_id and a.absence_date = g.d::date
          and a.status <> 'resolved' and a.approval_status = 'approved'
        where (pc.day_type is null or pc.day_type = 'workday' or pc.deemed_guidance_performed)
          and (a.id is null or coalesce(pc.deemed_guidance_performed,false))
        order by g.d limit 1;
        if found then
          insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
          values (v_teacher.user_id, v_day.work_date, 'rehberlik', 2, 'guidance', v_run, v_teacher.rehberlik_code, 'Sınıf/şube rehberliği öğrenci sosyal ve kişilik hizmetleri; haftalık 2 saat');
        end if;
      end if;

      v_week := v_week + 7;
    end loop;
  end loop;
  return v_run;
end;
$$;
