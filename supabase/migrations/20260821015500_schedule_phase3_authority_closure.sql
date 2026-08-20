-- OkulOS Phase 3: one hard-constraint authority from preflight to apply/publish.
-- Forward-only: do not rewrite applied timetable history.

-- 1) Preflight: locked rows must respect the effective scoped rule; required sync groups
-- must have at least one common legal window before the solver starts.
create or replace function public.get_schedule_phase3_preflight_issues_v1()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
ctx as (select public.current_tenant_code() tenant),
locked_bad as (
  select count(*)::integer n
  from public.teacher_schedule ts
  join ctx on ts.institution_code=ctx.tenant
  join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id and a.institution_code=ctx.tenant
  join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.institution_code=ctx.tenant
  cross join lateral public.get_effective_schedule_rule_v2(r.id,a.id) er
  where ts.active and ts.locked and (
    (cardinality(coalesce(er.prohibited_days,'{}'::smallint[]))>0 and ts.weekday=any(er.prohibited_days)) or
    (cardinality(coalesce(er.prohibited_periods,'{}'::smallint[]))>0 and ts.period=any(er.prohibited_periods))
  )
),
sync_impossible as (
  select count(*)::integer n
  from public.schedule_sync_groups g
  join ctx on g.institution_code=ctx.tenant
  where g.active and g.required_simultaneous
    and exists(select 1 from public.schedule_sync_group_members gm where gm.sync_group_id=g.id and gm.institution_code=ctx.tenant)
    and not exists (
      select 1
      from public.schedule_time_profiles tp
      cross join lateral unnest(tp.teaching_days) d(day_no)
      cross join lateral generate_series(1,tp.periods_per_day) p(period_no)
      where tp.institution_code=ctx.tenant and tp.active
        and not exists (
          select 1
          from public.schedule_sync_group_members gm
          join public.teacher_course_assignments a on a.id=gm.teacher_assignment_id and a.institution_code=ctx.tenant
          join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.institution_code=ctx.tenant
          cross join lateral public.get_effective_schedule_rule_v2(r.id,a.id) er
          where gm.institution_code=ctx.tenant and gm.sync_group_id=g.id
            and (
              exists(select 1 from generate_series(0,greatest(gm.block_hours,1)-1) k
                where p.period_no+k>tp.periods_per_day
                   or (cardinality(coalesce(er.prohibited_days,'{}'::smallint[]))>0 and d.day_no=any(er.prohibited_days))
                   or (cardinality(coalesce(er.prohibited_periods,'{}'::smallint[]))>0 and (p.period_no+k)=any(er.prohibited_periods))
                   or exists(select 1 from public.teacher_unavailability u
                     where u.institution_code=ctx.tenant and u.teacher_id=a.teacher_id and u.active
                       and u.weekday=d.day_no and u.period=p.period_no+k))
            )
        )
    )
)
select 'kilitli','LOCKED_SCOPED_RULE_CONFLICT','error',n,'Kilitli ders, etkin sınıf/öğretmen kapsam kuralındaki yasak gün veya saatle çakışıyor.' from locked_bad where n>0
union all
select 'eşzamanlı','SYNC_GROUP_NO_COMMON_WINDOW','error',n,'Zorunlu eşzamanlı grubun öğretmen uygunluğu ve etkin kapsam kuralları altında ortak yerleşim penceresi yok.' from sync_impossible where n>0;
$$;
revoke all on function public.get_schedule_phase3_preflight_issues_v1() from public;
grant execute on function public.get_schedule_phase3_preflight_issues_v1() to authenticated;

alter function public.get_schedule_preparation_readiness()
rename to get_schedule_preparation_readiness_pre_phase3;
create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
  select * from public.get_schedule_preparation_readiness_pre_phase3()
  union all
  select * from public.get_schedule_phase3_preflight_issues_v1();
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;

