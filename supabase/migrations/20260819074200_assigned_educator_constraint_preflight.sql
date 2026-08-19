-- Every person with a teaching assignment must have a timetable constraint row,
-- regardless of cadre role. Managers/admins may teach and must obey the same scheduling model.

alter function public.get_schedule_preparation_readiness()
rename to get_schedule_preparation_readiness_before_assigned_educator_constraint_v2;

create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
with missing as (
  select count(distinct a.teacher_id)::integer as n
  from public.teacher_course_assignments a
  left join public.teacher_schedule_constraints c on c.teacher_id=a.teacher_id
  where c.teacher_id is null
)
select *
from public.get_schedule_preparation_readiness_before_assigned_educator_constraint_v2()
where code<>'TEACHER_CONSTRAINT_ROW_MISSING'
union all
select
  'öğretmen'::text,
  'TEACHER_CONSTRAINT_ROW_MISSING'::text,
  'error'::text,
  n,
  'Ders ataması bulunan her personelin program kısıt kaydı bulunmalıdır; öğretmen, müdür veya müdür yardımcısı ayrımı yapılmaz.'::text
from missing
where n>0;
$$;

revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;
