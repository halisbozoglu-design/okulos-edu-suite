create or replace view public.schedule_assignment_options
with (security_invoker=true)
as
select
  a.id as teacher_assignment_id,
  a.teacher_id,
  p.full_name as teacher_name,
  a.assigned_hours,
  r.id as requirement_id,
  r.class_id,
  sc.class_name,
  sc.composite_key,
  r.course_id,
  c.name as course_name,
  coalesce((select count(*) from public.teacher_schedule ts where ts.active=true and ts.teacher_assignment_id=a.id),0)::integer as placed_hours,
  greatest(a.assigned_hours-coalesce((select count(*) from public.teacher_schedule ts where ts.active=true and ts.teacher_assignment_id=a.id),0),0)::integer as remaining_hours
from public.teacher_course_assignments a
join public.profiles p on p.user_id=a.teacher_id
join public.class_course_requirements r on r.id=a.class_course_requirement_id
join public.school_classes sc on sc.id=r.class_id
join public.course_catalog c on c.id=r.course_id
where sc.active=true and c.active=true;

grant select on public.schedule_assignment_options to authenticated;
