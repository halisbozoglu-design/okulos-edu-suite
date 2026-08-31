-- Elective decisions are intentional class-level choices.  The source offering
-- remains immutable; only a compatible selection becomes a class requirement.
create or replace function public.select_official_elective_for_class_v1(
  p_class_id uuid,
  p_offering_id uuid,
  p_weekly_hours smallint
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.school_classes%rowtype;
  v_offering public.course_offering_rules%rowtype;
  v_requirement_id uuid;
  v_expected integer;
  v_planned integer;
begin
  perform public.open_permission_context('curriculum.manage');

  select * into v_class
  from public.school_classes
  where id = p_class_id
    and active
    and institution_code = public.current_tenant_code();
  if not found then raise exception 'CLASS_NOT_FOUND'; end if;

  select * into v_offering
  from public.course_offering_rules
  where id = p_offering_id
    and active
    and institution_code = public.current_tenant_code()
    and (lower(category) = 'secmeli' or elective_group_key is not null);
  if not found then raise exception 'ELECTIVE_OFFERING_NOT_FOUND'; end if;
  if v_offering.academic_year <> (select code from public.academic_years where id = v_class.academic_year_id) then
    raise exception 'OFFERING_ACADEMIC_YEAR_MISMATCH';
  end if;
  if p_weekly_hours is null or not (p_weekly_hours = any(v_offering.hour_options)) then
    raise exception 'ELECTIVE_HOUR_OPTION_INVALID';
  end if;

  select expected_weekly_hours into v_expected from public.school_classes where id = p_class_id;
  select coalesce(sum(weekly_hours), 0) into v_planned
  from public.class_course_requirements
  where class_id = p_class_id and course_id <> v_offering.course_id;
  if v_expected is not null and v_planned + p_weekly_hours > v_expected then
    raise exception 'ELECTIVE_EXCEEDS_OFFICIAL_WEEKLY_TOTAL';
  end if;

  select r.id into v_requirement_id
  from public.class_course_requirements r
  where r.class_id = p_class_id and r.course_id = v_offering.course_id;

  if found then
    if exists(select 1 from public.class_course_requirements where id = v_requirement_id and (locked or coalesce(note, '') not like 'RESMI_CIZELGE:SELECTED:%')) then
      raise exception 'ELECTIVE_SELECTION_PRESERVES_MANUAL_OR_LOCKED_REQUIREMENT';
    end if;
    if exists(select 1 from public.teacher_course_assignments where class_course_requirement_id = v_requirement_id) then
      raise exception 'ELECTIVE_SELECTION_HAS_TEACHER_ASSIGNMENT';
    end if;
    update public.class_course_requirements
    set weekly_hours = p_weekly_hours,
        category = lower(v_offering.category),
        note = format('RESMI_CIZELGE:SELECTED:%s', v_offering.id),
        updated_at = now()
    where id = v_requirement_id;
  else
    insert into public.class_course_requirements(class_id, course_id, weekly_hours, category, note, updated_at)
    values (p_class_id, v_offering.course_id, p_weekly_hours, lower(v_offering.category), format('RESMI_CIZELGE:SELECTED:%s', v_offering.id), now())
    returning id into v_requirement_id;
  end if;

  perform public.refresh_class_curriculum_status(p_class_id);
  return v_requirement_id;
end;
$$;

revoke all on function public.select_official_elective_for_class_v1(uuid, uuid, smallint) from public;
grant execute on function public.select_official_elective_for_class_v1(uuid, uuid, smallint) to authenticated;
