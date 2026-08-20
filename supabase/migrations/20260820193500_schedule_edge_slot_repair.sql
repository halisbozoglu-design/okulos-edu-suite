-- Kenar-saat HARD kuralları yalnız validator değildir: üretilen senaryoda güvenli taşıma deneyerek hedef slotları doldurur.

create or replace function public.try_schedule_edge_target_v1(
  p_scenario_id uuid,
  p_rule_code text,
  p_target_weekday integer,
  p_target_period integer
)
returns boolean
language plpgsql security definer set search_path=public as $$
declare
  v_row record;
  v_old_weekday integer;
  v_old_period integer;
  v_before integer;
  v_after integer;
  v_last_period integer;
begin
  if public.schedule_rule_mode_v1(p_rule_code)<>'hard' then return true; end if;

  if exists(
    select 1 from public.schedule_scenario_rows r
    where r.scenario_id=p_scenario_id and r.weekday=p_target_weekday and r.period=p_target_period
      and public.schedule_subject_matches_edge_rule_v1(r.subject,p_rule_code)
  ) then return true; end if;

  select periods_per_day into v_last_period from public.schedule_time_profiles where active=true order by updated_at desc limit 1;
  if v_last_period is null then v_last_period:=p_target_period; end if;

  select coalesce(sum(affected_count),0)::integer into v_before
  from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);

  for v_row in
    select r.id,r.teacher_id,r.class_id,r.subgroup_id,r.weekday,r.period
    from public.schedule_scenario_rows r
    where r.scenario_id=p_scenario_id
      and public.schedule_subject_matches_edge_rule_v1(r.subject,p_rule_code)
      and not r.locked
      and r.sync_group_id is null
      and r.block_key is null
      and not (r.weekday=1 and r.period=1)
      and not (r.weekday=5 and r.period=v_last_period)
      and not exists(
        select 1 from public.schedule_scenario_rows x
        where x.scenario_id=p_scenario_id and x.weekday=p_target_weekday and x.period=p_target_period
          and (x.teacher_id=r.teacher_id
               or (r.class_id is not null and x.class_id=r.class_id)
               or (r.subgroup_id is not null and x.subgroup_id=r.subgroup_id))
      )
    order by case when r.weekday=p_target_weekday then 0 else 1 end,abs(r.period-p_target_period),r.id
  loop
    v_old_weekday:=v_row.weekday; v_old_period:=v_row.period;
    begin
      update public.schedule_scenario_rows
      set weekday=p_target_weekday,period=p_target_period
      where id=v_row.id;

      select coalesce(sum(affected_count),0)::integer into v_after
      from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);

      if v_after<v_before and exists(
        select 1 from public.schedule_scenario_rows r
        where r.id=v_row.id and r.weekday=p_target_weekday and r.period=p_target_period
          and public.schedule_subject_matches_edge_rule_v1(r.subject,p_rule_code)
      ) then
        return true;
      end if;

      update public.schedule_scenario_rows set weekday=v_old_weekday,period=v_old_period where id=v_row.id;
    exception when others then
      update public.schedule_scenario_rows set weekday=v_old_weekday,period=v_old_period where id=v_row.id;
    end;
  end loop;
  return false;
end;$$;

create or replace function public.apply_schedule_edge_slot_repairs_v1(p_scenario_id uuid)
returns integer
language plpgsql security definer set search_path=public as $$
declare
  v_last integer;
  v_fixed integer:=0;
  v_before integer;
  v_after integer;
  v_rule text;
begin
  select periods_per_day into v_last from public.schedule_time_profiles where active=true order by updated_at desc limit 1;
  if v_last is null then select max(period) into v_last from public.schedule_scenario_rows where scenario_id=p_scenario_id; end if;
  if v_last is null then v_last:=8; end if;

  foreach v_rule in array array['physical_education_edge_slots','music_edge_slots']::text[] loop
    if public.schedule_rule_mode_v1(v_rule)='hard' then
      select coalesce(sum(affected_count),0)::integer into v_before from public.get_schedule_scenario_edge_slot_issues_v1(p_scenario_id) where code=upper(v_rule);
      perform public.try_schedule_edge_target_v1(p_scenario_id,v_rule,1,1);
      perform public.try_schedule_edge_target_v1(p_scenario_id,v_rule,5,v_last);
      select coalesce(sum(affected_count),0)::integer into v_after from public.get_schedule_scenario_edge_slot_issues_v1(p_scenario_id) where code=upper(v_rule);
      v_fixed:=v_fixed+greatest(v_before-v_after,0);
    end if;
  end loop;
  return v_fixed;
end;$$;

alter function public.generate_schedule_scenarios_v2()
rename to generate_schedule_scenarios_pre_edge_v2;

create or replace function public.generate_schedule_scenarios_v2()
returns table(generation_group uuid,scenario_id uuid,scenario_no integer,row_count integer,unplaced_count integer,score integer)
language plpgsql security definer set search_path=public as $$
declare
  r record;
  v_score integer;
begin
  for r in select * from public.generate_schedule_scenarios_pre_edge_v2() loop
    perform public.apply_schedule_edge_slot_repairs_v1(r.scenario_id);
    v_score:=public.calculate_schedule_scenario_score_v2(r.scenario_id);
    update public.schedule_scenarios set score=v_score where id=r.scenario_id;
    generation_group:=r.generation_group;
    scenario_id:=r.scenario_id;
    scenario_no:=r.scenario_no;
    row_count:=r.row_count;
    unplaced_count:=r.unplaced_count;
    score:=v_score;
    return next;
  end loop;
end;$$;

revoke all on function public.try_schedule_edge_target_v1(uuid,text,integer,integer) from public;
revoke all on function public.apply_schedule_edge_slot_repairs_v1(uuid) from public;
grant execute on function public.apply_schedule_edge_slot_repairs_v1(uuid) to authenticated;
