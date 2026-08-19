-- Extend delegated task permissions across the remaining active management modules.

-- Vekalet: suggestions are read-operational, final assignments are write-operational.
alter function public.suggest_substitutes_for_day(date) rename to suggest_substitutes_permission_core_v2;
create or replace function public.suggest_substitutes_for_day(p_date date default current_date)
returns table(absence_lesson_id uuid,period smallint,class_id uuid,class_name text,subject text,candidate_user_id uuid,candidate_name text,candidate_role public.app_role,priority integer,weekly_load bigint,reason text)
language plpgsql stable security definer set search_path=public as $$
begin
  if not(public.has_permission('substitutes.view') or public.has_permission('substitutes.manage')) then raise exception 'PERMISSION_DENIED: substitutes.view';end if;
  perform set_config('app.okulos_permission',case when public.has_permission('substitutes.manage') then 'substitutes.manage' else 'substitutes.view' end,true);
  return query select * from public.suggest_substitutes_permission_core_v2(p_date);
end;$$;

alter function public.assign_substitutes_for_day(date) rename to assign_substitutes_permission_core_v2;
create or replace function public.assign_substitutes_for_day(p_date date default current_date)
returns table(assignment_id uuid,absence_lesson_id uuid,substitute_user_id uuid,substitute_name text,period smallint,class_name text,subject text)
language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('substitutes.manage');
  return query select * from public.assign_substitutes_permission_core_v2(p_date);
end;$$;

