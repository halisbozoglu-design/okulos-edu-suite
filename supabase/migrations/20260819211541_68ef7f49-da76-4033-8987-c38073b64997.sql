-- OkulOS Timetable Solver V2: semantic hours, locked-hour subtraction, blocks, synchronization and diagnostics.

alter table public.schedule_scenario_rows
  add column if not exists course_id uuid references public.course_catalog(id) on delete restrict,
  add column if not exists sync_group_id uuid references public.schedule_sync_groups(id) on delete set null,
  add column if not exists block_key uuid;

alter table public.schedule_unplaced_items
  add column if not exists block_hours smallint not null default 1 check(block_hours between 1 and 6),
  add column if not exists diagnostic jsonb not null default '{}'::jsonb;

create or replace function public.scenario_teacher_daily_count(p_scenario uuid,p_teacher uuid,p_day smallint)
returns integer language sql stable security definer set search_path=public as $$
  select count(*)::integer from public.schedule_scenario_rows where scenario_id=p_scenario and teacher_id=p_teacher and weekday=p_day;
$$;

create or replace function public.scenario_teacher_working_days(p_scenario uuid,p_teacher uuid,p_candidate_day smallint default null)
returns integer language sql stable security definer set search_path=public as $$
  select count(distinct d)::integer from (
    select weekday d from public.schedule_scenario_rows where scenario_id=p_scenario and teacher_id=p_teacher
    union all select p_candidate_day where p_candidate_day is not null
  ) q;
$$;

create or replace function public.scenario_slot_diagnostic(
  p_scenario uuid,p_assignment uuid,p_block_hours smallint
)
returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare
  v_a public.teacher_course_assignments%rowtype; v_r public.class_course_requirements%rowtype; v_rule public.course_schedule_rules%rowtype;
  v_constraint public.teacher_schedule_constraints%rowtype; v_profile public.schedule_time_profiles%rowtype;
  d smallint;p smallint;k smallint; total integer:=0;teacher_busy integer:=0;class_busy integer:=0;unavailable integer:=0;
  daily_limit integer:=0;consecutive_limit integer:=0;course_rule integer:=0;working_days integer:=0;valid_count integer:=0; bad boolean;
begin
  select * into v_a from public.teacher_course_assignments where id=p_assignment;
  select * into v_r from public.class_course_requirements where id=v_a.class_course_requirement_id;
  select * into v_rule from public.course_schedule_rules where course_id=v_r.course_id and active=true;
  select * into v_constraint from public.teacher_schedule_constraints where teacher_id=v_a.teacher_id;
  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  foreach d in array coalesce(v_profile.teaching_days,array[1,2,3,4,5]::smallint[]) loop
    for p in 1..greatest(coalesce(v_profile.periods_per_day,8)-p_block_hours+1,0) loop
      total:=total+1; bad:=false;
      if found and cardinality(v_rule.prohibited_days)>0 and d=any(v_rule.prohibited_days) then course_rule:=course_rule+1;continue;end if;
      for k in 0..p_block_hours-1 loop
        if found and cardinality(v_rule.prohibited_periods)>0 and (p+k)=any(v_rule.prohibited_periods) then bad:=true;exit;end if;
        if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_a.teacher_id and u.weekday=d and u.period=p+k and u.active=true) then unavailable:=unavailable+1;bad:=true;exit;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario and x.teacher_id=v_a.teacher_id and x.weekday=d and x.period=p+k) then teacher_busy:=teacher_busy+1;bad:=true;exit;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario and x.class_id=v_r.class_id and x.weekday=d and x.period=p+k and x.subgroup_id is null) then class_busy:=class_busy+1;bad:=true;exit;end if;
      end loop;
      if bad then continue; end if;
      if v_constraint.max_daily_hours is not null and public.scenario_teacher_daily_count(p_scenario,v_a.teacher_id,d)+p_block_hours>v_constraint.max_daily_hours then daily_limit:=daily_limit+1;continue;end if;
      if v_constraint.max_working_days is not null and public.scenario_teacher_working_days(p_scenario,v_a.teacher_id,d)>v_constraint.max_working_days then working_days:=working_days+1;continue;end if;
      if public.scenario_teacher_consecutive_count(p_scenario,v_a.teacher_id,d,p)>coalesce(v_constraint.max_consecutive_hours,4) then consecutive_limit:=consecutive_limit+1;continue;end if;
      valid_count:=valid_count+1;
    end loop;
  end loop;
  return jsonb_build_object('candidate_windows',total,'valid_windows',valid_count,'teacher_busy',teacher_busy,'class_busy',class_busy,
    'teacher_unavailable',unavailable,'daily_limit',daily_limit,'working_days_limit',working_days,'consecutive_limit',consecutive_limit,'course_time_rule',course_rule);
