-- Timetable generation gateway: synchronize derived plans, then enforce preflight readiness.
create or replace function public.generate_schedule_scenarios_v2()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql security definer set search_path=public as $$
declare v_sync record;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into v_sync from public.sync_all_quran_plans_to_timetable();
  perform public.assert_schedule_preparation_ready();
  return query select * from public.generate_schedule_scenarios();
end;$$;
revoke all on function public.generate_schedule_scenarios_v2() from public;
grant execute on function public.generate_schedule_scenarios_v2() to authenticated;

-- The central time profile is authoritative; legacy quality settings cannot diverge from it.
create or replace function public.enforce_generation_time_from_profile()
returns trigger language plpgsql security definer set search_path=public as $$
declare p public.schedule_time_profiles%rowtype;
begin
  select * into p from public.schedule_time_profiles where active=true limit 1;
  if found then new.teaching_days:=p.teaching_days;new.periods_per_day:=p.periods_per_day;end if;
  return new;
end;$$;
drop trigger if exists trg_enforce_generation_time_profile on public.schedule_generation_settings;
create trigger trg_enforce_generation_time_profile before insert or update on public.schedule_generation_settings
for each row execute function public.enforce_generation_time_from_profile();
-- Timetable V2 edge integrity.

-- NULL subgroup must not allow duplicate members for the same sync group/assignment.
create unique index if not exists uq_sync_member_assignment_fullclass
on public.schedule_sync_group_members(sync_group_id,teacher_assignment_id)
where subgroup_id is null;

create unique index if not exists uq_sync_member_assignment_subgroup
on public.schedule_sync_group_members(sync_group_id,teacher_assignment_id,subgroup_id)
where subgroup_id is not null;

-- A course-level block pattern must exactly account for the assignment hours where it is used.
create or replace function public.validate_course_block_pattern_against_assignments()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_sum integer;
begin
  if new.active and cardinality(new.block_pattern)>0 then
    select coalesce(sum(x),0)::integer into v_sum from unnest(new.block_pattern) x;
    if exists(
      select 1 from public.teacher_course_assignments a
      join public.class_course_requirements r on r.id=a.class_course_requirement_id
      where r.course_id=new.course_id and a.assigned_hours<>v_sum
    ) then raise exception 'BLOCK_PATTERN_MUST_EQUAL_ASSIGNED_HOURS';end if;
  end if;
  return new;
end;$$;
drop trigger if exists trg_validate_course_block_pattern_assignments on public.course_schedule_rules;
create trigger trg_validate_course_block_pattern_assignments before insert or update on public.course_schedule_rules
for each row execute function public.validate_course_block_pattern_against_assignments();

-- Teacher assignment changes must continue to agree with an active block rule.
create or replace function public.validate_assignment_against_course_block_pattern()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_pattern smallint[];v_sum integer;
begin
  select cr.block_pattern into v_pattern
  from public.class_course_requirements r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active
  where r.id=new.class_course_requirement_id;
  if found and cardinality(v_pattern)>0 then
    select coalesce(sum(x),0)::integer into v_sum from unnest(v_pattern) x;
    if new.assigned_hours<>v_sum then raise exception 'ASSIGNED_HOURS_MUST_MATCH_BLOCK_PATTERN';end if;
  end if;
  return new;
end;$$;
drop trigger if exists trg_validate_assignment_block_pattern on public.teacher_course_assignments;
create trigger trg_validate_assignment_block_pattern before insert or update on public.teacher_course_assignments
for each row execute function public.validate_assignment_against_course_block_pattern();

