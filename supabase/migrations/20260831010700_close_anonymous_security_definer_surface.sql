-- No curriculum or timetable SECURITY DEFINER endpoint is anonymous.  Historical
-- PUBLIC grants are removed explicitly, then only intended authenticated endpoints
-- are re-granted. Trigger/core helpers remain internal.

revoke all on function public.apply_official_course_transition_to_drafts_v1(uuid,boolean),
  public.apply_official_curriculum_to_class_v2(uuid,text),
  public.approve_official_source_change_v2(uuid,text),
  public.assign_teacher_to_class_course_v2(uuid,uuid,smallint,text,boolean,text),
  public.assign_teacher_to_class_course_v3(uuid,uuid,smallint,text,boolean,text,date,date),
  public.audit_teacher_course_assignment_exception_v1(),
  public.capture_publication_curriculum_fingerprint_v1(),
  public.get_schedule_integrity_report(),
  public.get_schedule_integrity_report_pre_timebound_exception_v1(),
  public.get_teacher_course_assignment_exceptions_v1(),
  public.get_teacher_course_assignment_exceptions_v2(),
  public.list_official_course_transition_mappings_v1(),
  public.list_official_source_changes_v1(),
  public.mark_official_source_change_applied_v1(uuid,text),
  public.preview_official_course_transition_impact_v1(uuid),
  public.upsert_official_course_transition_mapping_v1(uuid,uuid,text,date,text,text)
from public, anon, authenticated;

grant execute on function public.apply_official_course_transition_to_drafts_v1(uuid,boolean),
  public.apply_official_curriculum_to_class_v2(uuid,text),
  public.approve_official_source_change_v2(uuid,text),
  public.assign_teacher_to_class_course_v2(uuid,uuid,smallint,text,boolean,text),
  public.assign_teacher_to_class_course_v3(uuid,uuid,smallint,text,boolean,text,date,date),
  public.get_schedule_integrity_report(),
  public.get_teacher_course_assignment_exceptions_v1(),
  public.get_teacher_course_assignment_exceptions_v2(),
  public.list_official_course_transition_mappings_v1(),
  public.list_official_source_changes_v1(),
  public.mark_official_source_change_applied_v1(uuid,text),
  public.preview_official_course_transition_impact_v1(uuid),
  public.upsert_official_course_transition_mapping_v1(uuid,uuid,text,date,text,text)
to authenticated;