-- 2) Scenario authority: effective scoped rule is re-evaluated independently from solver output.
create or replace function public.get_schedule_phase3_scenario_issues_v1(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
ctx as (select public.current_tenant_code() tenant),
sc as (
  select s.id from public.schedule_scenarios s join ctx on s.institution_code=ctx.tenant where s.id=p_scenario_id
),
rows as (
  select sr.*,r.id req_id,a.id ass_id,
         public.get_effective_schedule_rule_scope_v2(r.id,a.id) rule_scope,
         er.block_pattern,er.max_per_day,er.min_distinct_days,er.prohibited_days,er.prohibited_periods
  from public.schedule_scenario_rows sr
  join sc on sc.id=sr.scenario_id
  join ctx on sr.institution_code=ctx.tenant
  join public.teacher_course_assignments a on a.id=sr.teacher_assignment_id and a.institution_code=ctx.tenant
  join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.institution_code=ctx.tenant
  cross join lateral public.get_effective_schedule_rule_v2(r.id,a.id) er
),
time_bad as (
  select count(*)::integer n from rows
  where (cardinality(coalesce(prohibited_days,'{}'::smallint[]))>0 and weekday=any(prohibited_days))
     or (cardinality(coalesce(prohibited_periods,'{}'::smallint[]))>0 and period=any(prohibited_periods))
),
daily_bad as (
  select count(*)::integer n from (
    select ass_id,req_id,rule_scope,weekday,max(max_per_day) lim,count(distinct period)::integer placed
    from rows where max_per_day is not null
    group by ass_id,req_id,rule_scope,weekday
    having count(distinct period)>max(max_per_day)
  ) q
),
spread_bad as (
  select count(*)::integer n from (
    select ass_id,req_id,rule_scope,max(min_distinct_days) lim,count(distinct weekday)::integer actual
    from rows where min_distinct_days is not null
    group by ass_id,req_id,rule_scope
    having count(distinct weekday)<max(min_distinct_days)
  ) q
),
locked_missing as (
  select count(*)::integer n
  from public.teacher_schedule ts join ctx on ts.institution_code=ctx.tenant
  where ts.active and ts.locked and not exists(
    select 1 from public.schedule_scenario_rows sr
    where sr.institution_code=ctx.tenant and sr.scenario_id=p_scenario_id
      and sr.teacher_assignment_id=ts.teacher_assignment_id and sr.weekday=ts.weekday and sr.period=ts.period
  )
),
sync_partial as (
  select count(*)::integer n from (
    select sr.sync_group_id,sr.weekday,sr.period,
      count(distinct sr.teacher_assignment_id)::integer actual,
      (select count(*)::integer from public.schedule_sync_group_members gm
       join ctx c2 on gm.institution_code=c2.tenant where gm.sync_group_id=sr.sync_group_id) expected
    from public.schedule_scenario_rows sr join ctx on sr.institution_code=ctx.tenant
    where sr.scenario_id=p_scenario_id and sr.sync_group_id is not null
    group by sr.sync_group_id,sr.weekday,sr.period
    having count(distinct sr.teacher_assignment_id)<>(select count(*) from public.schedule_sync_group_members gm
      where gm.institution_code=(select tenant from ctx) and gm.sync_group_id=sr.sync_group_id)
  ) q
)
select 'SCOPED_COURSE_TIME_RULE',n,'Senaryo, etkin kapsam kuralındaki yasak gün/saatlardan birini ihlal ediyor.' from time_bad where n>0
union all select 'SCOPED_COURSE_DAILY_LIMIT',n,'Senaryoda etkin kapsam kuralının günlük ders azamisi aşılıyor.' from daily_bad where n>0
union all select 'SCOPED_COURSE_MINIMUM_SPREAD',n,'Senaryoda etkin kapsam kuralının minimum gün yayılımı sağlanmıyor.' from spread_bad where n>0
union all select 'LOCKED_SLOT_NOT_PRESERVED',n,'Kilitli aktif derslerden biri veya daha fazlası senaryoda aynı slotta korunmamış.' from locked_missing where n>0
union all select 'SYNC_GROUP_PARTIAL_SLOT',n,'Eşzamanlı grupta aynı slotta bulunması gereken üyelerin tamamı yerleşmemiş.' from sync_partial where n>0;
$$;
revoke all on function public.get_schedule_phase3_scenario_issues_v1(uuid) from public;
grant execute on function public.get_schedule_phase3_scenario_issues_v1(uuid) to authenticated;

alter function public.get_schedule_scenario_hard_issues_v2(uuid)
rename to get_schedule_scenario_hard_issues_pre_phase3;
create or replace function public.get_schedule_scenario_hard_issues_v2(p_scenario_id uuid)
returns table(code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
  select * from public.get_schedule_scenario_hard_issues_pre_phase3(p_scenario_id)
  union all
  select * from public.get_schedule_phase3_scenario_issues_v1(p_scenario_id);
$$;
revoke all on function public.get_schedule_scenario_hard_issues_v2(uuid) from public;
grant execute on function public.get_schedule_scenario_hard_issues_v2(uuid) to authenticated;

-- 3) Current working timetable authority: scoped rules are independently checked before publish.
create or replace function public.get_schedule_phase3_current_issues_v1()
returns table(severity text,code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
with
ctx as (select public.current_tenant_code() tenant),
rows as (
  select ts.*,r.id req_id,a.id ass_id,
         public.get_effective_schedule_rule_scope_v2(r.id,a.id) rule_scope,
         er.max_per_day,er.min_distinct_days,er.prohibited_days,er.prohibited_periods
  from public.teacher_schedule ts
  join ctx on ts.institution_code=ctx.tenant
  join public.teacher_course_assignments a on a.id=ts.teacher_assignment_id and a.institution_code=ctx.tenant
  join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.institution_code=ctx.tenant
  cross join lateral public.get_effective_schedule_rule_v2(r.id,a.id) er
  where ts.active
),
time_bad as (select count(*)::integer n from rows where
  (cardinality(coalesce(prohibited_days,'{}'::smallint[]))>0 and weekday=any(prohibited_days)) or
  (cardinality(coalesce(prohibited_periods,'{}'::smallint[]))>0 and period=any(prohibited_periods))),
daily_bad as (select count(*)::integer n from (
  select ass_id,req_id,rule_scope,weekday,max(max_per_day) lim,count(distinct period) actual
  from rows where max_per_day is not null group by ass_id,req_id,rule_scope,weekday
  having count(distinct period)>max(max_per_day)) q),
spread_bad as (select count(*)::integer n from (
  select ass_id,req_id,rule_scope,max(min_distinct_days) lim,count(distinct weekday) actual
  from rows where min_distinct_days is not null group by ass_id,req_id,rule_scope
  having count(distinct weekday)<max(min_distinct_days)) q)
select 'error','SCOPED_COURSE_TIME_RULE',n,'Aktif program etkin kapsam kuralındaki yasak gün/saat kuralını ihlal ediyor.' from time_bad where n>0
union all select 'error','SCOPED_COURSE_DAILY_LIMIT',n,'Aktif program etkin kapsam kuralının günlük ders azamisini aşıyor.' from daily_bad where n>0
union all select 'error','SCOPED_COURSE_MINIMUM_SPREAD',n,'Aktif program etkin kapsam kuralının minimum gün yayılımını sağlamıyor.' from spread_bad where n>0;
$$;
revoke all on function public.get_schedule_phase3_current_issues_v1() from public;
grant execute on function public.get_schedule_phase3_current_issues_v1() to authenticated;

alter function public.get_schedule_integrity_report()
rename to get_schedule_integrity_report_pre_phase3;
create or replace function public.get_schedule_integrity_report()
returns table(severity text,code text,affected_count integer,detail text)
language sql stable security definer set search_path=public as $$
  select * from public.get_schedule_integrity_report_pre_phase3()
  union all
  select * from public.get_schedule_phase3_current_issues_v1();
$$;

-- 4) Apply is atomic: validate scenario before applying, then validate resulting current schedule.
alter function public.apply_schedule_scenario(uuid)
rename to apply_schedule_scenario_pre_phase3;
create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_errors integer;v_applied integer;
begin
  perform public.open_permission_context('schedule.apply');
  v_errors:=public.validate_schedule_scenario_v2(p_scenario_id);
  if v_errors>0 then raise exception 'SCENARIO_HAS_HARD_ISSUES: %',v_errors;end if;
  v_applied:=public.apply_schedule_scenario_pre_phase3(p_scenario_id);
  select coalesce(sum(affected_count),0)::integer into v_errors from public.get_schedule_integrity_report() where severity='error';
  if v_errors>0 then raise exception 'APPLIED_SCHEDULE_FAILED_FINAL_VALIDATION: %',v_errors;end if;
  return v_applied;
end $$;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;

-- 5) Publish uses the exact same current integrity authority.
alter function public.publish_current_schedule(date,text,text,text)
rename to publish_current_schedule_pre_phase3;
create or replace function public.publish_current_schedule(
  p_effective_from date,p_academic_year text default null,p_title text default 'Haftalık Ders Programı',p_note text default null
)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_errors integer;
begin
  perform public.open_permission_context('schedule.publish');
  select coalesce(sum(affected_count),0)::integer into v_errors from public.get_schedule_integrity_report() where severity='error';
  if v_errors>0 then raise exception 'PUBLISH_BLOCKED_BY_HARD_ISSUES: %',v_errors;end if;
  return public.publish_current_schedule_pre_phase3(p_effective_from,p_academic_year,p_title,p_note);
