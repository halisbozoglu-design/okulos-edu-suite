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
