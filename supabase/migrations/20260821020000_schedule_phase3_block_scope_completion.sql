-- Phase 3 completion: exact scoped block-pattern validation and scope-key aggregation.

create or replace function public.schedule_scenario_block_matches_phase3_v1(p_scenario_id uuid,p_assignment_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
with a as (
  select a.id,a.assigned_hours,a.class_course_requirement_id
  from public.teacher_course_assignments a
  where a.id=p_assignment_id and a.institution_code=public.current_tenant_code()
),rule as (
  select public.normalize_schedule_block_pattern_v2(er.block_pattern,a.assigned_hours) expected
  from a cross join lateral public.get_effective_schedule_rule_v2(a.class_course_requirement_id,a.id) er
),actual_runs as (
  select count(*)::smallint len from (
    select sr.weekday,sr.period,
      sr.period-row_number() over(partition by sr.weekday order by sr.period)::integer grp
    from public.schedule_scenario_rows sr
    where sr.institution_code=public.current_tenant_code() and sr.scenario_id=p_scenario_id and sr.teacher_assignment_id=p_assignment_id
  ) x group by weekday,grp
),actual as (select coalesce(array_agg(len order by len desc),'{}'::smallint[]) v from actual_runs),
expected as (select coalesce(array_agg(x order by x desc),'{}'::smallint[]) v from rule cross join lateral unnest(expected) x)
select case when not exists(select 1 from rule where cardinality(expected)>0) then true
            else (select v from actual)=(select v from expected) end;
$$;

create or replace function public.schedule_current_block_matches_phase3_v1(p_assignment_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
with a as (
  select a.id,a.assigned_hours,a.class_course_requirement_id
  from public.teacher_course_assignments a
  where a.id=p_assignment_id and a.institution_code=public.current_tenant_code()
),rule as (
  select public.normalize_schedule_block_pattern_v2(er.block_pattern,a.assigned_hours) expected
  from a cross join lateral public.get_effective_schedule_rule_v2(a.class_course_requirement_id,a.id) er
),actual_runs as (
  select count(*)::smallint len from (
    select ts.weekday,ts.period,
      ts.period-row_number() over(partition by ts.weekday order by ts.period)::integer grp
    from public.teacher_schedule ts
    where ts.institution_code=public.current_tenant_code() and ts.active and ts.teacher_assignment_id=p_assignment_id
  ) x group by weekday,grp
),actual as (select coalesce(array_agg(len order by len desc),'{}'::smallint[]) v from actual_runs),
expected as (select coalesce(array_agg(x order by x desc),'{}'::smallint[]) v from rule cross join lateral unnest(expected) x)
select case when not exists(select 1 from rule where cardinality(expected)>0) then true
            else (select v from actual)=(select v from expected) end;
$$;

create or replace function public.get_schedule_phase3_scenario_issues_v1(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
ctx as (select public.current_tenant_code() tenant),
sc as (select s.id from public.schedule_scenarios s join ctx on s.institution_code=ctx.tenant where s.id=p_scenario_id),
rows as (
  select sr.*,r.id req_id,a.id ass_id,
    case when public.get_effective_schedule_rule_scope_v2(r.id,a.id)='assignment' then 'A:'||a.id::text else 'R:'||r.id::text end scope_key,
    er.max_per_day,er.min_distinct_days,er.prohibited_days,er.prohibited_periods
  from public.schedule_scenario_rows sr join sc on sc.id=sr.scenario_id join ctx on sr.institution_code=ctx.tenant
  join public.teacher_course_assignments a on a.id=sr.teacher_assignment_id and a.institution_code=ctx.tenant
  join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.institution_code=ctx.tenant
  cross join lateral public.get_effective_schedule_rule_v2(r.id,a.id) er
),
time_bad as (select count(*)::integer n from rows where
  (cardinality(coalesce(prohibited_days,'{}'::smallint[]))>0 and weekday=any(prohibited_days)) or
  (cardinality(coalesce(prohibited_periods,'{}'::smallint[]))>0 and period=any(prohibited_periods))),
daily_bad as (select count(*)::integer n from (
  select scope_key,weekday,max(max_per_day) lim,count(distinct period) actual
  from rows where max_per_day is not null group by scope_key,weekday
  having count(distinct period)>max(max_per_day)) q),
spread_bad as (select count(*)::integer n from (
  select scope_key,max(min_distinct_days) lim,count(distinct weekday) actual
  from rows where min_distinct_days is not null group by scope_key
  having count(distinct weekday)<max(min_distinct_days)) q),
block_bad as (
  select count(*)::integer n from (
    select distinct ass_id from rows r where not public.schedule_scenario_block_matches_phase3_v1(p_scenario_id,r.ass_id)
  ) q
),
locked_missing as (
  select count(*)::integer n from public.teacher_schedule ts join ctx on ts.institution_code=ctx.tenant
  where ts.active and ts.locked and not exists(select 1 from public.schedule_scenario_rows sr
    where sr.institution_code=ctx.tenant and sr.scenario_id=p_scenario_id and sr.teacher_assignment_id=ts.teacher_assignment_id and sr.weekday=ts.weekday and sr.period=ts.period)
),
sync_missing as (
  select count(*)::integer n from public.schedule_sync_groups g join ctx on g.institution_code=ctx.tenant
  where g.active and g.required_simultaneous and exists(select 1 from public.schedule_sync_group_members gm where gm.institution_code=ctx.tenant and gm.sync_group_id=g.id)
    and not exists(select 1 from public.schedule_scenario_rows sr where sr.institution_code=ctx.tenant and sr.scenario_id=p_scenario_id and sr.sync_group_id=g.id)
),
sync_partial as (
  select count(*)::integer n from (
    select sr.sync_group_id,sr.weekday,sr.period,count(distinct sr.teacher_assignment_id)::integer actual
    from public.schedule_scenario_rows sr join ctx on sr.institution_code=ctx.tenant
    where sr.scenario_id=p_scenario_id and sr.sync_group_id is not null
    group by sr.sync_group_id,sr.weekday,sr.period
    having count(distinct sr.teacher_assignment_id)<>(select count(*) from public.schedule_sync_group_members gm where gm.institution_code=(select tenant from ctx) and gm.sync_group_id=sr.sync_group_id)
  ) q
)
select 'SCOPED_COURSE_TIME_RULE',n,'Senaryo etkin kapsam kuralındaki yasak gün/saatlardan birini ihlal ediyor.' from time_bad where n>0
union all select 'SCOPED_COURSE_DAILY_LIMIT',n,'Senaryoda etkin kapsam kuralının günlük ders azamisi aşılıyor.' from daily_bad where n>0
union all select 'SCOPED_COURSE_MINIMUM_SPREAD',n,'Senaryoda etkin kapsam kuralının minimum gün yayılımı sağlanmıyor.' from spread_bad where n>0
union all select 'SCOPED_COURSE_BLOCK_PATTERN',n,'Senaryodaki ardışık blok uzunlukları etkin kapsam blok deseniyle uyuşmuyor.' from block_bad where n>0
union all select 'LOCKED_SLOT_NOT_PRESERVED',n,'Kilitli aktif ders senaryoda aynı slotta korunmamış.' from locked_missing where n>0
union all select 'SYNC_GROUP_NOT_PLACED',n,'Zorunlu eşzamanlı grup senaryoda hiç yerleşmemiş.' from sync_missing where n>0
union all select 'SYNC_GROUP_PARTIAL_SLOT',n,'Eşzamanlı grup slotunda üyelerin tamamı birlikte yerleşmemiş.' from sync_partial where n>0;
$$;

create or replace function public.get_schedule_phase3_current_issues_v1()
returns table(severity text,code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
ctx as (select public.current_tenant_code() tenant),
rows as (
  select ts.*,r.id req_id,a.id ass_id,
    case when public.get_effective_schedule_rule_scope_v2(r.id,a.id)='assignment' then 'A:'||a.id::text else 'R:'||r.id::text end scope_key,
    er.max_per_day,er.min_distinct_days,er.prohibited_days,er.prohibited_periods
  from public.teacher_schedule ts join ctx on ts.institution_code=ctx.tenant
  join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id and a.institution_code=ctx.tenant
  join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.institution_code=ctx.tenant
  cross join lateral public.get_effective_schedule_rule_v2(r.id,a.id) er where ts.active
),
time_bad as (select count(*)::integer n from rows where
  (cardinality(coalesce(prohibited_days,'{}'::smallint[]))>0 and weekday=any(prohibited_days)) or
  (cardinality(coalesce(prohibited_periods,'{}'::smallint[]))>0 and period=any(prohibited_periods))),
daily_bad as (select count(*)::integer n from (
  select scope_key,weekday,max(max_per_day) lim,count(distinct period) actual from rows where max_per_day is not null group by scope_key,weekday
  having count(distinct period)>max(max_per_day)) q),
spread_bad as (select count(*)::integer n from (
  select scope_key,max(min_distinct_days) lim,count(distinct weekday) actual from rows where min_distinct_days is not null group by scope_key
  having count(distinct weekday)<max(min_distinct_days)) q),
block_bad as (select count(*)::integer n from (select distinct ass_id from rows r where not public.schedule_current_block_matches_phase3_v1(r.ass_id)) q)
select 'error','SCOPED_COURSE_TIME_RULE',n,'Aktif program etkin kapsam kuralındaki yasak gün/saat kuralını ihlal ediyor.' from time_bad where n>0
union all select 'error','SCOPED_COURSE_DAILY_LIMIT',n,'Aktif program etkin kapsam kuralının günlük ders azamisini aşıyor.' from daily_bad where n>0
union all select 'error','SCOPED_COURSE_MINIMUM_SPREAD',n,'Aktif program etkin kapsam kuralının minimum gün yayılımını sağlamıyor.' from spread_bad where n>0
union all select 'error','SCOPED_COURSE_BLOCK_PATTERN',n,'Aktif programdaki ardışık blok uzunlukları etkin kapsam blok deseniyle uyuşmuyor.' from block_bad where n>0;
$$;
