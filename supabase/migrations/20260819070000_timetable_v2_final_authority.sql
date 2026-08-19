-- FINAL AUTHORITY for OkulOS Timetable V2.
-- This migration intentionally comes after bundled 06xx migrations that reintroduced older schedule/import/publish functions.

-- 1) Pre-solver readiness: fail early before expensive scenario generation.
create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
active_profile as (select count(*)::integer n from public.schedule_time_profiles where active=true),
curriculum_bad as (select count(*)::integer n from public.get_curriculum_readiness(null) where ready=false),
constraint_missing as (
  select count(*)::integer n from public.profiles p left join public.teacher_schedule_constraints c on c.teacher_id=p.user_id
  where p.role='teacher' and c.teacher_id is null
),
sync_empty as (
  select count(*)::integer n from public.schedule_sync_groups g where g.active and not exists(select 1 from public.schedule_sync_group_members m where m.sync_group_id=g.id)
),
sync_bad_subgroups as (
  select count(*)::integer n from public.schedule_sync_group_members m
  join public.teacher_course_assignments a on a.id=m.teacher_assignment_id
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  left join public.class_subgroups sg on sg.id=m.subgroup_id
  where m.subgroup_id is not null and (sg.id is null or sg.class_id<>r.class_id or not sg.active)
),
sync_empty_students as (
  select count(*)::integer n from public.schedule_sync_group_members m
  where m.subgroup_id is not null and not exists(select 1 from public.class_subgroup_students s where s.subgroup_id=m.subgroup_id)
),
quran_unsynced as (
  select count(*)::integer n from public.quran_split_plans q where q.enabled=true and (q.sync_group_id is null or not exists(select 1 from public.schedule_sync_groups g where g.id=q.sync_group_id and g.active))
),
room_rule_without_room as (
  select count(*)::integer n from public.lesson_room_rules lr where lr.active and not exists(
    select 1 from public.classrooms c where c.active
      and (lr.required_room_type is null or c.room_type=lr.required_room_type)
      and (lr.required_department is null or coalesce(c.department,'')=lr.required_department)
      and (lr.required_hardware='{}'::jsonb or c.hardware @> lr.required_hardware)
  )
),
block_sum_bad as (
  select count(*)::integer n from public.teacher_course_assignments a
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cardinality(cr.block_pattern)>0
  where (select coalesce(sum(x),0) from unnest(cr.block_pattern) x)>a.assigned_hours
)
select * from (
  select 'zaman','ACTIVE_TIME_PROFILE','error',case when n=1 then 0 else n end,'Tam olarak bir aktif okul zaman şablonu bulunmalıdır.' from active_profile where n<>1 union all
  select 'müfredat','CURRICULUM_NOT_READY','error',n,'Sınıf ders yükü, öğretmen saatleri veya TTKB alan-ders eşleşmesi eksik.' from curriculum_bad where n>0 union all
  select 'öğretmen','TEACHER_CONSTRAINT_ROW_MISSING','error',n,'Her öğretmenin açık bir program kısıt kaydı bulunmalıdır.' from constraint_missing where n>0 union all
  select 'eşzamanlı','SYNC_GROUP_EMPTY','error',n,'Aktif eşzamanlı grubun en az bir öğretmen-ders üyesi olmalıdır.' from sync_empty where n>0 union all
  select 'eşzamanlı','SYNC_SUBGROUP_MISMATCH','error',n,'Eşzamanlı grup alt grubu, öğretmen atamasının sınıfına ait değil.' from sync_bad_subgroups where n>0 union all
  select 'eşzamanlı','SYNC_SUBGROUP_HAS_NO_STUDENTS','error',n,'Programda kullanılacak alt grupta öğrenci üyeliği bulunmuyor.' from sync_empty_students where n>0 union all
  select 'kur-an','QURAN_PLAN_NOT_SYNCED','error',n,'Etkin Kur’an bölme planı henüz program eşzamanlı grubuna bağlanmamış.' from quran_unsynced where n>0 union all
  select 'derslik','ROOM_RULE_HAS_NO_MATCHING_ROOM','error',n,'Derslik kuralını karşılayan aktif bir fiziksel derslik bulunmuyor.' from room_rule_without_room where n>0 union all
  select 'blok','BLOCK_PATTERN_EXCEEDS_ASSIGNMENT','error',n,'Ders blok desenindeki toplam saat öğretmen atama saatini aşıyor.' from block_sum_bad where n>0
) q;
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;

create or replace function public.assert_schedule_preparation_ready()
returns boolean language plpgsql stable security definer set search_path=public as $$
declare v_bad record;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select * into v_bad from public.get_schedule_preparation_readiness() where status='error' limit 1;
  if found then raise exception 'SCHEDULE_PREPARATION_NOT_READY: % (% kayıt) - %',v_bad.code,v_bad.affected_count,v_bad.detail;end if;
  return true;
