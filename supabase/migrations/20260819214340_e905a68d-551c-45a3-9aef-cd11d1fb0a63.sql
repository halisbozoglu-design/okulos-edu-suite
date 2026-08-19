-- Bridge Quran split plans to Timetable V2 without duplicate data entry.
alter table public.quran_split_plans add column if not exists sync_group_id uuid references public.schedule_sync_groups(id) on delete set null;

create or replace function public.sync_quran_plan_to_timetable(p_plan_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_plan public.quran_split_plans%rowtype;v_course uuid;v_req uuid;v_a1 uuid;v_a2 uuid;v_group uuid;v_matches integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into v_plan from public.quran_split_plans where id=p_plan_id and enabled=true;
  if not found then raise exception 'QURAN_SPLIT_PLAN_REQUIRED';end if;
  select count(*),min(r.course_id),min(r.id) into v_matches,v_course,v_req
  from public.class_course_requirements r join public.course_catalog c on c.id=r.course_id
  where r.class_id=v_plan.class_id and (lower(c.name) like '%kur''an%' or lower(c.name) like '%kur’an%' or lower(c.name) like '%kuran%');
  if v_matches=0 then raise exception 'QURAN_COURSE_REQUIREMENT_NOT_FOUND';end if;
  if v_matches>1 then raise exception 'QURAN_COURSE_REQUIREMENT_AMBIGUOUS';end if;
  select id into v_a1 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=v_plan.teacher_1_id limit 1;
  select id into v_a2 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=v_plan.teacher_2_id limit 1;
  if v_a1 is null or v_a2 is null then raise exception 'QURAN_TEACHER_ASSIGNMENTS_REQUIRED';end if;
  if v_plan.sync_group_id is not null and exists(select 1 from public.schedule_sync_groups where id=v_plan.sync_group_id) then v_group:=v_plan.sync_group_id;
  else
    insert into public.schedule_sync_groups(name,class_id,required_simultaneous,note,active)
    values('Kur’an Paralel · '||(select composite_key from public.school_classes where id=v_plan.class_id)||' · '||v_plan.academic_year,v_plan.class_id,true,'Kur’an split planından otomatik oluşturuldu',true)
    on conflict(name) do update set active=true,class_id=excluded.class_id returning id into v_group;
    update public.quran_split_plans set sync_group_id=v_group,updated_at=now() where id=v_plan.id;
  end if;
  delete from public.schedule_sync_group_members where sync_group_id=v_group;
  insert into public.schedule_sync_group_members(sync_group_id,teacher_assignment_id,subgroup_id,block_hours)
  values(v_group,v_a1,v_plan.group_1_id,1),(v_group,v_a2,v_plan.group_2_id,1);
  return v_group;
end;$$;
revoke all on function public.sync_quran_plan_to_timetable(uuid) from public;
grant execute on function public.sync_quran_plan_to_timetable(uuid) to authenticated;

create or replace function public.assign_quran_parallel_lesson(
  p_class_id uuid,p_academic_year text,p_weekday smallint,p_period smallint,p_subject text,
  p_classroom_1 uuid default null,p_classroom_2 uuid default null
)
returns integer language plpgsql security definer set search_path=public as $$
declare
  v_plan public.quran_split_plans%rowtype;v_group uuid;v_m1 public.schedule_sync_group_members%rowtype;v_m2 public.schedule_sync_group_members%rowtype;v_s1 uuid;v_s2 uuid;v_block uuid:=gen_random_uuid();
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
-- Bounded repair/backtracking pass for generated scenarios.
create or replace function public.repair_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare
  u record;a public.teacher_course_assignments%rowtype;r public.class_course_requirements%rowtype;c public.course_catalog%rowtype;
  tp public.schedule_time_profiles%rowtype;tc public.teacher_schedule_constraints%rowtype;
  d smallint;p smallint;d2 smallint;p2 smallint;blocker record;repaired integer:=0;placed boolean;alt boolean;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into tp from public.schedule_time_profiles where active=true limit 1;
  for u in select * from public.schedule_unplaced_items where scenario_id=p_scenario_id and block_hours=1 and reason<>'SYNC_GROUP_NO_COMMON_SLOT' order by created_at loop
    select * into a from public.teacher_course_assignments where id=u.teacher_assignment_id;
    select * into r from public.class_course_requirements where id=a.class_course_requirement_id;
    select * into c from public.course_catalog where id=r.course_id;
    select * into tc from public.teacher_schedule_constraints where teacher_id=a.teacher_id;
    placed:=false;
    -- First retry direct placement after the full scenario exists.
    foreach d in array tp.teaching_days loop
      for p in 1..tp.periods_per_day loop
        if exists(select 1 from public.teacher_unavailability x where x.teacher_id=a.teacher_id and x.weekday=d and x.period=p and x.active) then continue;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.teacher_id=a.teacher_id and x.weekday=d and x.period=p) then continue;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.class_id=r.class_id and x.weekday=d and x.period=p) then continue;end if;
        if tc.max_daily_hours is not null and public.scenario_teacher_daily_count(p_scenario_id,a.teacher_id,d)+1>tc.max_daily_hours then continue;end if;
        if tc.max_working_days is not null and public.scenario_teacher_working_days(p_scenario_id,a.teacher_id,d)>tc.max_working_days then continue;end if;
        insert into public.schedule_scenario_rows(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject,course_id)
        values(p_scenario_id,r.id,a.id,a.teacher_id,r.class_id,d,p,(select class_name from public.school_classes where id=r.class_id),c.name,c.id);
        delete from public.schedule_unplaced_items where id=u.id;repaired:=repaired+1;placed:=true;exit;
      end loop;if placed then exit;end if;
    end loop;
    if placed then continue;end if;

    -- One-step backtracking: move exactly one ordinary blocker, never a locked/sync/block lesson.
    foreach d in array tp.teaching_days loop
      for p in 1..tp.periods_per_day loop
        if exists(select 1 from public.teacher_unavailability x where x.teacher_id=a.teacher_id and x.weekday=d and x.period=p and x.active) then continue;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.teacher_id=a.teacher_id and x.weekday=d and x.period=p) then continue;end if;
        select * into blocker from public.schedule_scenario_rows x
        where x.scenario_id=p_scenario_id and x.class_id=r.class_id and x.weekday=d and x.period=p and not x.locked and x.sync_group_id is null
          and (x.block_key is null or (select count(*) from public.schedule_scenario_rows b where b.scenario_id=p_scenario_id and b.block_key=x.block_key)=1)
        limit 1;
        if not found then continue;end if;
        alt:=false;
        foreach d2 in array tp.teaching_days loop
          for p2 in 1..tp.periods_per_day loop
            if d2=d and p2=p then continue;end if;
            if exists(select 1 from public.teacher_unavailability x where x.teacher_id=blocker.teacher_id and x.weekday=d2 and x.period=p2 and x.active) then continue;end if;
            if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.id<>blocker.id and x.teacher_id=blocker.teacher_id and x.weekday=d2 and x.period=p2) then continue;end if;
            if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.id<>blocker.id and x.class_id=blocker.class_id and x.weekday=d2 and x.period=p2) then continue;end if;
            update public.schedule_scenario_rows set weekday=d2,period=p2,classroom_id=null where id=blocker.id;
            alt:=true;exit;
          end loop;if alt then exit;end if;
        end loop;
        if alt then
          insert into public.schedule_scenario_rows(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject,course_id)
          values(p_scenario_id,r.id,a.id,a.teacher_id,r.class_id,d,p,(select class_name from public.school_classes where id=r.class_id),c.name,c.id);
          delete from public.schedule_unplaced_items where id=u.id;repaired:=repaired+1;placed:=true;exit;
        end if;
      end loop;if placed then exit;end if;
    end loop;
  end loop;
  delete from public.schedule_room_assignment_issues where scenario_id=p_scenario_id;
  update public.schedule_scenario_rows set classroom_id=null where scenario_id=p_scenario_id and not locked;
  perform * from public.assign_classrooms_to_scenario(p_scenario_id);
  update public.schedule_scenarios set
    unplaced_count=(select count(*) from public.schedule_unplaced_items where scenario_id=p_scenario_id),
    row_count=(select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario_id),
    score=(select count(*)*10000 from public.schedule_unplaced_items where scenario_id=p_scenario_id)
      +(select count(*)*5000 from public.schedule_room_assignment_issues where scenario_id=p_scenario_id)
      +coalesce((select sum(gaps)*8 from (select teacher_id,weekday,greatest(max(period)-min(period)+1-count(*),0) gaps from public.schedule_scenario_rows where scenario_id=p_scenario_id group by teacher_id,weekday) q),0)
  where id=p_scenario_id;
  return repaired;
