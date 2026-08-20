alter function public.get_schedule_preparation_readiness()
rename to get_schedule_preparation_readiness_before_teacher_capacity_v2;

create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
with
profile as (
  select periods_per_day,cardinality(teaching_days)::integer as school_days
  from public.schedule_time_profiles
  where active=true
  limit 1
),
assignment_loads as (
  select a.teacher_id,sum(a.assigned_hours)::integer as assigned_hours
  from public.teacher_course_assignments a
  group by a.teacher_id
),
loads as (
  select
    p.user_id as teacher_id,
    p.full_name,
    al.assigned_hours,
    c.max_weekly_hours,
    c.max_daily_hours,
    c.max_working_days,
    pr.periods_per_day,
    pr.school_days,
    least(coalesce(c.max_working_days,pr.school_days),pr.school_days) as effective_days,
    coalesce(c.max_daily_hours,pr.periods_per_day) as effective_daily_hours
  from assignment_loads al
  join public.profiles p on p.user_id=al.teacher_id
  join public.teacher_schedule_constraints c on c.teacher_id=al.teacher_id
  cross join profile pr
),
weekly_bad as (
  select count(*)::integer n
  from loads
  where max_weekly_hours is not null and assigned_hours>max_weekly_hours
),
capacity_bad as (
  select count(*)::integer n
  from loads
  where assigned_hours>(effective_daily_hours*effective_days)
)
select * from public.get_schedule_preparation_readiness_before_teacher_capacity_v2()
union all
select
  'öğretmen'::text,
  'TEACHER_ASSIGNED_HOURS_EXCEED_WEEKLY_LIMIT'::text,
  'error'::text,
  n,
  'Ders ataması bulunan bir veya daha fazla personelin toplam ders saati, tanımlı haftalık üst sınırını aşıyor.'::text
from weekly_bad where n>0
union all
select
  'öğretmen'::text,
  'TEACHER_ASSIGNED_HOURS_EXCEED_DAY_CAPACITY'::text,
  'error'::text,
  n,
  'Ders ataması bulunan bir veya daha fazla personelin ders saati; günlük saat × çalışabileceği gün sayısı kapasitesine sığmıyor.'::text
from capacity_bad where n>0;
$$;

revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;