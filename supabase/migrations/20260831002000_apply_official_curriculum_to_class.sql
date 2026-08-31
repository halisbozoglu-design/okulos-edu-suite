-- Apply the official Turkish course schedule to one class without overwriting
-- deliberate local work.  Elective choices remain an operator decision.
create or replace function public.apply_official_curriculum_to_class_v2(
  p_class_id uuid,
  p_mode text default 'APPLY'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class record;
  v_year text;
  v_school_type text;
  v_field_name text;
  v_branch_name text;
  v_mode text := upper(coalesce(p_mode, 'APPLY'));
  v_offerings integer := 0;
  v_automatic integer := 0;
  v_electives integer := 0;
  v_ambiguous integer := 0;
  v_preserved integer := 0;
  v_synced integer := 0;
  v_target smallint;
begin
  perform public.open_permission_context('curriculum.manage');

  select c.*, y.code as academic_year_code, f.name as field_name, b.name as branch_name
  into v_class
  from public.school_classes c
  join public.academic_years y on y.id = c.academic_year_id
  left join public.institution_fields f on f.id = c.field_id
  left join public.institution_branches b on b.id = c.branch_id
  where c.id = p_class_id
    and c.institution_code = public.current_tenant_code()
    and c.active;

  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if v_mode not in ('PREVIEW', 'APPLY') then
    raise exception 'INVALID_MODE';
  end if;

  v_year := v_class.academic_year_code;
  v_school_type := public.infer_school_type_for_class_v1(
    v_class.grade_level,
    v_class.program_type,
    v_class.school_type
  );
  v_field_name := v_class.field_name;
  v_branch_name := v_class.branch_name;

  if v_school_type is null or v_class.grade_level is null then
    return jsonb_build_object(
      'applied', false,
      'reason', 'OFFICIAL_PROFILE_CONTEXT_INCOMPLETE',
      'message', 'Sınıf türü veya sınıf seviyesi belirlenmeden resmî çizelge uygulanamaz.'
    );
  end if;

  select count(*)
  into v_offerings
  from public.official_course_schedule_effective o
  where o.effective_academic_year = v_year
    and o.school_type = v_school_type
    and o.grade_level = v_class.grade_level
    and (o.school_subtype is null or o.school_subtype = v_class.school_subtype)
    and (o.program_type is null or o.program_type = v_class.program_type)
    and (o.field_name is null or o.field_name = v_field_name)
    and (o.branch_name is null or o.branch_name = v_branch_name);

  if v_offerings = 0 then
    return jsonb_build_object(
      'applied', false,
      'reason', 'OFFICIAL_SCHEDULE_NOT_FOUND',
      'message', 'Bu sınıf bağlamı için etkin resmî ders çizelgesi bulunamadı.'
    );
  end if;

  select
    count(*) filter (
      where lower(o.category) in ('zorunlu', 'uygulama', 'rehberlik')
        and cardinality(o.hour_options) = 1
    ),
    count(*) filter (where lower(o.category) = 'secmeli' or o.elective_group_key is not null),
    count(*) filter (where cardinality(o.hour_options) <> 1)
  into v_automatic, v_electives, v_ambiguous
  from public.official_course_schedule_effective o
  where o.effective_academic_year = v_year
    and o.school_type = v_school_type
    and o.grade_level = v_class.grade_level
    and (o.school_subtype is null or o.school_subtype = v_class.school_subtype)
    and (o.program_type is null or o.program_type = v_class.program_type)
    and (o.field_name is null or o.field_name = v_field_name)
    and (o.branch_name is null or o.branch_name = v_branch_name);

  select count(*)
  into v_preserved
  from public.class_course_requirements r
  join public.official_course_schedule_effective o on o.course_id = r.course_id
  where r.class_id = p_class_id
    and o.effective_academic_year = v_year
    and o.school_type = v_school_type
    and o.grade_level = v_class.grade_level
    and (o.school_subtype is null or o.school_subtype = v_class.school_subtype)
    and (o.program_type is null or o.program_type = v_class.program_type)
    and (o.field_name is null or o.field_name = v_field_name)
    and (o.branch_name is null or o.branch_name = v_branch_name)
    and (r.locked or coalesce(r.note, '') not like 'RESMI_CIZELGE:%');

  select coalesce(p.total_hour_target, p.total_hour_max, p.total_hour_min)
  into v_target
  from public.official_curriculum_profiles p
  where p.active
    and p.effective_academic_year = v_year
    and p.school_type = v_school_type
    and p.grade_level = v_class.grade_level
    and (p.school_subtype is null or p.school_subtype = v_class.school_subtype)
    and (p.program_type is null or p.program_type = v_class.program_type)
    and (p.field_name is null or p.field_name = v_field_name)
    and (p.branch_name is null or p.branch_name = v_branch_name)
  order by (p.branch_name is not null)::integer desc,
           (p.field_name is not null)::integer desc,
           (p.program_type is not null)::integer desc,
           (p.school_subtype is not null)::integer desc
  limit 1;

  if v_mode = 'PREVIEW' then
    return jsonb_build_object(
      'applied', false,
      'profile_found', v_target is not null,
      'offering_rules', v_offerings,
      'automatic_requirements', v_automatic,
      'elective_offerings', v_electives,
      'ambiguous_hour_offerings', v_ambiguous,
      'manual_or_locked_preserved', v_preserved,
      'expected_weekly_hours', v_target
    );
  end if;

  -- Keep the reusable offering pool in sync, including elective alternatives.
  v_synced := public.sync_official_course_offerings_for_class_v1(p_class_id);

  insert into public.class_course_requirements(
    class_id, course_id, weekly_hours, category, note, updated_at
  )
  select
    p_class_id,
    o.course_id,
    o.hour_options[1],
    lower(o.category),
    format('RESMI_CIZELGE:%s:%s:%s', v_year, coalesce(o.source_decision_no, 'KAYNAK_YOK'), o.id),
    now()
  from public.official_course_schedule_effective o
  where o.effective_academic_year = v_year
    and o.school_type = v_school_type
    and o.grade_level = v_class.grade_level
    and (o.school_subtype is null or o.school_subtype = v_class.school_subtype)
    and (o.program_type is null or o.program_type = v_class.program_type)
    and (o.field_name is null or o.field_name = v_field_name)
    and (o.branch_name is null or o.branch_name = v_branch_name)
    and lower(o.category) in ('zorunlu', 'uygulama', 'rehberlik')
    and cardinality(o.hour_options) = 1
  on conflict (class_id, course_id) do update
  set weekly_hours = excluded.weekly_hours,
      category = excluded.category,
      note = excluded.note,
      updated_at = now()
  where not class_course_requirements.locked
    and coalesce(class_course_requirements.note, '') like 'RESMI_CIZELGE:%';
  get diagnostics v_automatic = row_count;

  if v_target is not null then
    update public.school_classes
    set expected_weekly_hours = v_target,
        updated_at = now()
    where id = p_class_id
      and institution_code = public.current_tenant_code();
  end if;

  perform public.refresh_class_curriculum_status(p_class_id);

  return jsonb_build_object(
    'applied', true,
    'profile_found', v_target is not null,
    'offering_rules_synced', v_synced,
    'requirements_created_or_refreshed', v_automatic,
    'elective_offerings', v_electives,
    'ambiguous_hour_offerings', v_ambiguous,
    'manual_or_locked_preserved', v_preserved,
    'expected_weekly_hours', v_target
  );
end;
$$;

revoke all on function public.apply_official_curriculum_to_class_v2(uuid, text) from public;
grant execute on function public.apply_official_curriculum_to_class_v2(uuid, text) to authenticated;

-- A copied justified exception is a new administrator action, so retain its
-- reason while recording the current actor and time.  Without these fields,
-- the TTKB guard correctly rejects the copy as an unexplained mismatch.
create or replace function public.clone_class_curriculum(
  p_source_class_id uuid,
  p_target_class_id uuid,
  p_copy_teachers boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  perform public.open_permission_context('curriculum.manage');

  if p_source_class_id = p_target_class_id then
    raise exception 'SOURCE_AND_TARGET_MUST_DIFFER';
  end if;

  if not exists (
    select 1 from public.school_classes
    where id = p_source_class_id
      and active
      and institution_code = public.current_tenant_code()
  ) or not exists (
    select 1 from public.school_classes
    where id = p_target_class_id
      and active
      and institution_code = public.current_tenant_code()
  ) then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  insert into public.class_course_requirements(
    class_id, course_id, weekly_hours, category, source_template_id, locked, note, updated_at
  )
  select p_target_class_id, course_id, weekly_hours, category, source_template_id, false, note, now()
  from public.class_course_requirements
  where class_id = p_source_class_id
  on conflict (class_id, course_id) do update
  set weekly_hours = excluded.weekly_hours,
      category = excluded.category,
      source_template_id = excluded.source_template_id,
      note = excluded.note,
      updated_at = now()
  where not class_course_requirements.locked;
  get diagnostics v_count = row_count;

  update public.school_classes target
  set expected_weekly_hours = source.expected_weekly_hours,
      updated_at = now()
  from public.school_classes source
  where source.id = p_source_class_id
    and target.id = p_target_class_id
    and target.institution_code = public.current_tenant_code();

  if p_copy_teachers then
    insert into public.teacher_course_assignments(
      class_course_requirement_id,
      teacher_id,
      assigned_hours,
      assignment_group,
      note,
      created_by,
      is_justified_exception,
      exception_reason,
      exception_permission_status,
      exception_approved_by,
      exception_approved_at,
      updated_at
    )
    select
      target_requirement.id,
      assignment.teacher_id,
      assignment.assigned_hours,
      assignment.assignment_group,
      assignment.note,
      auth.uid(),
      assignment.is_justified_exception,
      assignment.exception_reason,
      case when assignment.is_justified_exception then 'NOT_ALLOWED' else null end,
      case when assignment.is_justified_exception then auth.uid() else null end,
      case when assignment.is_justified_exception then now() else null end,
      now()
    from public.teacher_course_assignments assignment
    join public.class_course_requirements source_requirement
      on source_requirement.id = assignment.class_course_requirement_id
      and source_requirement.class_id = p_source_class_id
    join public.class_course_requirements target_requirement
      on target_requirement.class_id = p_target_class_id
      and target_requirement.course_id = source_requirement.course_id
    on conflict (class_course_requirement_id, teacher_id, assignment_group) do update
    set assigned_hours = excluded.assigned_hours,
        note = excluded.note,
        is_justified_exception = excluded.is_justified_exception,
        exception_reason = excluded.exception_reason,
        exception_permission_status = excluded.exception_permission_status,
        exception_approved_by = excluded.exception_approved_by,
        exception_approved_at = excluded.exception_approved_at,
        updated_at = now();
  end if;

  perform public.refresh_class_curriculum_status(p_target_class_id);
  return v_count;
end;
$$;

revoke all on function public.clone_class_curriculum(uuid, uuid, boolean) from public;
grant execute on function public.clone_class_curriculum(uuid, uuid, boolean) to authenticated;