-- Resolve legacy restore-point rows to semantic identities when possible; never silently restore detached timetable data.
create or replace function public.restore_schedule_restore_point(p_restore_point_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer:=0;v_snapshot jsonb;v_assignment uuid;v_req uuid;v_course uuid;v_matches integer;v_teacher uuid;v_class uuid;v_subject text;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if not exists(select 1 from public.schedule_restore_points where id=p_restore_point_id) then raise exception 'RESTORE_POINT_NOT_FOUND';end if;
  perform public.create_schedule_restore_point('Geri yükleme öncesi otomatik kopya','before_restore');
  delete from public.teacher_schedule where active=true;
  for v_snapshot in select snapshot from public.schedule_restore_point_rows where restore_point_id=p_restore_point_id order by id loop
    v_teacher:=(v_snapshot->>'teacher_id')::uuid;v_class:=nullif(v_snapshot->>'class_id','')::uuid;v_subject:=v_snapshot->>'subject';
    v_assignment:=nullif(v_snapshot->>'teacher_assignment_id','')::uuid;v_req:=nullif(v_snapshot->>'class_course_requirement_id','')::uuid;v_course:=nullif(v_snapshot->>'course_id','')::uuid;
    if v_assignment is null or v_req is null or v_course is null then
      select count(*),min(a.id),min(r.id),min(r.course_id) into v_matches,v_assignment,v_req,v_course
      from public.teacher_course_assignments a join public.class_course_requirements r on r.id=a.class_course_requirement_id
      join public.course_catalog c on c.id=r.course_id
      where a.teacher_id=v_teacher and r.class_id=v_class and lower(trim(c.name))=lower(trim(v_subject));
      if v_matches=0 then raise exception 'RESTORE_SEMANTIC_MAPPING_NOT_FOUND: % / %',v_subject,v_class;end if;
      if v_matches>1 then raise exception 'RESTORE_SEMANTIC_MAPPING_AMBIGUOUS: % / %',v_subject,v_class;end if;
    end if;
    perform public.upsert_schedule_slot_v2(
      v_assignment,(v_snapshot->>'weekday')::smallint,(v_snapshot->>'period')::smallint,
      nullif(v_snapshot->>'classroom_id','')::uuid,nullif(v_snapshot->>'subgroup_id','')::uuid,null,
      coalesce((v_snapshot->>'locked')::boolean,false),'manual'
    );
    update public.teacher_schedule set
      source_kind=coalesce(nullif(v_snapshot->>'source_kind',''),'manual'),
      sync_group_id=nullif(v_snapshot->>'sync_group_id','')::uuid,
      block_key=nullif(v_snapshot->>'block_key','')::uuid
    where teacher_assignment_id=v_assignment and weekday=(v_snapshot->>'weekday')::smallint and period=(v_snapshot->>'period')::smallint and active=true;
    v_count:=v_count+1;
  end loop;
  perform public.assert_schedule_publishable();
  return v_count;
end;$$;
revoke all on function public.restore_schedule_restore_point(uuid) from public;
grant execute on function public.restore_schedule_restore_point(uuid) to authenticated;
-- Comprehensive soft-quality score for scenario ranking.
create or replace function public.calculate_schedule_scenario_score_v2(p_scenario_id uuid)
returns integer language plpgsql stable security definer set search_path=public as $$
declare s public.schedule_generation_settings%rowtype;score bigint:=0;v integer;
begin
  select * into s from public.schedule_generation_settings where id=true;
  score:=score+(select count(*)*10000 from public.schedule_unplaced_items where scenario_id=p_scenario_id);
  score:=score+(select count(*)*5000 from public.schedule_room_assignment_issues where scenario_id=p_scenario_id);

  -- Teacher timetable gaps.
  select coalesce(sum(gaps),0)::integer into v from (
    select teacher_id,weekday,greatest(max(period)-min(period)+1-count(*),0) gaps
    from public.schedule_scenario_rows where scenario_id=p_scenario_id group by teacher_id,weekday
  ) q;score:=score+v*coalesce(s.gap_penalty,8);

  -- Class timetable gaps (subgroups count as one occupied slot).
  select coalesce(sum(gaps),0)::integer into v from (
    select class_id,weekday,greatest(max(period)-min(period)+1-count(distinct period),0) gaps
    from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null group by class_id,weekday
  ) q;score:=score+v*greatest(coalesce(s.gap_penalty,8)/2,1);

  -- Late lessons.
  select coalesce(sum(greatest(period-6,0)),0)::integer into v from public.schedule_scenario_rows where scenario_id=p_scenario_id;
  score:=score+v*coalesce(s.late_period_penalty,2);

  -- Explicit teacher slot preferences: avoid is a penalty, prefer is a reward.
  select coalesce(sum(case p.preference when 'avoid' then p.weight else -p.weight end),0)::integer into v
  from public.schedule_scenario_rows r join public.teacher_schedule_preferences p
    on p.teacher_id=r.teacher_id and p.weekday=r.weekday and p.period=r.period and p.active
  where r.scenario_id=p_scenario_id;score:=score+v;

  -- Preferred free day violation.
  select coalesce(sum(q.c*12),0)::integer into v from (
    select r.teacher_id,count(*) c from public.schedule_scenario_rows r join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
    where r.scenario_id=p_scenario_id and tc.preferred_free_day=r.weekday group by r.teacher_id
  ) q;score:=score+v;

  -- Course preferred day/period and last-period avoidance.
  select coalesce(sum(
    (case when cardinality(cr.preferred_days)>0 and not(r.weekday=any(cr.preferred_days)) then 6 else 0 end)+
    (case when cardinality(cr.preferred_periods)>0 and not(r.period=any(cr.preferred_periods)) then 4 else 0 end)+
    (case when cr.avoid_last_period and r.period=(select periods_per_day from public.schedule_time_profiles where active=true limit 1) then 10 else 0 end)
  ),0)::integer into v
  from public.schedule_scenario_rows r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active
  where r.scenario_id=p_scenario_id;score:=score+v;

  -- Teacher daily load imbalance: compact but not excessively stacked schedules.
  select coalesce(sum(maxc-minc),0)::integer into v from (
    select teacher_id,max(c) maxc,min(c) minc from (
      select teacher_id,weekday,count(*) c from public.schedule_scenario_rows where scenario_id=p_scenario_id group by teacher_id,weekday
    ) d group by teacher_id
  ) q;score:=score+v*2;

  -- Class daily load imbalance.
  select coalesce(sum(maxc-minc),0)::integer into v from (
    select class_id,max(c) maxc,min(c) minc from (
      select class_id,weekday,count(distinct period) c from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null group by class_id,weekday
    ) d group by class_id
  ) q;score:=score+v*3;

  -- Avoid unnecessary room changes for same class/course.
  select coalesce(sum(greatest(room_count-1,0)),0)::integer into v from (
    select class_id,course_id,count(distinct classroom_id) room_count from public.schedule_scenario_rows
    where scenario_id=p_scenario_id and classroom_id is not null group by class_id,course_id
  ) q;score:=score+v*2;

  return greatest(least(score,2147483647),-2147483648)::integer;
end;$$;

create or replace function public.rescore_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  v:=public.calculate_schedule_scenario_score_v2(p_scenario_id);
  update public.schedule_scenarios set score=v,
    unplaced_count=(select count(*) from public.schedule_unplaced_items where scenario_id=p_scenario_id),
    row_count=(select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario_id)
  where id=p_scenario_id;
  return v;
end;$$;
revoke all on function public.calculate_schedule_scenario_score_v2(uuid) from public;
grant execute on function public.calculate_schedule_scenario_score_v2(uuid) to authenticated;
revoke all on function public.rescore_schedule_scenario_v2(uuid) from public;
grant execute on function public.rescore_schedule_scenario_v2(uuid) to authenticated;
-- A sync group represents ONE simultaneous contiguous block. A weekly synchronized course may own multiple block groups.
alter table public.schedule_sync_groups
  add column if not exists source_type text,
  add column if not exists source_id uuid,
  add column if not exists source_block_index smallint;

create unique index if not exists uq_schedule_sync_source_block
on public.schedule_sync_groups(source_type,source_id,source_block_index)
where source_type is not null and source_id is not null and source_block_index is not null;

create or replace function public.sync_quran_plan_to_timetable(p_plan_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  q public.quran_split_plans%rowtype;v_course uuid;v_req uuid;v_a1 uuid;v_a2 uuid;v_h1 integer;v_h2 integer;v_matches integer;
  v_pattern smallint[];v_rule_pattern smallint[];v_sum integer;v_idx integer:=0;v_block smallint;v_group uuid;v_first uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into q from public.quran_split_plans where id=p_plan_id and enabled=true;
  if not found then raise exception 'QURAN_SPLIT_PLAN_REQUIRED';end if;

  select count(*),min(r.course_id),min(r.id) into v_matches,v_course,v_req
  from public.class_course_requirements r join public.course_catalog c on c.id=r.course_id
  where r.class_id=q.class_id and (lower(c.name) like '%kur''an%' or lower(c.name) like '%kur’an%' or lower(c.name) like '%kuran%');
  if v_matches=0 then raise exception 'QURAN_COURSE_REQUIREMENT_NOT_FOUND';end if;
  if v_matches>1 then raise exception 'QURAN_COURSE_REQUIREMENT_AMBIGUOUS';end if;

  select id,assigned_hours into v_a1,v_h1 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=q.teacher_1_id limit 1;
  select id,assigned_hours into v_a2,v_h2 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=q.teacher_2_id limit 1;
  if v_a1 is null or v_a2 is null then raise exception 'QURAN_TEACHER_ASSIGNMENTS_REQUIRED';end if;
  if v_h1<>v_h2 then raise exception 'QURAN_GROUP_ASSIGNMENT_HOURS_MUST_MATCH';end if;

  select block_pattern into v_rule_pattern from public.course_schedule_rules where course_id=v_course and active=true;
  if v_rule_pattern is not null and cardinality(v_rule_pattern)>0 then
    select sum(x)::integer into v_sum from unnest(v_rule_pattern) x;
    if v_sum<>v_h1 then raise exception 'QURAN_BLOCK_PATTERN_MUST_MATCH_ASSIGNED_HOURS';end if;
    v_pattern:=v_rule_pattern;
  else
    select array_agg(1::smallint) into v_pattern from generate_series(1,v_h1);
  end if;

  -- Remove obsolete auto-generated blocks only; manual sync groups are untouched.
  delete from public.schedule_sync_groups where source_type='quran_split_plan' and source_id=q.id
    and coalesce(source_block_index,0)>cardinality(v_pattern);

  foreach v_block in array v_pattern loop
    v_idx:=v_idx+1;
    insert into public.schedule_sync_groups(name,class_id,required_simultaneous,note,active,source_type,source_id,source_block_index)
    values('Kur’an Paralel · '||(select composite_key from public.school_classes where id=q.class_id)||' · '||q.academic_year||' · Blok '||v_idx,
      q.class_id,true,'Kur’an split planından otomatik oluşturulan paralel blok',true,'quran_split_plan',q.id,v_idx)
    on conflict(source_type,source_id,source_block_index) where source_type is not null and source_id is not null and source_block_index is not null
    do update set name=excluded.name,class_id=excluded.class_id,required_simultaneous=true,note=excluded.note,active=true
    returning id into v_group;
    if v_first is null then v_first:=v_group;end if;
    delete from public.schedule_sync_group_members where sync_group_id=v_group;
    insert into public.schedule_sync_group_members(sync_group_id,teacher_assignment_id,subgroup_id,block_hours)
    values(v_group,v_a1,q.group_1_id,v_block),(v_group,v_a2,q.group_2_id,v_block);
  end loop;
  update public.quran_split_plans set sync_group_id=v_first,updated_at=now() where id=q.id;
  return v_first;
end;$$;

-- Quran readiness now verifies the entire auto-generated synchronized block series, not only one group id.
create or replace function public.quran_plan_sync_status(p_plan_id uuid)
returns text language plpgsql stable security definer set search_path=public as $$
declare q public.quran_split_plans%rowtype;v_req uuid;v_a1 uuid;v_a2 uuid;v_h1 integer;v_h2 integer;v_s1 integer;v_s2 integer;v_matches integer;
begin
  select * into q from public.quran_split_plans where id=p_plan_id and enabled=true;if not found then return 'PLAN_NOT_FOUND';end if;
  select count(*),min(r.id) into v_matches,v_req from public.class_course_requirements r join public.course_catalog c on c.id=r.course_id
    where r.class_id=q.class_id and (lower(c.name) like '%kur''an%' or lower(c.name) like '%kur’an%' or lower(c.name) like '%kuran%');
  if v_matches<>1 then return case when v_matches=0 then 'COURSE_NOT_FOUND' else 'COURSE_AMBIGUOUS' end;end if;
  select id,assigned_hours into v_a1,v_h1 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=q.teacher_1_id limit 1;
  select id,assigned_hours into v_a2,v_h2 from public.teacher_course_assignments where class_course_requirement_id=v_req and teacher_id=q.teacher_2_id limit 1;
  if v_a1 is null or v_a2 is null then return 'ASSIGNMENT_MISSING';end if;
  select coalesce(sum(m.block_hours),0)::integer into v_s1 from public.schedule_sync_groups g join public.schedule_sync_group_members m on m.sync_group_id=g.id where g.active and g.source_type='quran_split_plan' and g.source_id=q.id and m.teacher_assignment_id=v_a1;
  select coalesce(sum(m.block_hours),0)::integer into v_s2 from public.schedule_sync_groups g join public.schedule_sync_group_members m on m.sync_group_id=g.id where g.active and g.source_type='quran_split_plan' and g.source_id=q.id and m.teacher_assignment_id=v_a2;
  if v_s1<>v_h1 or v_s2<>v_h2 then return 'SYNC_HOURS_MISMATCH';end if;
  return 'READY';
end;$$;
revoke all on function public.sync_quran_plan_to_timetable(uuid) from public;
grant execute on function public.sync_quran_plan_to_timetable(uuid) to authenticated;
revoke all on function public.quran_plan_sync_status(uuid) from public;
grant execute on function public.quran_plan_sync_status(uuid) to authenticated;
create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
active_profile as (select count(*)::integer n from public.schedule_time_profiles where active=true),
curriculum_bad as (select count(*)::integer n from public.get_curriculum_readiness(null) where ready=false),
constraint_missing as (select count(*)::integer n from public.profiles p left join public.teacher_schedule_constraints c on c.teacher_id=p.user_id where p.role='teacher' and c.teacher_id is null),
locked_unlinked as (select count(*)::integer n from public.teacher_schedule where active and locked and (course_id is null or class_course_requirement_id is null or teacher_assignment_id is null)),
locked_mismatch as (
 select count(*)::integer n from public.teacher_schedule ts
 left join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id
 left join public.class_course_requirements r on r.id=ts.class_course_requirement_id
 where ts.active and ts.locked and ts.teacher_assignment_id is not null and (a.id is null or r.id is null or a.teacher_id<>ts.teacher_id or a.class_course_requirement_id<>r.id or r.class_id is distinct from ts.class_id or r.course_id<>ts.course_id)
),
locked_unavailable as (
 select count(*)::integer n from public.teacher_schedule ts join public.teacher_unavailability u on u.teacher_id=ts.teacher_id and u.weekday=ts.weekday and u.period=ts.period and u.active where ts.active and ts.locked
),
locked_over_assignment as (
 select count(*)::integer n from (select ts.teacher_assignment_id,count(*) c,max(a.assigned_hours) h from public.teacher_schedule ts join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id where ts.active and ts.locked group by ts.teacher_assignment_id having count(*)>max(a.assigned_hours)) q
),
sync_empty as (select count(*)::integer n from public.schedule_sync_groups g where g.active and not exists(select 1 from public.schedule_sync_group_members m where m.sync_group_id=g.id)),
sync_length_mismatch as (
 select count(*)::integer n from (select g.id,min(m.block_hours) mn,max(m.block_hours) mx from public.schedule_sync_groups g join public.schedule_sync_group_members m on m.sync_group_id=g.id where g.active and g.required_simultaneous group by g.id having min(m.block_hours)<>max(m.block_hours)) q
),
sync_bad_subgroups as (
 select count(*)::integer n from public.schedule_sync_group_members m join public.teacher_course_assignments a on a.id=m.teacher_assignment_id join public.class_course_requirements r on r.id=a.class_course_requirement_id left join public.class_subgroups sg on sg.id=m.subgroup_id where m.subgroup_id is not null and (sg.id is null or sg.class_id<>r.class_id or not sg.active)
),
sync_empty_students as (select count(*)::integer n from public.schedule_sync_group_members m where m.subgroup_id is not null and not exists(select 1 from public.class_subgroup_students s where s.subgroup_id=m.subgroup_id)),
sync_overlap_students as (
 select count(*)::integer n from (
   select g.id from public.schedule_sync_groups g
   join public.schedule_sync_group_members m1 on m1.sync_group_id=g.id and m1.subgroup_id is not null
   join public.schedule_sync_group_members m2 on m2.sync_group_id=g.id and m2.id>m1.id and m2.subgroup_id is not null
   where g.active and exists(select 1 from public.class_subgroup_students a join public.class_subgroup_students b on b.student_id=a.student_id where a.subgroup_id=m1.subgroup_id and b.subgroup_id=m2.subgroup_id)
   group by g.id
 ) q
),
quran_bad as (select count(*)::integer n from public.quran_split_plans q where q.enabled and public.quran_plan_sync_status(q.id)<>'READY'),
room_rule_without_room as (
 select count(*)::integer n from public.lesson_room_rules lr where lr.active and not exists(select 1 from public.classrooms c where c.active and (lr.required_room_type is null or c.room_type=lr.required_room_type) and (lr.required_department is null or coalesce(c.department,'')=lr.required_department) and (lr.required_hardware='{}'::jsonb or c.hardware @> lr.required_hardware))
),
block_assignment_bad as (
 select count(*)::integer n from public.teacher_course_assignments a join public.class_course_requirements r on r.id=a.class_course_requirement_id join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cardinality(cr.block_pattern)>0
 where (select coalesce(sum(x),0) from unnest(cr.block_pattern) x)<>a.assigned_hours
)
select * from (
 select 'zaman','ACTIVE_TIME_PROFILE','error',case when n=1 then 0 else n end,'Tam olarak bir aktif okul zaman şablonu bulunmalıdır.' from active_profile where n<>1 union all
 select 'müfredat','CURRICULUM_NOT_READY','error',n,'Sınıf ders yükü, öğretmen saatleri veya TTKB alan-ders eşleşmesi eksik.' from curriculum_bad where n>0 union all
 select 'öğretmen','TEACHER_CONSTRAINT_ROW_MISSING','error',n,'Her öğretmenin açık bir program kısıt kaydı bulunmalıdır.' from constraint_missing where n>0 union all
 select 'kilit','LOCKED_ROW_UNLINKED','error',n,'Kilitli program satırı müfredat ve öğretmen atamasına bağlı değil.' from locked_unlinked where n>0 union all
 select 'kilit','LOCKED_ROW_SEMANTIC_MISMATCH','error',n,'Kilitli satırın sınıf/ders/öğretmen kimliği atama kaydıyla uyuşmuyor.' from locked_mismatch where n>0 union all
 select 'kilit','LOCKED_TEACHER_UNAVAILABLE','error',n,'Kilitli saat öğretmenin kesin uygun değil kaydıyla çakışıyor.' from locked_unavailable where n>0 union all
 select 'kilit','LOCKED_HOURS_EXCEED_ASSIGNMENT','error',n,'Kilitli saat sayısı öğretmenin o ders için atanmış haftalık saatini aşıyor.' from locked_over_assignment where n>0 union all
 select 'eşzamanlı','SYNC_GROUP_EMPTY','error',n,'Aktif eşzamanlı grubun en az bir öğretmen-ders üyesi olmalıdır.' from sync_empty where n>0 union all
 select 'eşzamanlı','SYNC_MEMBER_BLOCK_LENGTH_MISMATCH','error',n,'Aynı paralel bloktaki tüm üyelerin ardışık blok uzunluğu aynı olmalıdır.' from sync_length_mismatch where n>0 union all
 select 'eşzamanlı','SYNC_SUBGROUP_MISMATCH','error',n,'Eşzamanlı grup alt grubu, öğretmen atamasının sınıfına ait değil.' from sync_bad_subgroups where n>0 union all
 select 'eşzamanlı','SYNC_SUBGROUP_HAS_NO_STUDENTS','error',n,'Programda kullanılacak alt grupta öğrenci üyeliği bulunmuyor.' from sync_empty_students where n>0 union all
 select 'eşzamanlı','SYNC_SUBGROUP_STUDENT_OVERLAP','error',n,'Aynı paralel bloktaki alt gruplarda ortak öğrenci bulunuyor.' from sync_overlap_students where n>0 union all
 select 'kur-an','QURAN_WEEKLY_SYNC_INCOMPLETE','error',n,'Etkin Kur’an bölme planının tüm haftalık paralel blokları/öğretmen atamaları tamamlanmamış.' from quran_bad where n>0 union all
 select 'derslik','ROOM_RULE_HAS_NO_MATCHING_ROOM','error',n,'Derslik kuralını karşılayan aktif fiziksel derslik bulunmuyor.' from room_rule_without_room where n>0 union all
 select 'blok','BLOCK_PATTERN_ASSIGNMENT_MISMATCH','error',n,'Ders blok deseninin toplam saati ilgili öğretmen-ders atama saatiyle tam eşleşmiyor.' from block_assignment_bad where n>0
) q;
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;