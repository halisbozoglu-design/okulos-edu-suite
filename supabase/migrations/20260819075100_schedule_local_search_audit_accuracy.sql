-- Preserve accurate pre/post hard-issue snapshots for soft local-search audit.

create or replace function public.improve_schedule_scenario_soft_v1(p_scenario_id uuid,p_max_moves integer default 20)
returns integer language plpgsql security definer set search_path=public as $$
declare
  v_profile public.schedule_time_profiles%rowtype;
  v_row record;v_rule public.course_schedule_rules%rowtype;
  v_old_day smallint;v_old_period smallint;d smallint;p smallint;
  v_before_score integer;v_after_score integer;v_trial_hard integer;
  v_moves integer:=0;v_action_no integer;v_start_score integer;v_end_score integer;
  v_start_hard integer;v_end_hard integer;
begin
  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  if not found or p_max_moves<=0 then return 0;end if;
  v_start_score:=public.calculate_schedule_scenario_score_v2(p_scenario_id);
  select coalesce(sum(affected_count),0)::integer into v_start_hard from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);

  for v_row in
    select r.id,r.teacher_id,r.class_id,r.course_id,r.requirement_id,r.teacher_assignment_id,r.classroom_id,r.weekday,r.period
    from public.schedule_scenario_rows r
    where r.scenario_id=p_scenario_id and not r.locked and r.sync_group_id is null and r.block_key is null and r.subgroup_id is null
      and r.teacher_assignment_id is not null and r.requirement_id is not null
    order by abs(hashtext(r.id::text||':'||p_scenario_id::text))
  loop
    exit when v_moves>=p_max_moves;
    v_old_day:=v_row.weekday;v_old_period:=v_row.period;
    v_before_score:=public.calculate_schedule_scenario_score_v2(p_scenario_id);
    v_rule:=public.get_effective_schedule_rule_v2(v_row.requirement_id,v_row.teacher_assignment_id);

    <<candidate_days>>
    foreach d in array v_profile.teaching_days loop
      if v_rule.course_id is not null and cardinality(v_rule.prohibited_days)>0 and d=any(v_rule.prohibited_days) then continue;end if;
      for p in 1..v_profile.periods_per_day loop
        if d=v_old_day and p=v_old_period then continue;end if;
        if v_rule.course_id is not null and cardinality(v_rule.prohibited_periods)>0 and p=any(v_rule.prohibited_periods) then continue;end if;
        if exists(select 1 from public.teacher_unavailability u where u.teacher_id=v_row.teacher_id and u.weekday=d and u.period=p and u.active=true) then continue;end if;
        if exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.id<>v_row.id and x.teacher_id=v_row.teacher_id and x.weekday=d and x.period=p) then continue;end if;
        if v_row.class_id is not null and exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.id<>v_row.id and x.class_id=v_row.class_id and x.weekday=d and x.period=p and x.subgroup_id is null) then continue;end if;
        if v_row.classroom_id is not null and exists(select 1 from public.schedule_scenario_rows x where x.scenario_id=p_scenario_id and x.id<>v_row.id and x.classroom_id=v_row.classroom_id and x.weekday=d and x.period=p) then continue;end if;

        begin
          update public.schedule_scenario_rows set weekday=d,period=p where id=v_row.id;
          select coalesce(sum(affected_count),0)::integer into v_trial_hard from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);
          if v_trial_hard<=v_start_hard then
            v_after_score:=public.calculate_schedule_scenario_score_v2(p_scenario_id);
            if v_after_score<v_before_score then
              v_moves:=v_moves+1;
              v_row.weekday:=d;v_row.period:=p;
              exit candidate_days;
            end if;
          end if;
          update public.schedule_scenario_rows set weekday=v_old_day,period=v_old_period where id=v_row.id;
        exception when unique_violation or check_violation or foreign_key_violation then
          update public.schedule_scenario_rows set weekday=v_old_day,period=v_old_period where id=v_row.id;
        end;
      end loop;
    end loop candidate_days;
  end loop;

  v_end_score:=public.calculate_schedule_scenario_score_v2(p_scenario_id);
  select coalesce(sum(affected_count),0)::integer into v_end_hard from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);
  if v_moves>0 then
    select coalesce(max(action_no),0)+1 into v_action_no from public.schedule_repair_audit where scenario_id=p_scenario_id;
    insert into public.schedule_repair_audit(scenario_id,action_no,issue_code,description,score_delta,hard_issues_before,hard_issues_after,before_state,after_state)
    values(p_scenario_id,v_action_no,'SOFT_LOCAL_SEARCH',format('Hard kuralları bozmadan %s esnek ders daha iyi slota taşındı.',v_moves),v_end_score-v_start_score,
      v_start_hard,v_end_hard,jsonb_build_object('score',v_start_score,'hard_issues',v_start_hard),jsonb_build_object('score',v_end_score,'hard_issues',v_end_hard));
  end if;
  return v_moves;
end;$$;

revoke all on function public.improve_schedule_scenario_soft_v1(uuid,integer) from public;
