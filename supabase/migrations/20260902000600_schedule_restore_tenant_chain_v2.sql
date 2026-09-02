-- Tenant-safe, reversible timetable restore chain.
-- Keep the protected legacy RPC definition intact, but remove its client grant.

create index if not exists idx_schedule_restore_points_tenant_created
  on public.schedule_restore_points(institution_code,created_at desc,id);
create index if not exists idx_schedule_restore_rows_tenant_point
  on public.schedule_restore_point_rows(institution_code,restore_point_id,id);

create or replace function public.create_schedule_restore_point_permission_core_v2(
  p_label text default 'Çalışma programı',
  p_reason text default 'manual'
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_id uuid;
  v_count integer;
  v_tenant text:=public.current_tenant_code();
begin
  if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;

  select count(*)::integer into v_count
  from public.teacher_schedule
  where institution_code=v_tenant and active=true;

  insert into public.schedule_restore_points(
    institution_code,label,reason,row_count,created_by
  ) values(
    v_tenant,
    coalesce(nullif(trim(p_label),''),'Çalışma programı'),
    coalesce(nullif(trim(p_reason),''),'manual'),
    v_count,
    auth.uid()
  ) returning id into v_id;

  insert into public.schedule_restore_point_rows(
    institution_code,restore_point_id,snapshot
  )
  select v_tenant,v_id,to_jsonb(ts)
  from public.teacher_schedule ts
  where ts.institution_code=v_tenant and ts.active=true
  order by ts.weekday,ts.period,ts.class_name,ts.teacher_id,ts.id;

  return v_id;
end;
$$;

create or replace function public.create_schedule_restore_point_v2(
  p_label text default 'Çalışma programı',
  p_reason text default 'manual'
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_code text;
begin
  if public.has_permission('schedule.restore') then
    v_code:='schedule.restore';
  elsif public.has_permission('schedule.apply') then
    v_code:='schedule.apply';
  else
    raise exception 'PERMISSION_DENIED: schedule.restore';
  end if;
  perform set_config('app.okulos_permission',v_code,true);
  return public.create_schedule_restore_point_permission_core_v2(p_label,p_reason);
end;
$$;

create or replace function public.restore_schedule_restore_point_v2(
  p_restore_point_id uuid
)
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare
  v_count integer:=0;
  v_expected integer;
  v_snapshot_count integer;
  v_snapshot jsonb;
  v_assignment uuid;
  v_req uuid;
  v_course uuid;
  v_matches integer;
  v_teacher uuid;
  v_class uuid;
  v_subject text;
  v_row_id uuid;
  v_tenant text:=public.current_tenant_code();
begin
  perform public.open_permission_context('schedule.restore');
  if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtext('okulos:timetable:engine'));

  select row_count into v_expected
  from public.schedule_restore_points
  where id=p_restore_point_id and institution_code=v_tenant
  for update;
  if not found then raise exception 'RESTORE_POINT_NOT_FOUND_IN_TENANT'; end if;

  select count(*)::integer into v_snapshot_count
  from public.schedule_restore_point_rows
  where restore_point_id=p_restore_point_id and institution_code=v_tenant;
  if v_snapshot_count<>v_expected then
    raise exception 'RESTORE_POINT_TENANT_SNAPSHOT_MISMATCH';
  end if;
  if exists(
    select 1 from public.schedule_restore_point_rows
    where restore_point_id=p_restore_point_id
      and institution_code is distinct from v_tenant
  ) then
    raise exception 'RESTORE_POINT_CROSS_TENANT_ROWS';
  end if;

  -- The automatic pre-restore snapshot makes this operation reversible (redo).
  perform public.create_schedule_restore_point_permission_core_v2(
    'Geri yükleme öncesi otomatik kopya','before_restore'
  );

  delete from public.teacher_schedule
  where institution_code=v_tenant and active=true;

  for v_snapshot in
    select snapshot
    from public.schedule_restore_point_rows
    where restore_point_id=p_restore_point_id and institution_code=v_tenant
    order by id
  loop
    v_teacher:=(v_snapshot->>'teacher_id')::uuid;
    v_class:=nullif(v_snapshot->>'class_id','')::uuid;
    v_subject:=v_snapshot->>'subject';
    v_assignment:=nullif(v_snapshot->>'teacher_assignment_id','')::uuid;
    v_req:=nullif(v_snapshot->>'class_course_requirement_id','')::uuid;
    v_course:=nullif(v_snapshot->>'course_id','')::uuid;

    if v_assignment is null or v_req is null or v_course is null then
      select count(*),min(a.id),min(r.id),min(r.course_id)
      into v_matches,v_assignment,v_req,v_course
      from public.teacher_course_assignments a
      join public.class_course_requirements r
        on r.id=a.class_course_requirement_id
       and r.institution_code=v_tenant
      join public.course_catalog c on c.id=r.course_id
      where a.institution_code=v_tenant
        and a.teacher_id=v_teacher
        and r.class_id=v_class
        and lower(trim(c.name))=lower(trim(v_subject));
      if v_matches=0 then
        raise exception 'RESTORE_SEMANTIC_MAPPING_NOT_FOUND: % / %',v_subject,v_class;
      end if;
      if v_matches>1 then
        raise exception 'RESTORE_SEMANTIC_MAPPING_AMBIGUOUS: % / %',v_subject,v_class;
      end if;
    end if;

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
    where id=v_row_id and institution_code=v_tenant;
    v_count:=v_count+1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.create_schedule_restore_point_permission_core_v2(text,text)
  from public,anon,authenticated;
revoke all on function public.create_schedule_restore_point(text,text)
  from public,anon,authenticated;
revoke all on function public.restore_schedule_restore_point(uuid)
  from public,anon,authenticated;
revoke all on function public.create_schedule_restore_point_v2(text,text)
  from public,anon,authenticated;
revoke all on function public.restore_schedule_restore_point_v2(uuid)
  from public,anon,authenticated;
grant execute on function public.create_schedule_restore_point_v2(text,text)
  to authenticated;
grant execute on function public.restore_schedule_restore_point_v2(uuid)
  to authenticated;
