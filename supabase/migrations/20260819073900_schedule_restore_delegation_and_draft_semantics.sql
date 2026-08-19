-- Delegated schedule restore authority and draft-safe restore semantics.
-- Restoring a working draft must preserve hard runtime validity without requiring publish completeness.

alter function public.create_schedule_restore_point(text,text)
rename to create_schedule_restore_point_permission_core_v2;

create or replace function public.create_schedule_restore_point(
  p_label text,
  p_reason text default 'manual'
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_code text;
begin
  if public.has_permission('schedule.restore') then
    v_code:='schedule.restore';
  elsif public.has_permission('schedule.apply') then
    -- Scenario apply creates an automatic restore point before replacing the working schedule.
    v_code:='schedule.apply';
  else
    raise exception 'PERMISSION_DENIED: schedule.restore';
  end if;
  perform set_config('app.okulos_permission',v_code,true);
  return public.create_schedule_restore_point_permission_core_v2(p_label,p_reason);
end;
$$;

create or replace function public.restore_schedule_restore_point(p_restore_point_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_count integer:=0;
  v_snapshot jsonb;
  v_assignment uuid;
  v_req uuid;
  v_course uuid;
  v_matches integer;
  v_teacher uuid;
  v_class uuid;
  v_subject text;
  v_row_id uuid;
begin
  perform public.open_permission_context('schedule.restore');
  perform pg_advisory_xact_lock(hashtext('okulos:timetable:engine'));

  if not exists(select 1 from public.schedule_restore_points where id=p_restore_point_id) then
    raise exception 'RESTORE_POINT_NOT_FOUND';
  end if;

  -- Always preserve the current working state before restoring another one.
  perform public.create_schedule_restore_point_permission_core_v2(
    'Geri yükleme öncesi otomatik kopya',
    'before_restore'
  );

  delete from public.teacher_schedule where active=true;

  for v_snapshot in
    select snapshot
    from public.schedule_restore_point_rows
    where restore_point_id=p_restore_point_id
    order by id
  loop
    v_teacher:=(v_snapshot->>'teacher_id')::uuid;
    v_class:=nullif(v_snapshot->>'class_id','')::uuid;
    v_subject:=v_snapshot->>'subject';
    v_assignment:=nullif(v_snapshot->>'teacher_assignment_id','')::uuid;
    v_req:=nullif(v_snapshot->>'class_course_requirement_id','')::uuid;
    v_course:=nullif(v_snapshot->>'course_id','')::uuid;

    -- Legacy snapshots may not contain semantic ids. Resolve only when the mapping is unambiguous.
    if v_assignment is null or v_req is null or v_course is null then
      select count(*),min(a.id),min(r.id),min(r.course_id)
      into v_matches,v_assignment,v_req,v_course
      from public.teacher_course_assignments a
      join public.class_course_requirements r on r.id=a.class_course_requirement_id
      join public.course_catalog c on c.id=r.course_id
      where a.teacher_id=v_teacher
        and r.class_id=v_class
        and lower(trim(c.name))=lower(trim(v_subject));

      if v_matches=0 then
        raise exception 'RESTORE_SEMANTIC_MAPPING_NOT_FOUND: % / %',v_subject,v_class;
      end if;
      if v_matches>1 then
        raise exception 'RESTORE_SEMANTIC_MAPPING_AMBIGUOUS: % / %',v_subject,v_class;
      end if;
    end if;

    -- Use the proven semantic write core. Runtime triggers reject hard conflicts/invalid rows.
    v_row_id:=public.upsert_schedule_slot_permission_core_v2(
      v_assignment,
      (v_snapshot->>'weekday')::smallint,
      (v_snapshot->>'period')::smallint,
      nullif(v_snapshot->>'classroom_id','')::uuid,
      nullif(v_snapshot->>'subgroup_id','')::uuid,
      null,
      coalesce((v_snapshot->>'locked')::boolean,false),
      coalesce(nullif(v_snapshot->>'source_kind',''),'manual')
    );

    update public.teacher_schedule
    set sync_group_id=nullif(v_snapshot->>'sync_group_id','')::uuid,
        block_key=nullif(v_snapshot->>'block_key','')::uuid,
        updated_at=now()
    where id=v_row_id;

    v_count:=v_count+1;
  end loop;

  -- Intentionally no assert_schedule_publishable() here.
  -- A restore point is a WORKING-DRAFT checkpoint. Publication remains protected separately.
  return v_count;
end;
$$;

-- Delegated restore operators must be able to inspect checkpoints and the working schedule they restore.
create policy "delegated schedule restorers read restore points" on public.schedule_restore_points
for select to authenticated using(public.has_permission('schedule.restore'));

create policy "delegated schedule restorers read restore rows" on public.schedule_restore_point_rows
for select to authenticated using(public.has_permission('schedule.restore'));

create policy "delegated schedule restorers read timetable" on public.teacher_schedule
for select to authenticated using(public.has_permission('schedule.restore'));

revoke all on function public.create_schedule_restore_point(text,text) from public;
revoke all on function public.restore_schedule_restore_point(uuid) from public;
grant execute on function public.create_schedule_restore_point(text,text),public.restore_schedule_restore_point(uuid) to authenticated;