end $$;
revoke all on function public.publish_current_schedule(date,text,text,text) from public;
grant execute on function public.publish_current_schedule(date,text,text,text) to authenticated;

-- 6) Manual edit tenant guard executes before semantic validation.
create or replace function public.guard_schedule_row_tenant_phase3_v1()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_tenant text:=public.current_tenant_code();
begin
  if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  if new.institution_code is distinct from v_tenant then raise exception 'CROSS_TENANT_SCHEDULE_WRITE';end if;
  if new.teacher_assignment_id is not null and not exists(select 1 from public.teacher_course_assignments a where a.id=new.teacher_assignment_id and a.institution_code=v_tenant) then raise exception 'CROSS_TENANT_TEACHER_ASSIGNMENT';end if;
  if new.class_course_requirement_id is not null and not exists(select 1 from public.class_course_requirements r where r.id=new.class_course_requirement_id and r.institution_code=v_tenant) then raise exception 'CROSS_TENANT_REQUIREMENT';end if;
  if new.classroom_id is not null and not exists(select 1 from public.classrooms c where c.id=new.classroom_id and c.institution_code=v_tenant) then raise exception 'CROSS_TENANT_CLASSROOM';end if;
  return new;
end $$;
drop trigger if exists trg_00_schedule_row_tenant_phase3 on public.teacher_schedule;
create trigger trg_00_schedule_row_tenant_phase3 before insert or update on public.teacher_schedule
for each row execute function public.guard_schedule_row_tenant_phase3_v1();

-- Phase 3 public helper grants.
revoke all on function public.get_schedule_integrity_report() from public;
grant execute on function public.get_schedule_integrity_report() to authenticated;