end;$$;
revoke all on function public.repair_schedule_scenario_v2(uuid) from public;
grant execute on function public.repair_schedule_scenario_v2(uuid) to authenticated;
-- Ensure every teacher has an explicit constraint row; keep legacy solver time setting synchronized with central profile.
insert into public.teacher_schedule_constraints(teacher_id,max_consecutive_hours)
select user_id,4 from public.profiles where role='teacher'
on conflict(teacher_id) do nothing;

create or replace function public.ensure_teacher_schedule_constraint()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.role='teacher' then
    insert into public.teacher_schedule_constraints(teacher_id,max_consecutive_hours) values(new.user_id,4)
    on conflict(teacher_id) do nothing;
  end if;
  return new;
end;$$;
drop trigger if exists trg_ensure_teacher_schedule_constraint on public.profiles;
create trigger trg_ensure_teacher_schedule_constraint
after insert or update of role on public.profiles
for each row execute function public.ensure_teacher_schedule_constraint();

create or replace function public.sync_active_time_profile_to_solver_settings()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.active=true then
    update public.schedule_generation_settings set teaching_days=new.teaching_days,periods_per_day=new.periods_per_day,updated_at=now() where id=true;
  end if;
  return new;
end;$$;
drop trigger if exists trg_sync_time_profile_solver on public.schedule_time_profiles;
create trigger trg_sync_time_profile_solver
after insert or update of teaching_days,periods_per_day,active on public.schedule_time_profiles
for each row execute function public.sync_active_time_profile_to_solver_settings();