end;$$;
revoke all on function public.assert_schedule_preparation_ready() from public;
grant execute on function public.assert_schedule_preparation_ready() to authenticated;

-- 2) Best-effort automatic bridge for enabled Quran split plans. Missing teacher/course assignment remains a visible blocker.
create or replace function public.sync_all_quran_plans_to_timetable()
returns table(synced integer,failed integer)
language plpgsql security definer set search_path=public as $$
declare q record;s integer:=0;f integer:=0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  for q in select id from public.quran_split_plans where enabled=true loop
    begin
      perform public.sync_quran_plan_to_timetable(q.id);s:=s+1;
    exception when others then
      f:=f+1;
    end;
  end loop;
  return query select s,f;
end;$$;
revoke all on function public.sync_all_quran_plans_to_timetable() from public;
grant execute on function public.sync_all_quran_plans_to_timetable() to authenticated;

-- 3) Semantic import is the final import authority.
create or replace function public.import_weekly_schedule(p_file_name text,p_file_type text,p_rows jsonb)
returns table(import_batch_id uuid,imported_rows integer)
language plpgsql security definer set search_path=public as $$
declare v_batch uuid;v_row jsonb;v_teacher_id uuid;v_class_id uuid;v_classroom_id uuid;v_subgroup_id uuid;v_assignment_id uuid;v_match_count integer;v_count integer:=0;v_schedule_id uuid;v_is_group_split boolean;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if p_file_type not in ('xlsx','xls','csv','txt') then raise exception 'UNSUPPORTED_FILE_TYPE';end if;
  if jsonb_typeof(p_rows)<>'array' then raise exception 'INVALID_ROWS';end if;
  insert into public.schedule_import_batches(imported_by,file_name,file_type,row_count) values(auth.uid(),p_file_name,p_file_type,jsonb_array_length(p_rows)) returning id into v_batch;
  for v_row in select value from jsonb_array_elements(p_rows) loop
    select user_id into v_teacher_id from public.profiles where lower(trim(full_name))=lower(trim(v_row->>'teacherName')) and role='teacher';
    if v_teacher_id is null then raise exception 'TEACHER_NOT_FOUND: %',v_row->>'teacherName';end if;
    select id into v_class_id from public.school_classes where composite_key=public.normalize_class_key(v_row->>'className',v_row->>'programType') and active=true;
    if v_class_id is null then raise exception 'CLASS_NOT_FOUND: %',v_row->>'className';end if;
    select count(*),min(a.id) into v_match_count,v_assignment_id from public.teacher_course_assignments a
      join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.class_id=v_class_id
      join public.course_catalog c on c.id=r.course_id
      where a.teacher_id=v_teacher_id and lower(trim(c.name))=lower(trim(v_row->>'subject'));
    if v_match_count=0 then raise exception 'IMPORT_ASSIGNMENT_NOT_FOUND: % / % / %',v_row->>'teacherName',v_row->>'className',v_row->>'subject';end if;
    if v_match_count>1 then raise exception 'IMPORT_ASSIGNMENT_AMBIGUOUS: % / % / %',v_row->>'teacherName',v_row->>'className',v_row->>'subject';end if;
    v_classroom_id:=null;
    if coalesce(trim(v_row->>'classroom'),'')<>'' then select id into v_classroom_id from public.classrooms where lower(trim(name))=lower(trim(v_row->>'classroom')) and active=true;if v_classroom_id is null then raise exception 'CLASSROOM_NOT_FOUND: %',v_row->>'classroom';end if;end if;
    v_is_group_split:=coalesce((v_row->>'isGroupSplit')::boolean,false);v_subgroup_id:=null;
    if v_is_group_split then
      if coalesce(trim(v_row->>'subgroupKey'),'')='' then raise exception 'SUBGROUP_REQUIRED';end if;
      select id into v_subgroup_id from public.class_subgroups where class_id=v_class_id and lower(trim(subgroup_key))=lower(trim(v_row->>'subgroupKey')) and active=true;
      if v_subgroup_id is null then raise exception 'SUBGROUP_NOT_FOUND: %',v_row->>'subgroupKey';end if;
    end if;
    select id into v_schedule_id from public.teacher_schedule where teacher_id=v_teacher_id and weekday=(v_row->>'dayOfWeek')::smallint and period=(v_row->>'periodNumber')::smallint and active=true limit 1;
    v_schedule_id:=public.upsert_schedule_slot_v2(v_assignment_id,(v_row->>'dayOfWeek')::smallint,(v_row->>'periodNumber')::smallint,v_classroom_id,v_subgroup_id,v_schedule_id,false,'import');
    insert into public.schedule_audit_log(schedule_id,actor_user_id,action,new_row) select v_schedule_id,auth.uid(),'imported_v2',to_jsonb(ts) from public.teacher_schedule ts where ts.id=v_schedule_id;
    v_count:=v_count+1;
  end loop;
  return query select v_batch,v_count;
