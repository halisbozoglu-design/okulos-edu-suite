-- Timetable Solver V3 authority for the core generator.
-- Fixes generation-time revision ordering, uses scoped effective rules,
-- evaluates full block length for consecutive limits, and improves spread targets.

create or replace function public.scenario_teacher_consecutive_count_block_v2(
  p_scenario uuid,p_teacher uuid,p_day smallint,p_start smallint,p_block_hours smallint
)
returns integer
language sql
stable
security definer
set search_path=public
as $$
with periods as (
  select distinct period::integer p
  from public.schedule_scenario_rows
  where scenario_id=p_scenario and teacher_id=p_teacher and weekday=p_day
  union
  select generate_series(p_start::integer,(p_start+p_block_hours-1)::integer)
), grouped as (
  select p,p-row_number() over(order by p)::integer grp from periods
), runs as (
  select count(*)::integer len from grouped group by grp
)
select coalesce(max(len),0) from runs;
$$;

create or replace function public.scenario_slot_diagnostic(
  p_scenario uuid,p_assignment uuid,p_block_hours smallint
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_a public.teacher_course_assignments%rowtype;
  v_r public.class_course_requirements%rowtype;
  v_rule public.course_schedule_rules%rowtype;
  v_constraint public.teacher_schedule_constraints%rowtype;
  v_profile public.schedule_time_profiles%rowtype;
  v_has_rule boolean:=false;
  d smallint;p smallint;k smallint;
  total integer:=0;teacher_busy integer:=0;class_busy integer:=0;unavailable integer:=0;
  daily_limit integer:=0;weekly_limit integer:=0;consecutive_limit integer:=0;course_rule integer:=0;working_days integer:=0;valid_count integer:=0;
  bad boolean;
begin
  select * into v_a from public.teacher_course_assignments where id=p_assignment;
  if not found then return jsonb_build_object('error','ASSIGNMENT_NOT_FOUND');end if;
  select * into v_r from public.class_course_requirements where id=v_a.class_course_requirement_id;
  v_rule:=public.get_effective_schedule_rule_v2(v_r.id,v_a.id);
  v_has_rule:=v_rule.course_id is not null;
  select * into v_constraint from public.teacher_schedule_constraints where teacher_id=v_a.teacher_id;
  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  if not found then return jsonb_build_object('error','TIME_PROFILE_NOT_FOUND');end if;

  foreach d in array v_profile.teaching_days loop
    for p in 1..greatest(v_profile.periods_per_day-p_block_hours+1,0) loop
      total:=total+1;bad:=false;
      if v_has_rule and cardinality(v_rule.prohibited_days)>0 and d=any(v_rule.prohibited_days) then course_rule:=course_rule+1;continue;end if;
      for k in 0..p_block_hours-1 loop
        if v_has_rule and cardinality(v_rule.prohibited_periods)>0 and (p+k)=any(v_rule.prohibited_periods) then course_rule:=course_rule+1;bad:=true;exit;end if;
        if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_a.teacher_id and u.weekday=d and u.period=p+k and u.active=true) then unavailable:=unavailable+1;bad:=true;exit;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario and x.teacher_id=v_a.teacher_id and x.weekday=d and x.period=p+k) then teacher_busy:=teacher_busy+1;bad:=true;exit;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario and x.class_id=v_r.class_id and x.weekday=d and x.period=p+k and x.subgroup_id is null) then class_busy:=class_busy+1;bad:=true;exit;end if;
      end loop;
      if bad then continue;end if;
      if v_constraint.max_daily_hours is not null and public.scenario_teacher_daily_count(p_scenario,v_a.teacher_id,d)+p_block_hours>v_constraint.max_daily_hours then daily_limit:=daily_limit+1;continue;end if;
      if v_constraint.max_weekly_hours is not null and (select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario and teacher_id=v_a.teacher_id)+p_block_hours>v_constraint.max_weekly_hours then weekly_limit:=weekly_limit+1;continue;end if;
      if v_constraint.max_working_days is not null and public.scenario_teacher_working_days(p_scenario,v_a.teacher_id,d)>v_constraint.max_working_days then working_days:=working_days+1;continue;end if;
      if public.scenario_teacher_consecutive_count_block_v2(p_scenario,v_a.teacher_id,d,p,p_block_hours)>coalesce(v_constraint.max_consecutive_hours,4) then consecutive_limit:=consecutive_limit+1;continue;end if;
      valid_count:=valid_count+1;
    end loop;
  end loop;
  return jsonb_build_object(
    'candidate_windows',total,'valid_windows',valid_count,'teacher_busy',teacher_busy,'class_busy',class_busy,
    'teacher_unavailable',unavailable,'daily_limit',daily_limit,'weekly_limit',weekly_limit,'working_days_limit',working_days,
    'consecutive_limit',consecutive_limit,'course_time_rule',course_rule
  );
