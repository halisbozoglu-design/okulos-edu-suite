create table if not exists public.teacher_payroll_config (
  teacher_id uuid primary key references public.profiles(user_id) on delete cascade,
  weekly_salary_obligation smallint not null default 15 check (weekly_salary_obligation between 0 and 40),
  has_class_guidance boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_calendar (
  calendar_date date primary key,
  day_type text not null check (day_type in ('workday','official_holiday','administrative_leave','school_closed')),
  title text not null,
  deemed_regular_performed boolean not null default false,
  deemed_guidance_performed boolean not null default false,
  duty_payable boolean not null default true,
  source_note text,
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz
);

create table if not exists public.payroll_day_entries (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  work_date date not null,
  category text not null check (category in ('gunduz','nobet','rehberlik')),
  hours numeric(5,2) not null default 0 check (hours >= 0),
  source_type text not null check (source_type in ('schedule','substitute','duty','guidance','holiday_rule','admin_leave','manual_adjustment')),
  source_id uuid,
  kbs_data_type text not null default '101',
  explanation text,
  calculated boolean not null default true,
  approved boolean not null default false,
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (teacher_id, work_date, category, source_type, source_id)
);

create table if not exists public.payroll_calculation_runs (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  calculated_by uuid not null references public.profiles(user_id) on delete restrict,
  status text not null default 'calculated' check (status in ('calculated','approved','exported')),
  rule_version text not null default '2026-8th-collective-contract',
  created_at timestamptz not null default now()
);

create index if not exists idx_payroll_day_entries_month on public.payroll_day_entries(work_date, teacher_id);
create index if not exists idx_payroll_day_entries_approved on public.payroll_day_entries(teacher_id, work_date, approved);

alter table public.teacher_payroll_config enable row level security;
alter table public.payroll_calendar enable row level security;
alter table public.payroll_day_entries enable row level security;
alter table public.payroll_calculation_runs enable row level security;

grant select on public.teacher_payroll_config, public.payroll_calendar, public.payroll_day_entries, public.payroll_calculation_runs to authenticated;
grant insert, update, delete on public.teacher_payroll_config, public.payroll_calendar to authenticated;
grant update on public.payroll_day_entries to authenticated;

create policy "managers read payroll config" on public.teacher_payroll_config for select to authenticated using (public.is_manager_or_admin());
create policy "managers manage payroll config" on public.teacher_payroll_config for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read payroll calendar" on public.payroll_calendar for select to authenticated using (true);
create policy "managers manage payroll calendar" on public.payroll_calendar for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "users read relevant payroll" on public.payroll_day_entries for select to authenticated using (teacher_id = auth.uid() or public.is_manager_or_admin());
create policy "managers approve payroll" on public.payroll_day_entries for update to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers read payroll runs" on public.payroll_calculation_runs for select to authenticated using (public.is_manager_or_admin());

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
    select p.user_id, coalesce(c.weekly_salary_obligation, 15) as obligation,
           coalesce(c.has_class_guidance, false) as has_guidance
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
        on a.teacher_id = v_teacher.user_id and a.absence_date = g.d::date and a.status <> 'resolved'
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
        left join public.absences a on a.teacher_id = ts.teacher_id and a.absence_date = v_day.work_date and a.status <> 'resolved'
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
          insert into public.payroll_day_entries(
            teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation
          ) values (
            v_teacher.user_id,
            v_day.work_date,
            'gunduz',
            least(v_extra_remaining, v_day_regular + v_substitute),
            case when v_substitute > 0 then 'substitute' else case when v_calendar.day_type = 'administrative_leave' then 'admin_leave' when v_calendar.day_type = 'official_holiday' then 'holiday_rule' else 'schedule' end end,
            v_run,
            '101',
            'Haftalık ders yükü ve onaylı vekaletlere göre hesaplandı'
          );
          v_extra_remaining := v_extra_remaining - least(v_extra_remaining, v_day_regular + v_substitute);
        end if;
      end loop;

      select count(*) into v_duty_count
      from public.teacher_duty_assignments tda
      left join public.payroll_calendar pc on pc.calendar_date = tda.duty_date
      left join public.absences a on a.teacher_id = tda.teacher_id and a.absence_date = tda.duty_date and a.status <> 'resolved'
      where tda.teacher_id = v_teacher.user_id
        and tda.duty_date between greatest(v_week, v_start) and least(v_week_end, v_end)
        and a.id is null
        and coalesce(pc.duty_payable, true) = true;

      if v_duty_count > 0 then
        insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
        values (v_teacher.user_id, greatest(v_week, v_start), 'nobet', 3, 'duty', v_run, '110', 'Fiilen yerine getirilen nöbet görevi; haftalık en fazla 3 saat');
      end if;

      if v_teacher.has_guidance then
        select g.d::date into v_day.work_date
        from generate_series(greatest(v_week, v_start), least(v_week_end, v_end), interval '1 day') g(d)
        left join public.payroll_calendar pc on pc.calendar_date = g.d::date
        left join public.absences a on a.teacher_id = v_teacher.user_id and a.absence_date = g.d::date and a.status <> 'resolved'
        where (pc.day_type is null or pc.day_type = 'workday' or pc.deemed_guidance_performed)
          and (a.id is null or coalesce(pc.deemed_guidance_performed,false))
        order by g.d limit 1;
        if found then
          insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
          values (v_teacher.user_id, v_day.work_date, 'rehberlik', 2, 'guidance', v_run, '110', 'Sınıf/şube rehberliği öğrenci sosyal ve kişilik hizmetleri; haftalık 2 saat');
        end if;
      end if;

      v_week := v_week + 7;
    end loop;
  end loop;

  return v_run;
end;
$$;

revoke all on function public.recalculate_payroll_month(int,int) from public;
grant execute on function public.recalculate_payroll_month(int,int) to authenticated;

create or replace function public.payroll_month_matrix(p_year int, p_month int)
returns table (
  teacher_id uuid,
  full_name text,
  role public.app_role,
  work_date date,
  category text,
  hours numeric,
  kbs_data_type text,
  approved boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select e.teacher_id, p.full_name, p.role, e.work_date, e.category, sum(e.hours), e.kbs_data_type, bool_and(e.approved)
  from public.payroll_day_entries e
  join public.profiles p on p.user_id = e.teacher_id
  where e.work_date >= make_date(p_year,p_month,1)
    and e.work_date < make_date(p_year,p_month,1) + interval '1 month'
  group by e.teacher_id,p.full_name,p.role,e.work_date,e.category,e.kbs_data_type
  order by p.full_name,e.work_date,e.category;
$$;

revoke all on function public.payroll_month_matrix(int,int) from public;
grant execute on function public.payroll_month_matrix(int,int) to authenticated;

create or replace function public.kbs_payroll_export(p_year int, p_month int)
returns table (
  tckn text,
  full_name text,
  data_type text,
  hours numeric,
  explanation text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.tckn, coalesce(p.full_name,''), e.kbs_data_type, sum(e.hours),
         string_agg(distinct coalesce(e.explanation,''), ' / ')
  from public.payroll_day_entries e
  join public.profiles p on p.user_id = e.teacher_id
  where e.work_date >= make_date(p_year,p_month,1)
    and e.work_date < make_date(p_year,p_month,1) + interval '1 month'
    and e.approved = true
  group by p.tckn,p.full_name,e.kbs_data_type
  order by p.full_name,e.kbs_data_type;
$$;

revoke all on function public.kbs_payroll_export(int,int) from public;
grant execute on function public.kbs_payroll_export(int,int) to authenticated;
