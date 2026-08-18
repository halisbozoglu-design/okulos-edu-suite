create or replace function public.import_weekly_schedule(
  p_file_name text,
  p_file_type text,
  p_rows jsonb
)
returns table(import_batch_id uuid, imported_rows integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch uuid;
  v_row jsonb;
  v_teacher_id uuid;
  v_class_id uuid;
  v_classroom_id uuid;
  v_subgroup_id uuid;
  v_count integer := 0;
  v_schedule_id uuid;
  v_is_group_split boolean;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_file_type not in ('xlsx','xls','csv','txt') then raise exception 'UNSUPPORTED_FILE_TYPE'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'INVALID_ROWS'; end if;

  insert into public.schedule_import_batches(imported_by,file_name,file_type,row_count)
  values (auth.uid(), p_file_name, p_file_type, jsonb_array_length(p_rows))
  returning id into v_batch;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    select user_id into v_teacher_id
    from public.profiles
    where lower(trim(full_name)) = lower(trim(v_row->>'teacherName')) and role = 'teacher';
    if v_teacher_id is null then raise exception 'TEACHER_NOT_FOUND: %', v_row->>'teacherName'; end if;

    select id into v_class_id
    from public.school_classes
    where composite_key = public.normalize_class_key(v_row->>'className', v_row->>'programType');
    if v_class_id is null then raise exception 'CLASS_NOT_FOUND: %', v_row->>'className'; end if;

    v_classroom_id := null;
    if coalesce(trim(v_row->>'classroom'),'') <> '' then
      select id into v_classroom_id from public.classrooms
      where lower(trim(name)) = lower(trim(v_row->>'classroom')) and active = true;
      if v_classroom_id is null then raise exception 'CLASSROOM_NOT_FOUND: %', v_row->>'classroom'; end if;
    end if;

    v_is_group_split := coalesce((v_row->>'isGroupSplit')::boolean,false);
    v_subgroup_id := null;
    if v_is_group_split then
      if coalesce(trim(v_row->>'subgroupKey'),'') = '' then raise exception 'SUBGROUP_REQUIRED'; end if;
      select id into v_subgroup_id
      from public.class_subgroups
      where class_id = v_class_id
        and lower(trim(subgroup_key)) = lower(trim(v_row->>'subgroupKey'))
        and active = true;
      if v_subgroup_id is null then raise exception 'SUBGROUP_NOT_FOUND: %', v_row->>'subgroupKey'; end if;
    end if;

    insert into public.teacher_schedule(
      teacher_id, weekday, period, class_id, class_name, subject,
      classroom_id, classroom, subgroup_id, subgroup_key, is_group_split, active, updated_at
    ) values (
      v_teacher_id,
      (v_row->>'dayOfWeek')::smallint,
      (v_row->>'periodNumber')::smallint,
      v_class_id,
      (select class_name from public.school_classes where id = v_class_id),
      trim(v_row->>'subject'),
      v_classroom_id,
      case when v_classroom_id is null then null else (select name from public.classrooms where id = v_classroom_id) end,
      v_subgroup_id,
      case when v_subgroup_id is null then null else (select subgroup_key from public.class_subgroups where id = v_subgroup_id) end,
      v_is_group_split,
      true,
      now()
    )
    on conflict (teacher_id, weekday, period) where active = true
    do update set
      class_id = excluded.class_id,
      class_name = excluded.class_name,
      subject = excluded.subject,
      classroom_id = excluded.classroom_id,
      classroom = excluded.classroom,
      subgroup_id = excluded.subgroup_id,
      subgroup_key = excluded.subgroup_key,
      is_group_split = excluded.is_group_split,
      updated_at = now()
    returning id into v_schedule_id;

    insert into public.schedule_audit_log(schedule_id, actor_user_id, action, new_row)
    select v_schedule_id, auth.uid(), 'imported', to_jsonb(ts)
    from public.teacher_schedule ts where ts.id = v_schedule_id;

    v_count := v_count + 1;
  end loop;

  return query select v_batch, v_count;
end;
$$;

revoke all on function public.import_weekly_schedule(text,text,jsonb) from public;
grant execute on function public.import_weekly_schedule(text,text,jsonb) to authenticated;