end;$$;
revoke all on function public.import_weekly_schedule(text,text,jsonb) from public;
grant execute on function public.import_weekly_schedule(text,text,jsonb) to authenticated;

-- 4) Quran parallel manual assignment is semantic and synchronized.
create or replace function public.assign_quran_parallel_lesson(
  p_class_id uuid,p_academic_year text,p_weekday smallint,p_period smallint,p_subject text,p_classroom_1 uuid default null,p_classroom_2 uuid default null
)
returns integer language plpgsql security definer set search_path=public as $$
declare v_plan public.quran_split_plans%rowtype;v_group uuid;v_m1 public.schedule_sync_group_members%rowtype;v_m2 public.schedule_sync_group_members%rowtype;v_s1 uuid;v_s2 uuid;v_block uuid:=gen_random_uuid();
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into v_plan from public.quran_split_plans where class_id=p_class_id and academic_year=p_academic_year and enabled=true;
  if not found then raise exception 'QURAN_SPLIT_PLAN_REQUIRED';end if;
  v_group:=public.sync_quran_plan_to_timetable(v_plan.id);
  select * into v_m1 from public.schedule_sync_group_members where sync_group_id=v_group and subgroup_id=v_plan.group_1_id limit 1;
  select * into v_m2 from public.schedule_sync_group_members where sync_group_id=v_group and subgroup_id=v_plan.group_2_id limit 1;
  v_s1:=public.upsert_schedule_slot_v2(v_m1.teacher_assignment_id,p_weekday,p_period,p_classroom_1,v_plan.group_1_id,null,false,'manual');
  v_s2:=public.upsert_schedule_slot_v2(v_m2.teacher_assignment_id,p_weekday,p_period,p_classroom_2,v_plan.group_2_id,null,false,'manual');
  update public.teacher_schedule set sync_group_id=v_group,block_key=v_block where id in(v_s1,v_s2);
  return 2;
end;$$;
revoke all on function public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) from public;
grant execute on function public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) to authenticated;

-- 5) Publication always passes V2 hard validation after all older bundled publication migrations.
create or replace function public.publish_current_schedule(
  p_effective_from date,p_academic_year text default null,p_title text default 'Haftalık Ders Programı',p_note text default null
)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_publication_id uuid;v_hash text;v_count integer;v_payload text;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if p_effective_from is null then raise exception 'EFFECTIVE_DATE_REQUIRED';end if;
  perform public.assert_schedule_publishable();
  select count(*)::integer into v_count from public.teacher_schedule where active=true;
  if v_count=0 then raise exception 'EMPTY_SCHEDULE_CANNOT_BE_PUBLISHED';end if;
  select string_agg(concat_ws('|',ts.teacher_id::text,coalesce(ts.class_id::text,''),coalesce(ts.course_id::text,''),coalesce(ts.class_course_requirement_id::text,''),coalesce(ts.teacher_assignment_id::text,''),ts.weekday,ts.period,ts.class_name,ts.subject,coalesce(ts.classroom_id::text,''),coalesce(ts.subgroup_id::text,''),coalesce(ts.sync_group_id::text,''),coalesce(ts.block_key::text,'')),E'\n' order by ts.teacher_id,ts.weekday,ts.period,ts.id)
  into v_payload from public.teacher_schedule ts where ts.active=true;
  v_hash:=encode(digest(coalesce(v_payload,''),'sha256'),'hex');
  insert into public.schedule_publications(effective_from,academic_year,title,note,schedule_hash,row_count,published_by)
  values(p_effective_from,nullif(trim(p_academic_year),''),coalesce(nullif(trim(p_title),''),'Haftalık Ders Programı'),nullif(trim(p_note),''),v_hash,v_count,auth.uid()) returning id into v_publication_id;
  insert into public.schedule_publication_rows(publication_id,source_schedule_id,teacher_id,class_id,weekday,period,class_name,subject,classroom,classroom_id,subgroup_id,subgroup_key,is_group_split,snapshot)
  select v_publication_id,ts.id,ts.teacher_id,ts.class_id,ts.weekday,ts.period,ts.class_name,ts.subject,ts.classroom,ts.classroom_id,ts.subgroup_id,ts.subgroup_key,ts.is_group_split,to_jsonb(ts)
  from public.teacher_schedule ts where ts.active=true order by ts.teacher_id,ts.weekday,ts.period,ts.id;
  return v_publication_id;
end;$$;
revoke all on function public.publish_current_schedule(date,text,text,text) from public;
grant execute on function public.publish_current_schedule(date,text,text,text) to authenticated;
