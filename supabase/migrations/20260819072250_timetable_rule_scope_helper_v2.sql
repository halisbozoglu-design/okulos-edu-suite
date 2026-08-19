-- Report where the effective schedule rule came from.
-- Priority mirrors get_effective_schedule_rule_v2().
create or replace function public.get_effective_schedule_rule_scope_v2(
  p_requirement_id uuid,
  p_teacher_assignment_id uuid default null
)
returns text
language sql
stable
security definer
set search_path=public
as $$
  select case
    when p_teacher_assignment_id is not null and exists(
      select 1 from public.schedule_rule_overrides o
      where o.teacher_assignment_id=p_teacher_assignment_id and o.active=true
    ) then 'assignment'
    when exists(
      select 1 from public.schedule_rule_overrides o
      where o.class_course_requirement_id=p_requirement_id and o.active=true
    ) then 'requirement'
    when exists(
      select 1
      from public.class_course_requirements r
      join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active=true
      where r.id=p_requirement_id
    ) then 'course'
    else 'none'
  end;
$$;
revoke all on function public.get_effective_schedule_rule_scope_v2(uuid,uuid) from public;
grant execute on function public.get_effective_schedule_rule_scope_v2(uuid,uuid) to authenticated;
