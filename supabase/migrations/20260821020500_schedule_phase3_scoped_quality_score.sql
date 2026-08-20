-- Phase 3: effective scoped SOFT preferences must influence the scenario score too.

create or replace function public.get_schedule_phase3_scoped_preference_score_v1(p_scenario_id uuid)
returns integer language sql stable security definer set search_path=public as $$
with ctx as (select public.current_tenant_code() tenant),
last_period as (
  select coalesce((select tp.periods_per_day from public.schedule_time_profiles tp join ctx on tp.institution_code=ctx.tenant where tp.active order by tp.updated_at desc limit 1),8)::integer p
),r as (
  select sr.weekday,sr.period,er.preferred_days,er.preferred_periods,er.avoid_last_period
  from public.schedule_scenario_rows sr join ctx on sr.institution_code=ctx.tenant
  join public.teacher_course_assignments a on a.id=sr.teacher_assignment_id and a.institution_code=ctx.tenant
  join public.class_course_requirements req on req.id=a.class_course_requirement_id and req.institution_code=ctx.tenant
  cross join lateral public.get_effective_schedule_rule_v2(req.id,a.id) er
  where sr.scenario_id=p_scenario_id
)
select coalesce(sum(
  (case when cardinality(coalesce(preferred_days,'{}'::smallint[]))>0 and not weekday=any(preferred_days) then 10 else 0 end)+
  (case when cardinality(coalesce(preferred_periods,'{}'::smallint[]))>0 and not period=any(preferred_periods) then 10 else 0 end)+
  (case when avoid_last_period and period=(select p from last_period) then 10 else 0 end)
),0)::integer from r;
$$;
revoke all on function public.get_schedule_phase3_scoped_preference_score_v1(uuid) from public;
grant execute on function public.get_schedule_phase3_scoped_preference_score_v1(uuid) to authenticated;

alter function public.calculate_schedule_scenario_score_v2(uuid)
rename to calculate_schedule_scenario_score_pre_phase3;
create or replace function public.calculate_schedule_scenario_score_v2(p_scenario_id uuid)
returns integer language sql stable security definer set search_path=public as $$
  select greatest(least(
    public.calculate_schedule_scenario_score_pre_phase3(p_scenario_id)::bigint
    +public.get_schedule_phase3_scoped_preference_score_v1(p_scenario_id)::bigint,
    2147483647),-2147483648)::integer;
$$;
revoke all on function public.calculate_schedule_scenario_score_v2(uuid) from public;
grant execute on function public.calculate_schedule_scenario_score_v2(uuid) to authenticated;
