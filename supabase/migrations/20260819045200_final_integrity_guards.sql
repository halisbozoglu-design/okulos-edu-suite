-- Final integrity guards. This migration intentionally reasserts corrected definitions last.

create or replace function public.validate_teacher_course_assignment_area()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare v_status text;v_course_id uuid;
begin
  select course_id into v_course_id from public.class_course_requirements where id=new.class_course_requirement_id;
  if v_course_id is null then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;
  v_status:=public.teacher_course_permission_status(new.teacher_id,v_course_id,current_date);
  if v_status='NOT_ALLOWED' then raise exception 'TTKB_AREA_COURSE_NOT_ALLOWED'; end if;
  -- AREA_NOT_DEFINED / AREA_RULES_NOT_ENTERED are allowed while data is being entered,
  -- but curriculum readiness remains false until they resolve to ALLOWED.
  return new;
end;
$$;
drop trigger if exists trg_validate_teacher_course_assignment_area on public.teacher_course_assignments;
create trigger trg_validate_teacher_course_assignment_area
before insert or update on public.teacher_course_assignments
for each row execute function public.validate_teacher_course_assignment_area();

-- NULL subgroup keys must not weaken normal-class collision guarantees in scenarios.
drop index if exists uq_schedule_scenario_normal_class_slot;
create unique index uq_schedule_scenario_normal_class_slot
on public.schedule_scenario_rows(scenario_id,class_id,weekday,period)
where class_id is not null and is_group_split=false;

drop index if exists uq_schedule_scenario_group_slot;
create unique index uq_schedule_scenario_group_slot
on public.schedule_scenario_rows(scenario_id,class_id,weekday,period,subgroup_key)
where class_id is not null and is_group_split=true and subgroup_key is not null;
