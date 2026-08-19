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
