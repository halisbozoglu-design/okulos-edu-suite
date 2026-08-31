-- A class must never see or select another program/field/branch's elective.
-- Replace the first version with a full curriculum-context match.
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
  v_class record;
  v_offering public.course_offering_rules%rowtype;
  v_requirement_id uuid;
  v_expected integer;
  v_planned integer;
  v_school_type text;
begin
  perform public.open_permission_context('curriculum.manage');
  select s.*, y.code as academic_year_code, f.name as field_name, b.name as branch_name
  into v_class
  from public.school_classes s
  join public.academic_years y on y.id = s.academic_year_id
  left join public.institution_fields f on f.id = s.field_id
  left join public.institution_branches b on b.id = s.branch_id
  where s.id = p_class_id and s.active and s.institution_code = public.current_tenant_code();
  if not found then raise exception 'CLASS_NOT_FOUND'; end if;
  v_school_type := public.infer_school_type_for_class_v1(v_class.grade_level, v_class.program_type, v_class.school_type);

  select * into v_offering
  from public.course_offering_rules o
  where o.id = p_offering_id
    and o.active
    and o.institution_code = public.current_tenant_code()
    and o.academic_year = v_class.academic_year_code
    and o.grade_level = v_class.grade_level
    and (o.school_level is null or o.school_level = v_school_type)
    and (o.school_subtype is null or o.school_subtype = v_class.school_subtype)
    and (o.program_type is null or o.program_type = v_class.program_type)
    and (o.field_name is null or o.field_name = v_class.field_name)
    and (o.branch_name is null or o.branch_name = v_class.branch_name)
    and (lower(o.category) = 'secmeli' or o.elective_group_key is not null);
  if not found then raise exception 'ELECTIVE_OFFERING_NOT_FOUND_FOR_CLASS_CONTEXT'; end if;
  if p_weekly_hours is null or not (p_weekly_hours = any(v_offering.hour_options)) then raise exception 'ELECTIVE_HOUR_OPTION_INVALID'; end if;

  select expected_weekly_hours into v_expected from public.school_classes where id = p_class_id;
  select coalesce(sum(weekly_hours), 0) into v_planned from public.class_course_requirements where class_id = p_class_id and course_id <> v_offering.course_id;
  if v_expected is not null and v_planned + p_weekly_hours > v_expected then raise exception 'ELECTIVE_EXCEEDS_OFFICIAL_WEEKLY_TOTAL'; end if;

  select r.id into v_requirement_id from public.class_course_requirements r where r.class_id = p_class_id and r.course_id = v_offering.course_id;
  if found then
    if exists(select 1 from public.class_course_requirements where id = v_requirement_id and (locked or coalesce(note, '') not like 'RESMI_CIZELGE:SELECTED:%')) then raise exception 'ELECTIVE_SELECTION_PRESERVES_MANUAL_OR_LOCKED_REQUIREMENT'; end if;
    if exists(select 1 from public.teacher_course_assignments where class_course_requirement_id = v_requirement_id) then raise exception 'ELECTIVE_SELECTION_HAS_TEACHER_ASSIGNMENT'; end if;
    update public.class_course_requirements set weekly_hours = p_weekly_hours, category = lower(v_offering.category), note = format('RESMI_CIZELGE:SELECTED:%s', v_offering.id), updated_at = now() where id = v_requirement_id;
  else
    insert into public.class_course_requirements(class_id, course_id, weekly_hours, category, note, updated_at)
    values (p_class_id, v_offering.course_id, p_weekly_hours, lower(v_offering.category), format('RESMI_CIZELGE:SELECTED:%s', v_offering.id), now()) returning id into v_requirement_id;
  end if;
  perform public.refresh_class_curriculum_status(p_class_id);
  return v_requirement_id;
end;
$$;

create or replace function public.list_official_electives_for_class_v1(p_class_id uuid)
returns table(offering_id uuid, course_id uuid, course_name text, category text, hour_options smallint[], elective_group_key text, max_selections smallint, source_note text)
language plpgsql security definer set search_path = public
as $$
declare v_class record; v_school_type text;
begin
  perform public.open_permission_context('curriculum.manage');
  select s.*, y.code as academic_year_code, f.name as field_name, b.name as branch_name into v_class
  from public.school_classes s join public.academic_years y on y.id=s.academic_year_id left join public.institution_fields f on f.id=s.field_id left join public.institution_branches b on b.id=s.branch_id
  where s.id=p_class_id and s.active and s.institution_code=public.current_tenant_code();
  if not found then raise exception 'CLASS_NOT_FOUND'; end if;
  v_school_type := public.infer_school_type_for_class_v1(v_class.grade_level, v_class.program_type, v_class.school_type);
  return query select o.id,o.course_id,c.name,o.category,o.hour_options,o.elective_group_key,o.max_selections,o.source_note
  from public.course_offering_rules o join public.course_catalog c on c.id=o.course_id and c.active
  where o.active and o.institution_code=public.current_tenant_code() and o.academic_year=v_class.academic_year_code and o.grade_level=v_class.grade_level
    and (o.school_level is null or o.school_level=v_school_type) and (o.school_subtype is null or o.school_subtype=v_class.school_subtype)
    and (o.program_type is null or o.program_type=v_class.program_type) and (o.field_name is null or o.field_name=v_class.field_name)
    and (o.branch_name is null or o.branch_name=v_class.branch_name) and (lower(o.category)='secmeli' or o.elective_group_key is not null)
  order by coalesce(o.elective_group_key,''),c.name;
end;
$$;

revoke all on function public.select_official_elective_for_class_v1(uuid, uuid, smallint) from public, anon;
grant execute on function public.select_official_elective_for_class_v1(uuid, uuid, smallint) to authenticated;
revoke all on function public.list_official_electives_for_class_v1(uuid) from public, anon;
grant execute on function public.list_official_electives_for_class_v1(uuid) to authenticated;
