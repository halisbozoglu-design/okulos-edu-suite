-- Fix TTKB validation trigger to use the canonical teacher_course_assignments FK column.

create or replace function public.validate_teacher_course_assignment_area()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_course_id uuid;
  v_status text;
begin
  select r.course_id into v_course_id
  from public.class_course_requirements r
  where r.id = new.class_course_requirement_id;

  if v_course_id is null then
    raise exception 'COURSE_REQUIREMENT_NOT_FOUND';
  end if;

  v_status := public.teacher_course_permission_status(new.teacher_id, v_course_id, current_date);

  if v_status = 'NOT_ALLOWED' then
    raise exception 'TTKB_AREA_COURSE_NOT_ALLOWED';
  end if;

  -- AREA_NOT_DEFINED / AREA_RULES_NOT_ENTERED intentionally remain non-blocking
  -- while the super admin is still entering the authoritative TTKB dataset.
  return new;
end;
$$;

drop trigger if exists trg_validate_teacher_course_assignment_area on public.teacher_course_assignments;
create trigger trg_validate_teacher_course_assignment_area
before insert or update on public.teacher_course_assignments
for each row execute function public.validate_teacher_course_assignment_area();