-- Curriculum/class-course assignment RPCs.
alter function public.apply_curriculum_template(uuid,uuid,boolean) rename to apply_curriculum_template_permission_core_v2;
create or replace function public.apply_curriculum_template(p_template_id uuid,p_class_id uuid,p_replace boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('curriculum.manage');
  return public.apply_curriculum_template_permission_core_v2(p_template_id,p_class_id,p_replace);
end;$$;

alter function public.clone_class_curriculum(uuid,uuid,boolean) rename to clone_class_curriculum_permission_core_v2;
create or replace function public.clone_class_curriculum(p_source_class_id uuid,p_target_class_id uuid,p_copy_teachers boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('curriculum.manage');
  return public.clone_class_curriculum_permission_core_v2(p_source_class_id,p_target_class_id,p_copy_teachers);
end;$$;

alter function public.assign_teacher_to_class_course(uuid,uuid,smallint,text) rename to assign_teacher_to_class_course_permission_core_v2;
create or replace function public.assign_teacher_to_class_course(p_requirement_id uuid,p_teacher_id uuid,p_hours smallint default null,p_group text default 'main')
returns uuid language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('curriculum.manage');
  return public.assign_teacher_to_class_course_permission_core_v2(p_requirement_id,p_teacher_id,p_hours,p_group);
end;$$;

-- Quran group planning.
alter function public.prepare_quran_split(uuid,text,uuid,uuid) rename to prepare_quran_split_permission_core_v2;
create or replace function public.prepare_quran_split(p_class_id uuid,p_academic_year text,p_teacher_1 uuid,p_teacher_2 uuid)
returns public.quran_split_plans language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('quran.manage');
  return public.prepare_quran_split_permission_core_v2(p_class_id,p_academic_year,p_teacher_1,p_teacher_2);
end;$$;

alter function public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) rename to assign_quran_parallel_lesson_permission_core_v2;
create or replace function public.assign_quran_parallel_lesson(
  p_class_id uuid,p_academic_year text,p_weekday smallint,p_period smallint,p_subject text,
  p_classroom_1 uuid default null,p_classroom_2 uuid default null
)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('quran.manage');
  return public.assign_quran_parallel_lesson_permission_core_v2(p_class_id,p_academic_year,p_weekday,p_period,p_subject,p_classroom_1,p_classroom_2);
end;$$;

-- Direct table policies for delegated module managers.
create policy "delegated curriculum managers manage catalog" on public.course_catalog
for all to authenticated using(public.has_permission('curriculum.manage')) with check(public.has_permission('curriculum.manage'));
create policy "delegated curriculum managers manage templates" on public.curriculum_templates
for all to authenticated using(public.has_permission('curriculum.manage')) with check(public.has_permission('curriculum.manage'));
create policy "delegated curriculum managers manage template courses" on public.curriculum_template_courses
for all to authenticated using(public.has_permission('curriculum.manage')) with check(public.has_permission('curriculum.manage'));
create policy "delegated curriculum managers manage requirements" on public.class_course_requirements
for all to authenticated using(public.has_permission('curriculum.manage')) with check(public.has_permission('curriculum.manage'));
create policy "delegated curriculum managers manage teacher course assignments" on public.teacher_course_assignments
for all to authenticated using(public.has_permission('curriculum.manage')) with check(public.has_permission('curriculum.manage'));

create policy "delegated class managers manage classes" on public.school_classes
for all to authenticated using(public.has_permission('classes.manage')) with check(public.has_permission('classes.manage'));
create policy "delegated classroom managers manage classrooms" on public.classrooms
for all to authenticated using(public.has_permission('classrooms.manage')) with check(public.has_permission('classrooms.manage'));
create policy "delegated classroom managers manage room rules" on public.lesson_room_rules
for all to authenticated using(public.has_permission('classrooms.manage')) with check(public.has_permission('classrooms.manage'));

create policy "delegated quran managers manage split plans" on public.quran_split_plans
for all to authenticated using(public.has_permission('quran.manage')) with check(public.has_permission('quran.manage'));
create policy "delegated quran managers manage subgroups" on public.class_subgroups
for all to authenticated using(public.has_permission('quran.manage') or public.has_permission('classes.manage')) with check(public.has_permission('quran.manage') or public.has_permission('classes.manage'));
create policy "delegated quran managers manage subgroup students" on public.class_subgroup_students
for all to authenticated using(public.has_permission('quran.manage') or public.has_permission('classes.manage')) with check(public.has_permission('quran.manage') or public.has_permission('classes.manage'));

create policy "delegated norm managers manage rule sets" on public.norm_rule_sets
for all to authenticated using(public.has_permission('norm.manage')) with check(public.has_permission('norm.manage'));
create policy "delegated norm managers manage rule bands" on public.norm_rule_bands
for all to authenticated using(public.has_permission('norm.manage')) with check(public.has_permission('norm.manage'));
create policy "delegated norm managers manage teaching areas" on public.teaching_areas
for all to authenticated using(public.has_permission('norm.manage')) with check(public.has_permission('norm.manage'));
create policy "delegated norm managers manage area permissions" on public.area_course_permissions
for all to authenticated using(public.has_permission('norm.manage')) with check(public.has_permission('norm.manage'));

create policy "delegated substitute managers read absences" on public.absences
for select to authenticated using(public.has_permission('substitutes.view') or public.has_permission('substitutes.manage'));
create policy "delegated substitute managers read assignment audit" on public.assignment_audit_log
for select to authenticated using(public.has_permission('substitutes.manage'));

revoke all on function public.suggest_substitutes_for_day(date),public.assign_substitutes_for_day(date),public.apply_curriculum_template(uuid,uuid,boolean),public.clone_class_curriculum(uuid,uuid,boolean),public.assign_teacher_to_class_course(uuid,uuid,smallint,text),public.prepare_quran_split(uuid,text,uuid,uuid),public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) from public;
grant execute on function public.suggest_substitutes_for_day(date),public.assign_substitutes_for_day(date),public.apply_curriculum_template(uuid,uuid,boolean),public.clone_class_curriculum(uuid,uuid,boolean),public.assign_teacher_to_class_course(uuid,uuid,smallint,text),public.prepare_quran_split(uuid,text,uuid,uuid),public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) to authenticated;
