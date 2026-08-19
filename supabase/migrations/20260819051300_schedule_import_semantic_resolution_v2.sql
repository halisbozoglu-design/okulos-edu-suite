-- Imported timetable rows must resolve to exactly one curriculum + teacher assignment.
create or replace function public.import_weekly_schedule(
  p_file_name text,p_file_type text,p_rows jsonb
)
returns table(import_batch_id uuid,imported_rows integer)
language plpgsql security definer set search_path=public as $$
declare
  v_batch uuid;v_row jsonb;v_teacher_id uuid;v_class_id uuid;v_classroom_id uuid;v_subgroup_id uuid;
  v_assignment_id uuid;v_match_count integer;v_count integer:=0;v_schedule_id uuid;v_is_group_split boolean;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if p_file_type not in ('xlsx','xls','csv','txt') then raise exception 'UNSUPPORTED_FILE_TYPE';end if;
  if jsonb_typeof(p_rows)<>'array' then raise exception 'INVALID_ROWS';end if;
  insert into public.schedule_import_batches(imported_by,file_name,file_type,row_count)
  values(auth.uid(),p_file_name,p_file_type,jsonb_array_length(p_rows)) returning id into v_batch;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    select user_id into v_teacher_id from public.profiles where lower(trim(full_name))=lower(trim(v_row->>'teacherName')) and role='teacher';
    if v_teacher_id is null then raise exception 'TEACHER_NOT_FOUND: %',v_row->>'teacherName';end if;
    select id into v_class_id from public.school_classes where composite_key=public.normalize_class_key(v_row->>'className',v_row->>'programType') and active=true;
    if v_class_id is null then raise exception 'CLASS_NOT_FOUND: %',v_row->>'className';end if;

    select count(*),min(a.id) into v_match_count,v_assignment_id
    from public.teacher_course_assignments a
    join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.class_id=v_class_id
    join public.course_catalog c on c.id=r.course_id
    where a.teacher_id=v_teacher_id and lower(trim(c.name))=lower(trim(v_row->>'subject'));
    if v_match_count=0 then raise exception 'IMPORT_ASSIGNMENT_NOT_FOUND: % / % / %',v_row->>'teacherName',v_row->>'className',v_row->>'subject';end if;
    if v_match_count>1 then raise exception 'IMPORT_ASSIGNMENT_AMBIGUOUS: % / % / %',v_row->>'teacherName',v_row->>'className',v_row->>'subject';end if;

    v_classroom_id:=null;
    if coalesce(trim(v_row->>'classroom'),'')<>'' then
      select id into v_classroom_id from public.classrooms where lower(trim(name))=lower(trim(v_row->>'classroom')) and active=true;
      if v_classroom_id is null then raise exception 'CLASSROOM_NOT_FOUND: %',v_row->>'classroom';end if;
    end if;
    v_is_group_split:=coalesce((v_row->>'isGroupSplit')::boolean,false);
    v_subgroup_id:=null;
    if v_is_group_split then
      if coalesce(trim(v_row->>'subgroupKey'),'')='' then raise exception 'SUBGROUP_REQUIRED';end if;
      select id into v_subgroup_id from public.class_subgroups where class_id=v_class_id and lower(trim(subgroup_key))=lower(trim(v_row->>'subgroupKey')) and active=true;
      if v_subgroup_id is null then raise exception 'SUBGROUP_NOT_FOUND: %',v_row->>'subgroupKey';end if;
    end if;

    -- Update exact teacher slot if present, otherwise create. RPC/trigger derives course and requirement identities.
    select id into v_schedule_id from public.teacher_schedule where teacher_id=v_teacher_id and weekday=(v_row->>'dayOfWeek')::smallint and period=(v_row->>'periodNumber')::smallint and active=true limit 1;
    v_schedule_id:=public.upsert_schedule_slot_v2(v_assignment_id,(v_row->>'dayOfWeek')::smallint,(v_row->>'periodNumber')::smallint,v_classroom_id,v_subgroup_id,v_schedule_id,false,'import');
    insert into public.schedule_audit_log(schedule_id,actor_user_id,action,new_row)
    select v_schedule_id,auth.uid(),'imported_v2',to_jsonb(ts) from public.teacher_schedule ts where ts.id=v_schedule_id;
    v_count:=v_count+1;
  end loop;
  return query select v_batch,v_count;
end;$$;
revoke all on function public.import_weekly_schedule(text,text,jsonb) from public;
grant execute on function public.import_weekly_schedule(text,text,jsonb) to authenticated;