end;
$$;

create or replace function public.generate_schedule_scenarios()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_group uuid:=gen_random_uuid();
  v_scenario uuid;v_no smallint;v_profile public.schedule_time_profiles%rowtype;v_basis_revision bigint;
  v_item record;v_sync record;v_member record;v_rule public.course_schedule_rules%rowtype;v_constraint public.teacher_schedule_constraints%rowtype;
  v_has_rule boolean;v_remaining integer;v_locked integer;v_sync_hours integer;v_block smallint;v_pattern smallint[];v_pattern_index integer;
  d smallint;p smallint;k smallint;best_d smallint;best_p smallint;candidate integer;best integer;bad boolean;block_id uuid;
  daily_same integer;pref integer;v_unplaced integer;v_rows integer;v_score integer;v_hash integer;v_diag jsonb;
  sync_ok boolean;sync_best integer;sync_candidate integer;sync_block smallint;v_teacher_days integer;v_course_days integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  perform public.assert_curriculum_ready_for_timetable();
  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  if not found then raise exception 'ACTIVE_SCHEDULE_TIME_PROFILE_REQUIRED';end if;
  select revision into v_basis_revision from public.schedule_engine_state where id=true;
  if v_basis_revision is null then raise exception 'SCHEDULE_ENGINE_STATE_NOT_FOUND';end if;

  for v_no in 1..4 loop
    insert into public.schedule_scenarios(generation_group,scenario_no,title,generated_by,basis_revision)
    values(v_group,v_no,'Senaryo '||v_no,auth.uid(),v_basis_revision) returning id into v_scenario;

    insert into public.schedule_scenario_rows(
      scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject,
      classroom_id,subgroup_id,subgroup_key,is_group_split,locked,source_schedule_id,course_id,sync_group_id,block_key
    )
    select v_scenario,ts.class_course_requirement_id,ts.teacher_assignment_id,ts.teacher_id,ts.class_id,ts.weekday,ts.period,ts.class_name,ts.subject,
      ts.classroom_id,ts.subgroup_id,ts.subgroup_key,ts.is_group_split,true,ts.id,ts.course_id,ts.sync_group_id,ts.block_key
    from public.teacher_schedule ts where ts.active=true and ts.locked=true;

    -- Hard simultaneous groups first.
    for v_sync in select * from public.schedule_sync_groups where active=true order by name loop
      select coalesce(max(m.block_hours),1) into sync_block from public.schedule_sync_group_members m where m.sync_group_id=v_sync.id;
      if not exists(select 1 from public.schedule_sync_group_members where sync_group_id=v_sync.id) then continue;end if;
      best_d:=null;best_p:=null;sync_best:=2147483647;
      foreach d in array v_profile.teaching_days loop
        for p in 1..(v_profile.periods_per_day-sync_block+1) loop
          sync_ok:=true;sync_candidate:=0;
          for v_member in
            select m.*,a.teacher_id,a.assigned_hours,r.id requirement_id,r.class_id,r.course_id,c.name subject
            from public.schedule_sync_group_members m
            join public.teacher_course_assignments a on a.id=m.teacher_assignment_id
            join public.class_course_requirements r on r.id=a.class_course_requirement_id
            join public.course_catalog c on c.id=r.course_id
            where m.sync_group_id=v_sync.id
          loop
            select * into v_constraint from public.teacher_schedule_constraints where teacher_id=v_member.teacher_id;
            v_rule:=public.get_effective_schedule_rule_v2(v_member.requirement_id,v_member.teacher_assignment_id);
            v_has_rule:=v_rule.course_id is not null;
            if v_has_rule and cardinality(v_rule.prohibited_days)>0 and d=any(v_rule.prohibited_days) then sync_ok:=false;exit;end if;
            if v_constraint.max_daily_hours is not null and public.scenario_teacher_daily_count(v_scenario,v_member.teacher_id,d)+v_member.block_hours>v_constraint.max_daily_hours then sync_ok:=false;exit;end if;
            if v_constraint.max_weekly_hours is not null and (select count(*) from public.schedule_scenario_rows where scenario_id=v_scenario and teacher_id=v_member.teacher_id)+v_member.block_hours>v_constraint.max_weekly_hours then sync_ok:=false;exit;end if;
            if v_constraint.max_working_days is not null and public.scenario_teacher_working_days(v_scenario,v_member.teacher_id,d)>v_constraint.max_working_days then sync_ok:=false;exit;end if;
            if public.scenario_teacher_consecutive_count_block_v2(v_scenario,v_member.teacher_id,d,p,v_member.block_hours)>coalesce(v_constraint.max_consecutive_hours,4) then sync_ok:=false;exit;end if;
            for k in 0..v_member.block_hours-1 loop
              if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_member.teacher_id and u.weekday=d and u.period=p+k and u.active=true) then sync_ok:=false;exit;end if;
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.teacher_id=v_member.teacher_id and x.weekday=d and x.period=p+k) then sync_ok:=false;exit;end if;
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.class_id=v_member.class_id and x.weekday=d and x.period=p+k
                and (x.subgroup_id is null or v_member.subgroup_id is null or x.subgroup_id=v_member.subgroup_id or exists(
                  select 1 from public.class_subgroup_students a join public.class_subgroup_students b on b.student_id=a.student_id
                  where a.subgroup_id=x.subgroup_id and b.subgroup_id=v_member.subgroup_id))) then sync_ok:=false;exit;end if;
              if v_has_rule and cardinality(v_rule.prohibited_periods)>0 and (p+k)=any(v_rule.prohibited_periods) then sync_ok:=false;exit;end if;
            end loop;
            if not sync_ok then exit;end if;
            select coalesce(sum(case preference when 'prefer' then -weight else weight end),0)::integer into pref
            from public.teacher_schedule_preferences where teacher_id=v_member.teacher_id and weekday=d and period between p and p+v_member.block_hours-1 and active=true;
            sync_candidate:=sync_candidate+pref;
            if v_constraint.preferred_free_day=d then sync_candidate:=sync_candidate+12;end if;
            if v_has_rule and cardinality(v_rule.preferred_days)>0 and not(d=any(v_rule.preferred_days)) then sync_candidate:=sync_candidate+6;end if;
            if v_has_rule and cardinality(v_rule.preferred_periods)>0 and not(p=any(v_rule.preferred_periods)) then sync_candidate:=sync_candidate+4;end if;
          end loop;
          if sync_ok then
            v_hash:=abs(hashtext(v_sync.id::text||':'||v_no||':'||d||':'||p));sync_candidate:=sync_candidate+(v_hash%7);
            if sync_candidate<sync_best then sync_best:=sync_candidate;best_d:=d;best_p:=p;end if;
          end if;
        end loop;
      end loop;
      if best_d is null then
        for v_member in
          select m.*,a.teacher_id,r.id requirement_id,r.class_id,r.course_id,c.name subject
          from public.schedule_sync_group_members m join public.teacher_course_assignments a on a.id=m.teacher_assignment_id
          join public.class_course_requirements r on r.id=a.class_course_requirement_id join public.course_catalog c on c.id=r.course_id
          where m.sync_group_id=v_sync.id
        loop
          insert into public.schedule_unplaced_items(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,subject,reason,block_hours,diagnostic)
          values(v_scenario,v_member.requirement_id,v_member.teacher_assignment_id,v_member.teacher_id,v_member.class_id,v_member.subject,'SYNC_GROUP_NO_COMMON_SLOT',v_member.block_hours,public.scenario_slot_diagnostic(v_scenario,v_member.teacher_assignment_id,v_member.block_hours));
        end loop;
      else
        block_id:=gen_random_uuid();
        for v_member in
          select m.*,a.teacher_id,r.id requirement_id,r.class_id,r.course_id,c.name subject,sc.class_name
          from public.schedule_sync_group_members m join public.teacher_course_assignments a on a.id=m.teacher_assignment_id
          join public.class_course_requirements r on r.id=a.class_course_requirement_id join public.course_catalog c on c.id=r.course_id
          join public.school_classes sc on sc.id=r.class_id where m.sync_group_id=v_sync.id
        loop
          for k in 0..v_member.block_hours-1 loop
            insert into public.schedule_scenario_rows(scenario_id,requirement_id,teacher_assignment_id,teacher_id,class_id,weekday,period,class_name,subject,subgroup_id,subgroup_key,is_group_split,locked,course_id,sync_group_id,block_key)
            values(v_scenario,v_member.requirement_id,v_member.teacher_assignment_id,v_member.teacher_id,v_member.class_id,best_d,best_p+k,v_member.class_name,v_member.subject,v_member.subgroup_id,(select subgroup_key from public.class_subgroups where id=v_member.subgroup_id),v_member.subgroup_id is not null,false,v_member.course_id,v_sync.id,block_id);
          end loop;
        end loop;
      end if;
    end loop;

    -- Remaining ordinary assignment hours.
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
      if v_remaining=0 then continue;end if;

      v_rule:=public.get_effective_schedule_rule_v2(v_item.requirement_id,v_item.assignment_id);
      v_has_rule:=v_rule.course_id is not null;
      v_pattern:=case when v_has_rule and cardinality(v_rule.block_pattern)>0 then public.normalize_schedule_block_pattern_v2(v_rule.block_pattern,v_remaining) else '{}'::smallint[] end;
      v_pattern_index:=1;

      while v_remaining>0 loop
        if cardinality(v_pattern)>=v_pattern_index then v_block:=least(v_pattern[v_pattern_index],v_remaining)::smallint;v_pattern_index:=v_pattern_index+1;else v_block:=1;end if;
        best_d:=null;best_p:=null;best:=2147483647;
        foreach d in array v_profile.teaching_days loop
          if v_has_rule and cardinality(v_rule.prohibited_days)>0 and d=any(v_rule.prohibited_days) then continue;end if;
          for p in 1..(v_profile.periods_per_day-v_block+1) loop
            bad:=false;
            select * into v_constraint from public.teacher_schedule_constraints where teacher_id=v_item.teacher_id;
            if v_constraint.max_daily_hours is not null and public.scenario_teacher_daily_count(v_scenario,v_item.teacher_id,d)+v_block>v_constraint.max_daily_hours then continue;end if;
            if v_constraint.max_weekly_hours is not null and (select count(*) from public.schedule_scenario_rows where scenario_id=v_scenario and teacher_id=v_item.teacher_id)+v_block>v_constraint.max_weekly_hours then continue;end if;
            if v_constraint.max_working_days is not null and public.scenario_teacher_working_days(v_scenario,v_item.teacher_id,d)>v_constraint.max_working_days then continue;end if;
            if public.scenario_teacher_consecutive_count_block_v2(v_scenario,v_item.teacher_id,d,p,v_block)>v_item.max_consecutive then continue;end if;
            for k in 0..v_block-1 loop
              if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_item.teacher_id and u.weekday=d and u.period=p+k and u.active=true) then bad:=true;exit;end if;
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.teacher_id=v_item.teacher_id and x.weekday=d and x.period=p+k) then bad:=true;exit;end if;
              if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=v_scenario and x.class_id=v_item.class_id and x.weekday=d and x.period=p+k) then bad:=true;exit;end if;
              if v_has_rule and cardinality(v_rule.prohibited_periods)>0 and (p+k)=any(v_rule.prohibited_periods) then bad:=true;exit;end if;
            end loop;
            if bad then continue;end if;

            -- Keep newly generated blocks separate from fixed locked/sync runs so block semantics remain explicit.
            if v_has_rule and cardinality(v_rule.block_pattern)>0 and exists(
              select 1 from public.schedule_scenario_rows x
              where x.scenario_id=v_scenario and x.teacher_assignment_id=v_item.assignment_id and x.weekday=d and x.period in (p-1,p+v_block)
            ) then continue;end if;

            select count(distinct period)::integer into daily_same from public.schedule_scenario_rows x
            where x.scenario_id=v_scenario and x.class_id=v_item.class_id and x.weekday=d and x.course_id=v_item.course_id;
            if v_has_rule and v_rule.max_per_day is not null and daily_same+v_block>v_rule.max_per_day then continue;end if;

            select coalesce(sum(case preference when 'prefer' then -weight else weight end),0)::integer into pref
            from public.teacher_schedule_preferences where teacher_id=v_item.teacher_id and weekday=d and period between p and p+v_block-1 and active=true;
            v_hash:=abs(hashtext(v_item.assignment_id::text||':'||v_remaining||':'||v_no||':'||d||':'||p));
            candidate:=pref+(v_hash%9)+greatest(p+v_block-1-6,0)*2;
            if v_has_rule and cardinality(v_rule.preferred_days)>0 and not(d=any(v_rule.preferred_days)) then candidate:=candidate+6;end if;
            if v_has_rule and cardinality(v_rule.preferred_periods)>0 and not(p=any(v_rule.preferred_periods)) then candidate:=candidate+4;end if;
            if v_has_rule and v_rule.avoid_last_period and p+v_block-1=v_profile.periods_per_day then candidate:=candidate+10;end if;
            if v_constraint.preferred_free_day=d then candidate:=candidate+12;end if;

            -- When a hard minimum-day target is unmet, prefer opening a new valid day.
            if v_constraint.min_working_days is not null then
              select count(distinct weekday)::integer into v_teacher_days from public.schedule_scenario_rows where scenario_id=v_scenario and teacher_id=v_item.teacher_id;
              if v_teacher_days<v_constraint.min_working_days and not exists(select 1 from public.schedule_scenario_rows where scenario_id=v_scenario and teacher_id=v_item.teacher_id and weekday=d) then candidate:=candidate-20;end if;
            end if;
            if v_has_rule and v_rule.min_distinct_days is not null then
              select count(distinct weekday)::integer into v_course_days from public.schedule_scenario_rows where scenario_id=v_scenario and class_id=v_item.class_id and course_id=v_item.course_id;
              if v_course_days<v_rule.min_distinct_days and not exists(select 1 from public.schedule_scenario_rows where scenario_id=v_scenario and class_id=v_item.class_id and course_id=v_item.course_id and weekday=d) then candidate:=candidate-18;end if;
            end if;
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

    -- During generation the scenario is already stamped with the current revision;
    -- use the core room allocator to avoid recursively re-validating a half-built scenario.
    perform * from public.assign_classrooms_to_scenario_core_v2(v_scenario);

    select count(*) into v_unplaced from public.schedule_unplaced_items where scenario_id=v_scenario;
    select count(*) into v_rows from public.schedule_scenario_rows where scenario_id=v_scenario;
    select v_unplaced*10000
      +(select count(*)*5000 from public.schedule_room_assignment_issues where scenario_id=v_scenario)
      +coalesce((select sum(gaps)*8 from (select teacher_id,weekday,greatest(max(period)-min(period)+1-count(*),0) gaps from public.schedule_scenario_rows where scenario_id=v_scenario group by teacher_id,weekday) q),0)
      +coalesce((select sum(case when period>6 then (period-6)*2 else 0 end) from public.schedule_scenario_rows where scenario_id=v_scenario),0)
    into v_score;
    update public.schedule_scenarios set score=v_score,unplaced_count=v_unplaced,row_count=v_rows where id=v_scenario;
  end loop;

  return query
  select s.generation_group,s.id,s.scenario_no,s.score,s.unplaced_count,s.row_count
  from public.schedule_scenarios s where s.generation_group=v_group order by s.score,s.scenario_no;
end;
$$;

revoke all on function public.scenario_slot_diagnostic(uuid,uuid,smallint) from public;
grant execute on function public.scenario_slot_diagnostic(uuid,uuid,smallint) to authenticated;
revoke all on function public.generate_schedule_scenarios() from public;
grant execute on function public.generate_schedule_scenarios() to authenticated;