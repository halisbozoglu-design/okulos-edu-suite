create or replace function public.suggest_substitutes_for_day(p_date date default current_date)
returns table (
  absence_lesson_id uuid,
  period smallint,
  class_id uuid,
  class_name text,
  subject text,
  candidate_user_id uuid,
  candidate_name text,
  candidate_role public.app_role,
  priority integer,
  weekly_load bigint,
  reason text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  return query
  with empty_lessons as (
    select al.*
    from public.absence_lessons al
    left join public.substitute_assignments sa on sa.absence_lesson_id = al.id
    where al.lesson_date = p_date and sa.id is null
  ), candidate_pool as (
    select el.id as lesson_id, tda.teacher_id as user_id, 1 as priority, 'Nöbetçi öğretmen'::text as reason
    from empty_lessons el
    join public.teacher_duty_assignments tda on tda.duty_date = p_date
    join public.profiles p on p.user_id = tda.teacher_id and p.role = 'teacher'

    union all

    select el.id, dr.vice_principal_id, 2, 'Nöbetçi müdür yardımcısı'
    from empty_lessons el
    join public.duty_rotation dr on dr.duty_date = p_date

    union all

    select el.id, vp.user_id, 3, 'Diğer uygun müdür yardımcısı'
    from empty_lessons el
    join public.vice_principals vp on vp.active = true
    where vp.user_id <> coalesce(
      (select vice_principal_id from public.duty_rotation where duty_date = p_date),
      '00000000-0000-0000-0000-000000000000'::uuid
    )
  ), eligible as (
    select
      cp.lesson_id,
      cp.user_id,
      min(cp.priority) as priority,
      min(cp.reason) as reason,
      count(sa_week.id) as weekly_load
    from candidate_pool cp
    join empty_lessons el on el.id = cp.lesson_id
    left join public.substitute_assignments sa_week
      on sa_week.substitute_user_id = cp.user_id
     and sa_week.assigned_at >= date_trunc('week', p_date::timestamp)
     and sa_week.assigned_at < date_trunc('week', p_date::timestamp) + interval '7 days'
    where cp.user_id <> el.teacher_id
      and not exists (
        select 1 from public.absences a
        where a.teacher_id = cp.user_id
          and a.absence_date = p_date
          and a.status <> 'resolved'
      )
      and not exists (
        select 1 from public.teacher_schedule ts
        where ts.teacher_id = cp.user_id
          and ts.weekday = extract(isodow from p_date)::smallint
          and ts.period = el.period
      )
      and not exists (
        select 1
        from public.substitute_assignments sa2
        join public.absence_lessons al2 on al2.id = sa2.absence_lesson_id
        where sa2.substitute_user_id = cp.user_id
          and al2.lesson_date = p_date
          and al2.period = el.period
      )
    group by cp.lesson_id, cp.user_id
  ), ranked as (
    select e.*, row_number() over (
      partition by e.lesson_id
      order by e.priority, e.weekly_load, e.user_id
    ) as rn
    from eligible e
  )
  select
    el.id,
    el.period,
    el.class_id,
    el.class_name,
    el.subject,
    r.user_id,
    p.full_name,
    p.role,
    r.priority,
    r.weekly_load,
    r.reason
  from empty_lessons el
  join ranked r on r.lesson_id = el.id and r.rn <= 5
  join public.profiles p on p.user_id = r.user_id
  order by el.period, el.class_name, r.rn;
end;
$$;

revoke all on function public.suggest_substitutes_for_day(date) from public;
grant execute on function public.suggest_substitutes_for_day(date) to authenticated;