update public.schedule_generation_settings s
set teaching_days=p.teaching_days,periods_per_day=p.periods_per_day,updated_at=now()
from public.schedule_time_profiles p where p.active=true and s.id=true;

create or replace function public.validate_sync_group_member_hours()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_hours integer;
begin
  select assigned_hours into v_hours from public.teacher_course_assignments where id=new.teacher_assignment_id;
  if v_hours is null then raise exception 'TEACHER_ASSIGNMENT_NOT_FOUND';end if;
  if new.block_hours>v_hours then raise exception 'SYNC_BLOCK_EXCEEDS_ASSIGNED_HOURS';end if;
  return new;
end;$$;
drop trigger if exists trg_validate_sync_group_member_hours on public.schedule_sync_group_members;
create trigger trg_validate_sync_group_member_hours before insert or update on public.schedule_sync_group_members
for each row execute function public.validate_sync_group_member_hours();
-- Standard Web Push subscriptions for OkulOS PWA. Firebase is not required.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  platform text not null default 'web' check (platform in ('web','ios','android')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(endpoint)
);

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id) where active=true;

alter table public.push_subscriptions enable row level security;
grant select,insert,update,delete on public.push_subscriptions to authenticated;

create policy "users manage own push subscriptions"
on public.push_subscriptions for all to authenticated
using (user_id=auth.uid())
with check (user_id=auth.uid());

create or replace function public.register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null,
  p_platform text default 'web'
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if nullif(trim(p_endpoint),'') is null or nullif(trim(p_p256dh),'') is null or nullif(trim(p_auth),'') is null then
    raise exception 'INVALID_PUSH_SUBSCRIPTION';
  end if;
  if p_platform not in ('web','ios','android') then raise exception 'INVALID_PLATFORM'; end if;

  insert into public.push_subscriptions(user_id,endpoint,p256dh,auth,user_agent,platform,active,updated_at)
  values(auth.uid(),trim(p_endpoint),trim(p_p256dh),trim(p_auth),nullif(trim(p_user_agent),''),p_platform,true,now())
  on conflict(endpoint) do update set
    user_id=excluded.user_id,p256dh=excluded.p256dh,auth=excluded.auth,
    user_agent=excluded.user_agent,platform=excluded.platform,active=true,updated_at=now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.register_push_subscription(text,text,text,text,text) from public;
grant execute on function public.register_push_subscription(text,text,text,text,text) to authenticated;

create or replace function public.disable_push_subscription(p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  update public.push_subscriptions set active=false,updated_at=now()
  where user_id=auth.uid() and endpoint=p_endpoint;
  return found;
end;
$$;
revoke all on function public.disable_push_subscription(text) from public;
grant execute on function public.disable_push_subscription(text) to authenticated;
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