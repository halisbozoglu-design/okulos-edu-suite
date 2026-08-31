-- Copying a curriculum with teachers is itself an explicit user action. Keep
-- an already confirmed manual assignment as such; do not resurrect the retired
-- justification workflow or make the clone fail the area check.

create or replace function public.clone_class_curriculum(p_source_class_id uuid, p_target_class_id uuid, p_copy_teachers boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  perform public.open_permission_context('curriculum.manage');
  if p_source_class_id = p_target_class_id then raise exception 'SOURCE_AND_TARGET_CLASS_SAME'; end if;
  if not exists(select 1 from public.school_classes where id = p_source_class_id and public.tenant_row_allowed(institution_code)) then raise exception 'SOURCE_CLASS_NOT_FOUND'; end if;
  if not exists(select 1 from public.school_classes where id = p_target_class_id and public.tenant_row_allowed(institution_code)) then raise exception 'TARGET_CLASS_NOT_FOUND'; end if;

  insert into public.class_course_requirements(class_id, course_id, weekly_hours, category, source_template_id, locked, note, updated_at)
  select p_target_class_id, course_id, weekly_hours, category, source_template_id, false, note, now()
  from public.class_course_requirements where class_id = p_source_class_id
  on conflict (class_id, course_id) do update set weekly_hours = excluded.weekly_hours, category = excluded.category,
    source_template_id = excluded.source_template_id, note = excluded.note, updated_at = now()
  where not class_course_requirements.locked;
  get diagnostics v_count = row_count;

  update public.school_classes target set expected_weekly_hours = source.expected_weekly_hours, updated_at = now()
  from public.school_classes source where source.id = p_source_class_id and target.id = p_target_class_id
    and target.institution_code = public.current_tenant_code();

  if p_copy_teachers then
    insert into public.teacher_course_assignments(
      class_course_requirement_id, teacher_id, assigned_hours, assignment_group, note,
      created_by, is_manual_override, updated_at
    )
    select target_requirement.id, assignment.teacher_id, assignment.assigned_hours,
      assignment.assignment_group, assignment.note, auth.uid(),
      assignment.is_manual_override, now()
    from public.teacher_course_assignments assignment
    join public.class_course_requirements source_requirement
      on source_requirement.id = assignment.class_course_requirement_id
      and source_requirement.class_id = p_source_class_id
    join public.class_course_requirements target_requirement
      on target_requirement.class_id = p_target_class_id
      and target_requirement.course_id = source_requirement.course_id
    on conflict (class_course_requirement_id, teacher_id, assignment_group) do update set
      assigned_hours = excluded.assigned_hours, note = excluded.note,
      is_manual_override = excluded.is_manual_override, updated_at = now();
  end if;
  perform public.refresh_class_curriculum_status(p_target_class_id);
  return v_count;
end;
$$;

revoke all on function public.clone_class_curriculum(uuid, uuid, boolean) from public, anon;
grant execute on function public.clone_class_curriculum(uuid, uuid, boolean) to authenticated;
