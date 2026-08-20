grant select,insert,update,delete on public.teacher_schedule,public.schedule_time_profiles,public.teacher_schedule_constraints,
  public.teacher_unavailability,public.teacher_schedule_preferences,public.course_schedule_rules,
  public.schedule_sync_groups,public.schedule_sync_group_members,public.schedule_rule_overrides to authenticated;

grant select,insert,update,delete on public.vice_principals,public.duty_rotation,public.teacher_duty_assignments,
  public.duty_locations,public.teacher_duty_cycle_members,public.duty_month_locks,public.duty_day_notes to authenticated;

grant select,insert,update,delete on public.payroll_activity_entries,public.payroll_rule_registry to authenticated;

grant select,insert,update,delete on public.course_catalog,public.curriculum_templates,public.curriculum_template_courses,
  public.class_course_requirements,public.teacher_course_assignments,public.school_classes,public.classrooms,
  public.lesson_room_rules,public.quran_split_plans,public.class_subgroups,public.class_subgroup_students to authenticated;

grant select,insert,update,delete on public.norm_rule_sets,public.norm_rule_bands,public.teaching_areas,public.area_course_permissions to authenticated;

create policy "delegated duty managers manage month locks" on public.duty_month_locks
for all to authenticated using(public.has_permission('duty.lock') or public.has_permission('duty.manage'))
with check(public.has_permission('duty.lock') or public.has_permission('duty.manage'));
create policy "delegated duty managers manage day notes" on public.duty_day_notes
for all to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));

create policy "delegated payroll users read activities" on public.payroll_activity_entries
for select to authenticated using(public.has_permission('payroll.view') or public.has_permission('payroll.edit') or public.has_permission('payroll.approve'));
create policy "delegated schedule users read timetable" on public.teacher_schedule
for select to authenticated using(public.has_permission('schedule.view') or public.has_permission('schedule.edit') or public.has_permission('schedule.generate') or public.has_permission('schedule.publish'));