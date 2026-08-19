-- Restore/apply must preserve all V2 semantic timetable identities.
create or replace function public.restore_schedule_restore_point(p_restore_point_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer:=0;v_snapshot jsonb;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if not exists(select 1 from public.schedule_restore_points where id=p_restore_point_id) then raise exception 'RESTORE_POINT_NOT_FOUND';end if;
  perform public.create_schedule_restore_point('Geri yükleme öncesi otomatik kopya','before_restore');
  delete from public.teacher_schedule where active=true;
  for v_snapshot in select snapshot from public.schedule_restore_point_rows where restore_point_id=p_restore_point_id order by id loop
    insert into public.teacher_schedule(
      id,teacher_id,weekday,period,class_name,subject,class_id,classroom,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked,
      course_id,class_course_requirement_id,teacher_assignment_id,source_kind,sync_group_id,block_key,updated_at
    ) values(
      coalesce(nullif(v_snapshot->>'id','')::uuid,gen_random_uuid()),(v_snapshot->>'teacher_id')::uuid,(v_snapshot->>'weekday')::smallint,(v_snapshot->>'period')::smallint,
      v_snapshot->>'class_name',v_snapshot->>'subject',nullif(v_snapshot->>'class_id','')::uuid,nullif(v_snapshot->>'classroom',''),nullif(v_snapshot->>'classroom_id','')::uuid,
      nullif(v_snapshot->>'subgroup_id','')::uuid,nullif(v_snapshot->>'subgroup_key',''),coalesce((v_snapshot->>'is_group_split')::boolean,false),true,coalesce((v_snapshot->>'locked')::boolean,false),
      nullif(v_snapshot->>'course_id','')::uuid,nullif(v_snapshot->>'class_course_requirement_id','')::uuid,nullif(v_snapshot->>'teacher_assignment_id','')::uuid,
      coalesce(nullif(v_snapshot->>'source_kind',''),'legacy'),nullif(v_snapshot->>'sync_group_id','')::uuid,nullif(v_snapshot->>'block_key','')::uuid,now()
    );v_count:=v_count+1;
  end loop;return v_count;
end;$$;

create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS';end if;
  if exists(select 1 from public.schedule_room_assignment_issues where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_CLASSROOM_ISSUES';end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;
  perform public.create_schedule_restore_point('Senaryo uygulanmadan önce otomatik yedek','before_scenario_apply');
  delete from public.teacher_schedule where active=true and locked=false;
  insert into public.teacher_schedule(
    teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked,
    course_id,class_course_requirement_id,teacher_assignment_id,source_kind,sync_group_id,block_key
  )
  select r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,r.subgroup_id,r.subgroup_key,r.is_group_split,true,r.locked,
    r.course_id,r.requirement_id,r.teacher_assignment_id,'solver',r.sync_group_id,r.block_key
  from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.locked=false order by r.weekday,r.period,r.class_name;
  get diagnostics v_count=row_count;
  update public.schedule_scenarios set status=case when id=p_scenario_id then 'applied' else status end where generation_group=(select generation_group from public.schedule_scenarios where id=p_scenario_id);
  perform public.assert_schedule_publishable();
  return v_count;
end;$$;
revoke all on function public.restore_schedule_restore_point(uuid) from public;
grant execute on function public.restore_schedule_restore_point(uuid) to authenticated;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;