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
