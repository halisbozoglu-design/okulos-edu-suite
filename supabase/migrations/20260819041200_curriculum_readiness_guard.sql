-- Reliable aggregate summaries + timetable readiness gate.

create or replace view public.class_curriculum_summary
with (security_invoker=true)
as
with requirement_totals as (
  select class_id,
    coalesce(sum(weekly_hours),0)::integer as planned_weekly_hours,
    count(*)::integer as course_count
  from public.class_course_requirements
  group by class_id
), assignment_totals as (
  select r.class_id,
    coalesce(sum(a.assigned_hours),0)::integer as assigned_teacher_hours
  from public.class_course_requirements r
  left join public.teacher_course_assignments a on a.class_course_requirement_id=r.id
  group by r.class_id
)
select c.id as class_id,c.class_name,c.composite_key,c.program_type,c.expected_weekly_hours,c.curriculum_status,
  coalesce(rt.planned_weekly_hours,0) as planned_weekly_hours,
  coalesce(rt.course_count,0) as course_count,
  coalesce(at.assigned_teacher_hours,0) as assigned_teacher_hours
from public.school_classes c
left join requirement_totals rt on rt.class_id=c.id
left join assignment_totals at on at.class_id=c.id
where c.active=true;

grant select on public.class_curriculum_summary to authenticated;

create or replace view public.teacher_course_load_summary
with (security_invoker=true)
as
select p.user_id as teacher_id,p.full_name,
  coalesce(sum(a.assigned_hours),0)::integer as assigned_weekly_hours,
  count(distinct r.class_id)::integer as class_count,
  count(distinct r.course_id)::integer as course_count
from public.profiles p
left join public.teacher_course_assignments a on a.teacher_id=p.user_id
left join public.class_course_requirements r on r.id=a.class_course_requirement_id
where p.role='teacher'
group by p.user_id,p.full_name;

grant select on public.teacher_course_load_summary to authenticated;

create or replace function public.get_curriculum_readiness(p_class_id uuid default null)
returns table(
  class_id uuid,
  composite_key text,
  expected_hours integer,
  planned_hours integer,
  assigned_hours integer,
  unassigned_course_count integer,
  partially_assigned_course_count integer,
  ready boolean,
  blocking_reason text
)
language sql
stable
security definer
set search_path=public
as $$
  with assignment_by_req as (
    select r.id,r.class_id,r.weekly_hours,
      coalesce(sum(a.assigned_hours),0)::integer as assigned
    from public.class_course_requirements r
    left join public.teacher_course_assignments a on a.class_course_requirement_id=r.id
    group by r.id,r.class_id,r.weekly_hours
  ), by_class as (
    select c.id,c.composite_key,c.expected_weekly_hours,
      coalesce(sum(ar.weekly_hours),0)::integer as planned,
      coalesce(sum(ar.assigned),0)::integer as assigned,
      count(*) filter (where ar.id is not null and ar.assigned=0)::integer as unassigned,
      count(*) filter (where ar.id is not null and ar.assigned>0 and ar.assigned<ar.weekly_hours)::integer as partial
    from public.school_classes c
    left join assignment_by_req ar on ar.class_id=c.id
    where c.active=true and (p_class_id is null or c.id=p_class_id)
    group by c.id,c.composite_key,c.expected_weekly_hours
  )
  select b.id,b.composite_key,b.expected_weekly_hours::integer,b.planned,b.assigned,b.unassigned,b.partial,
    (b.expected_weekly_hours is not null and b.planned=b.expected_weekly_hours and b.assigned=b.planned and b.unassigned=0 and b.partial=0) as ready,
    case
      when b.expected_weekly_hours is null then 'HEDEF_HAFTALIK_SAAT_TANIMSIZ'
      when b.planned < b.expected_weekly_hours then 'DERS_YUKU_EKSIK'
      when b.planned > b.expected_weekly_hours then 'DERS_YUKU_FAZLA'
      when b.unassigned > 0 then 'OGRETMEN_ATANMAMIS_DERS_VAR'
      when b.partial > 0 or b.assigned < b.planned then 'OGRETMEN_SAATI_EKSIK'
      when b.assigned > b.planned then 'OGRETMEN_SAATI_FAZLA'
      else null
    end as blocking_reason
  from by_class b
  order by b.composite_key;
$$;

revoke all on function public.get_curriculum_readiness(uuid) from public;
grant execute on function public.get_curriculum_readiness(uuid) to authenticated;

create or replace function public.assert_curriculum_ready_for_timetable()
returns boolean
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_bad record;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select * into v_bad from public.get_curriculum_readiness(null) where ready=false limit 1;
  if found then
    raise exception 'CURRICULUM_NOT_READY: % - %', coalesce(v_bad.composite_key,'SINIF'), v_bad.blocking_reason;
  end if;
  return true;
end;
$$;

revoke all on function public.assert_curriculum_ready_for_timetable() from public;
grant execute on function public.assert_curriculum_ready_for_timetable() to authenticated;