end;$$;

create or replace function public.generate_schedule_scenarios()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql security definer set search_path=public as $$
declare
  v_group uuid:=gen_random_uuid(); v_scenario uuid;v_no smallint;v_profile public.schedule_time_profiles%rowtype;
  v_item record;v_sync record;v_member record;v_rule public.course_schedule_rules%rowtype;v_constraint public.teacher_schedule_constraints%rowtype;
  v_remaining integer;v_locked integer;v_sync_hours integer;v_block smallint;v_pattern smallint[];v_pattern_index integer;
  d smallint;p smallint;k smallint;best_d smallint;best_p smallint;candidate integer;best integer;bad boolean;block_id uuid;
  daily_same integer;pref integer;v_unplaced integer;v_rows integer;v_score integer;v_hash integer;v_diag jsonb;
  sync_ok boolean;sync_best integer;sync_candidate integer;sync_block smallint;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  perform public.assert_curriculum_ready_for_timetable();
  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  if not found then raise exception 'ACTIVE_SCHEDULE_TIME_PROFILE_REQUIRED'; end if;

  for v_no in 1..4 loop
    insert into public.schedule_scenarios(generation_group,scenario_no,title,generated_by)
    values(v_group,v_no,'Senaryo '||v_no,auth.uid()) returning id into v_scenario;

    -- Locked rows preserve exact semantic identity and consume their assignment hours.
    insert into public.schedule_scenario_rows(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,locked,source_schedule_id,course_id)
    select v_scenario,ts.class_course_requirement_id,ts.teacher_assignment_id,ts.teacher_id,ts.class_id,ts.weekday,ts.period,ts.class_name,ts.subject,ts.classroom_id,ts.subgroup_id,ts.subgroup_key,ts.is_group_split,true,ts.id,ts.course_id
    from public.teacher_schedule ts where ts.active=true and ts.locked=true;

    -- Place explicit synchronized groups first. Each group is a hard simultaneous constraint.
    for v_sync in select * from public.schedule_sync_groups where active=true order by name loop
      select coalesce(max(m.block_hours),1) into sync_block from public.schedule_sync_group_members m where m.sync_group_id=v_sync.id;
      if not exists(select 1 from public.schedule_sync_group_members where sync_group_id=v_sync.id) then continue; end if;
      best_d:=null;best_p:=null;sync_best:=2147483647;
      foreach d in array v_profile.teaching_days loop
        for p in 1..(v_profile.periods_per_day-sync_block+1) loop
          sync_ok:=true;sync_candidate:=0;
          for v_member in
            select m.*,a.teacher_id,r.class_id,r.course_id,c.name subject
            from public.schedule_sync_group_members m
            join public.teacher_course_assignments a on a.id=m.teacher_assignment_id
            join public.class_course_requirements r on r.id=a.class_course_requirement_id
            join public.course_catalog c on c.id=r.course_id
            where m.sync_group_id=v_sync.id
          loop
            select * into v_constraint from public.teacher_schedule_constraints where teacher_id=v_member.teacher_id;
            select * into v_rule from public.course_schedule_rules where course_id=v_member.course_id and active=true;
            if found and cardinality(v_rule.prohibited_days)>0 and d=any(v_rule.prohibited_days) then sync_ok:=false;exit;end if;
            if v_constraint.max_daily_hours is not null and public.scenario_teacher_daily_count(v_scenario,v_member.teacher_id,d)+v_member.block_hours>v_constraint.max_daily_hours then sync_ok:=false;exit;end if;
            if v_constraint.max_working_days is not null and public.scenario_teacher_working_days(v_scenario,v_member.teacher_id,d)>v_constraint.max_working_days then sync_ok:=false;exit;end if;
            for k in 0..v_member.block_hours-1 loop
              if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_member.teacher_id and u.weekday=d and u.period=p+k and u.active=true) then sync_ok:=false;exit;end if;
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.teacher_id=v_member.teacher_id and x.weekday=d and x.period=p+k) then sync_ok:=false;exit;end if;
              -- Same class may coexist only through explicit distinct subgroups with no overlapping students.
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.class_id=v_member.class_id and x.weekday=d and x.period=p+k
                and (x.subgroup_id is null or v_member.subgroup_id is null or x.subgroup_id=v_member.subgroup_id or exists(
                  select 1 from public.class_subgroup_students a join public.class_subgroup_students b on b.student_id=a.student_id
                  where a.subgroup_id=x.subgroup_id and b.subgroup_id=v_member.subgroup_id))) then sync_ok:=false;exit;end if;
              if found and cardinality(v_rule.prohibited_periods)>0 and (p+k)=any(v_rule.prohibited_periods) then sync_ok:=false;exit;end if;
            end loop;
            if not sync_ok then exit; end if;
            select coalesce(sum(case preference when 'prefer' then -weight else weight end),0)::integer into pref
              from public.teacher_schedule_preferences where teacher_id=v_member.teacher_id and weekday=d and period between p and p+v_member.block_hours-1 and active=true;
            sync_candidate:=sync_candidate+pref;
          end loop;
          if sync_ok then
            v_hash:=abs(hashtext(v_sync.id::text||':'||v_no||':'||d||':'||p));sync_candidate:=sync_candidate+(v_hash%7);
            if sync_candidate<sync_best then sync_best:=sync_candidate;best_d:=d;best_p:=p;end if;
          end if;
        end loop;
      end loop;
      if best_d is null then
        for v_member in select m.*,a.teacher_id,r.class_id,r.course_id,c.name subject from public.schedule_sync_group_members m join public.teacher_course_assignments a on a.id=m.teacher_assignment_id join public.class_course_requirements r on r.id=a.class_course_requirement_id join public.course_catalog c on c.id=r.course_id where m.sync_group_id=v_sync.id loop
          insert into public.schedule_unplaced_items(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,subject,reason,block_hours,diagnostic)
          values(v_scenario,(select class_course_requirement_id from public.teacher_course_assignments where id=v_member.teacher_assignment_id),v_member.teacher_assignment_id,v_member.teacher_id,v_member.class_id,v_member.subject,'SYNC_GROUP_NO_COMMON_SLOT',v_member.block_hours,public.scenario_slot_diagnostic(v_scenario,v_member.teacher_assignment_id,v_member.block_hours));
        end loop;
      else
        block_id:=gen_random_uuid();
        for v_member in select m.*,a.teacher_id,r.id requirement_id,r.class_id,r.course_id,c.name subject,sc.class_name from public.schedule_sync_group_members m join public.teacher_course_assignments a on a.id=m.teacher_assignment_id join public.class_course_requirements r on r.id=a.class_course_requirement_id join public.course_catalog c on c.id=r.course_id join public.school_classes sc on sc.id=r.class_id where m.sync_group_id=v_sync.id loop
          for k in 0..v_member.block_hours-1 loop
            insert into public.schedule_scenario_rows(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject,subgroup_id,subgroup_key,is_group_split,locked,course_id,sync_group_id,block_key)
            values(v_scenario,v_member.requirement_id,v_member.teacher_assignment_id,v_member.teacher_id,v_member.class_id,best_d,best_p+k,v_member.class_name,v_member.subject,v_member.subgroup_id,(select subgroup_key from public.class_subgroups where id=v_member.subgroup_id),v_member.subgroup_id is not null,false,v_member.course_id,v_sync.id,block_id);
          end loop;
        end loop;
      end if;
    end loop;

    -- Place remaining assignment hours. Locked and synchronized hours are subtracted.
    for v_item in
      select a.id assignment_id,a.teacher_id,a.assigned_hours,r.id requirement_id,r.class_id,r.course_id,c.name subject,sc.class_name,
             coalesce(tc.max_consecutive_hours,4) max_consecutive
      from public.teacher_course_assignments a
      join public.class_course_requirements r on r.id=a.class_course_requirement_id
      join public.course_catalog c on c.id=r.course_id
      join public.school_classes sc on sc.id=r.class_id
      left join public.teacher_schedule_constraints tc on tc.teacher_id=a.teacher_id
      order by ((abs(hashtext(a.id::text))+v_no*137)%1000),sc.composite_key,c.name
    loop
      select count(*) into v_locked from public.schedule_scenario_rows where scenario_id=v_scenario and teacher_assignment_id=v_item.assignment_id and locked=true;
      select count(*) into v_sync_hours from public.schedule_scenario_rows where scenario_id=v_scenario and teacher_assignment_id=v_item.assignment_id and sync_group_id is not null;
      v_remaining:=greatest(v_item.assigned_hours-v_locked-v_sync_hours,0);
      if v_remaining=0 then continue; end if;
      select * into v_rule from public.course_schedule_rules where course_id=v_item.course_id and active=true;
      v_pattern:=case when found and cardinality(v_rule.block_pattern)>0 then v_rule.block_pattern else '{}'::smallint[] end;
      v_pattern_index:=1;
      while v_remaining>0 loop
        if cardinality(v_pattern)>=v_pattern_index then v_block:=least(v_pattern[v_pattern_index],v_remaining)::smallint;v_pattern_index:=v_pattern_index+1;else v_block:=1;end if;
        best_d:=null;best_p:=null;best:=2147483647;
        foreach d in array v_profile.teaching_days loop
          if found and cardinality(v_rule.prohibited_days)>0 and d=any(v_rule.prohibited_days) then continue;end if;
          for p in 1..(v_profile.periods_per_day-v_block+1) loop
            bad:=false;
            select * into v_constraint from public.teacher_schedule_constraints where teacher_id=v_item.teacher_id;
            if v_constraint.max_daily_hours is not null and public.scenario_teacher_daily_count(v_scenario,v_item.teacher_id,d)+v_block>v_constraint.max_daily_hours then continue;end if;
            if v_constraint.max_working_days is not null and public.scenario_teacher_working_days(v_scenario,v_item.teacher_id,d)>v_constraint.max_working_days then continue;end if;
            for k in 0..v_block-1 loop
              if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_item.teacher_id and u.weekday=d and u.period=p+k and u.active=true) then bad:=true;exit;end if;
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.teacher_id=v_item.teacher_id and x.weekday=d and x.period=p+k) then bad:=true;exit;end if;
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.class_id=v_item.class_id and x.weekday=d and x.period=p+k) then bad:=true;exit;end if;
              if found and cardinality(v_rule.prohibited_periods)>0 and (p+k)=any(v_rule.prohibited_periods) then bad:=true;exit;end if;
            end loop;
            if bad then continue;end if;
            if public.scenario_teacher_consecutive_count(v_scenario,v_item.teacher_id,d,p)>v_item.max_consecutive then continue;end if;
            select count(*) into daily_same from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.class_id=v_item.class_id and x.weekday=d and x.course_id=v_item.course_id;
            if found and v_rule.max_per_day is not null and daily_same+v_block>v_rule.max_per_day then continue;end if;
            select coalesce(sum(case preference when 'prefer' then -weight else weight end),0)::integer into pref from public.teacher_schedule_preferences
              where teacher_id=v_item.teacher_id and weekday=d and period between p and p+v_block-1 and active=true;
            v_hash:=abs(hashtext(v_item.assignment_id::text||':'||v_remaining||':'||v_no||':'||d||':'||p));
            candidate:=pref+(v_hash%9)+greatest(p+v_block-1-6,0)*2;
            if found and cardinality(v_rule.preferred_days)>0 and not(d=any(v_rule.preferred_days)) then candidate:=candidate+6;end if;
            if found and cardinality(v_rule.preferred_periods)>0 and not(p=any(v_rule.preferred_periods)) then candidate:=candidate+4;end if;
            if found and v_rule.avoid_last_period and p+v_block-1=v_profile.periods_per_day then candidate:=candidate+10;end if;
            if v_constraint.preferred_free_day=d then candidate:=candidate+12;end if;
            if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.teacher_id=v_item.teacher_id and x.weekday=d and x.period in (p-1,p+v_block)) then candidate:=candidate-3;end if;
            if candidate<best then best:=candidate;best_d:=d;best_p:=p;end if;
          end loop;
        end loop;
        if best_d is null then
          v_diag:=public.scenario_slot_diagnostic(v_scenario,v_item.assignment_id,v_block);
          insert into public.schedule_unplaced_items(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,subject,reason,block_hours,diagnostic)
          values(v_scenario,v_item.requirement_id,v_item.assignment_id,v_item.teacher_id,v_item.class_id,v_item.subject,'NO_VALID_BLOCK_SLOT',v_block,v_diag);
          v_remaining:=v_remaining-v_block;
        else
          block_id:=gen_random_uuid();
          for k in 0..v_block-1 loop
            insert into public.schedule_scenario_rows(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject,course_id,block_key)
            values(v_scenario,v_item.requirement_id,v_item.assignment_id,v_item.teacher_id,v_item.class_id,best_d,best_p+k,v_item.class_name,v_item.subject,v_item.course_id,block_id);
          end loop;
          v_remaining:=v_remaining-v_block;
        end if;
      end loop;
    end loop;

    -- Room assignment is part of generation, not an optional afterthought.
    perform * from public.assign_classrooms_to_scenario(v_scenario);

    select count(*) into v_unplaced from public.schedule_unplaced_items where scenario_id=v_scenario;
    select count(*) into v_rows from public.schedule_scenario_rows where scenario_id=v_scenario;
    select v_unplaced*10000
      + (select count(*)*5000 from public.schedule_room_assignment_issues where scenario_id=v_scenario)
      + coalesce((select sum(gaps)*8 from (select teacher_id,weekday,greatest(max(period)-min(period)+1-count(*),0) gaps from public.schedule_scenario_rows where scenario_id=v_scenario group by teacher_id,weekday) q),0)
      + coalesce((select sum(case when period>6 then (period-6)*2 else 0 end) from public.schedule_scenario_rows where scenario_id=v_scenario),0)
    into v_score;
    update public.schedule_scenarios set score=v_score,unplaced_count=v_unplaced,row_count=v_rows where id=v_scenario;
  end loop;
  return query select s.generation_group,s.id,s.scenario_no,s.score,s.unplaced_count,s.row_count from public.schedule_scenarios s where s.generation_group=v_group order by s.score,s.scenario_no;
end;$$;

-- Apply only complete scenarios. Classroom issues are hard blockers when rooms are configured.
create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;v_snap uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS';end if;
  if exists(select 1 from public.schedule_room_assignment_issues where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_CLASSROOM_ISSUES';end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;
  v_snap:=public.create_schedule_restore_point('Senaryo uygulanmadan önce otomatik yedek','before_scenario_apply');
  delete from public.teacher_schedule where active=true and locked=false;
  insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked,course_id,class_course_requirement_id,teacher_assignment_id,source_kind)
  select r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,r.subgroup_id,r.subgroup_key,r.is_group_split,true,r.locked,r.course_id,r.requirement_id,r.teacher_assignment_id,'solver'
  from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.locked=false order by r.weekday,r.period,r.class_name;
  get diagnostics v_count=row_count;
  update public.schedule_scenarios set status=case when id=p_scenario_id then 'applied' else status end where generation_group=(select generation_group from public.schedule_scenarios where id=p_scenario_id);
  return v_count;
end;$$;
revoke all on function public.generate_schedule_scenarios() from public;
grant execute on function public.generate_schedule_scenarios() to authenticated;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;