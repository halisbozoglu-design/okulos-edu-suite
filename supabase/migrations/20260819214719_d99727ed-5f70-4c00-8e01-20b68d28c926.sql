create table if not exists public.schedule_scenario_integrity_issues(
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.schedule_scenarios(id) on delete cascade,
  code text not null,
  affected_count integer not null default 1,
  detail text not null,
  created_at timestamptz not null default now(),
  unique(scenario_id,code)
);
alter table public.schedule_scenario_integrity_issues enable row level security;
grant select,insert,update,delete on public.schedule_scenario_integrity_issues to authenticated;
create policy "managers read scenario integrity issues" on public.schedule_scenario_integrity_issues for select to authenticated using(public.is_manager_or_admin());
create policy "managers manage scenario integrity issues" on public.schedule_scenario_integrity_issues for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.scenario_assignment_run_lengths(p_scenario uuid,p_assignment uuid)
returns smallint[] language sql stable security definer set search_path=public as $$
with ordered as (
 select weekday,period,period-row_number() over(partition by weekday order by period)::integer grp
 from public.schedule_scenario_rows where scenario_id=p_scenario and teacher_assignment_id=p_assignment
),runs as(select count(*)::smallint len from ordered group by weekday,grp)
select coalesce(array_agg(len order by len desc),'{}'::smallint[]) from runs;
$$;

create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare n integer;v_count integer:=0;
begin
 if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
 if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;
 delete from public.schedule_scenario_integrity_issues where scenario_id=p_scenario_id;

 select count(*)::integer into n from (
   select a.id from public.teacher_course_assignments a left join public.schedule_scenario_rows r on r.scenario_id=p_scenario_id and r.teacher_assignment_id=a.id
   group by a.id,a.assigned_hours having count(r.id)<>a.assigned_hours
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues(scenario_id,code,affected_count,detail) values(p_scenario_id,'ASSIGNMENT_HOURS_MISMATCH',n,'Öğretmen-ders atama saatleri senaryoda eksik veya fazla.');v_count:=v_count+n;end if;

 select count(*)::integer into n from (
   select req.id from public.class_course_requirements req left join public.schedule_scenario_rows r on r.scenario_id=p_scenario_id and r.requirement_id=req.id
   group by req.id,req.weekly_hours having count(r.id)<>req.weekly_hours
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'REQUIREMENT_HOURS_MISMATCH',n,'Sınıf-ders haftalık saati senaryoda hedefle uyuşmuyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.class_id,r.course_id from public.schedule_scenario_rows r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active and cr.min_distinct_days is not null
  where r.scenario_id=p_scenario_id group by r.class_id,r.course_id having count(distinct r.weekday)<max(cr.min_distinct_days)
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_MINIMUM_SPREAD',n,'Ders gereken asgari gün sayısına yayılmamış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.teacher_course_assignments a
 join public.class_course_requirements req on req.id=a.class_course_requirement_id
 join public.course_schedule_rules cr on cr.course_id=req.course_id and cr.active and cardinality(cr.block_pattern)>0
 where public.scenario_assignment_run_lengths(p_scenario_id,a.id)<>(select array_agg(x order by x desc) from unnest(cr.block_pattern) x);
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_BLOCK_PATTERN',n,'Dersin ardışık blok deseni tanımlanan desenle uyuşmuyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.teacher_id,r.weekday,count(*) c,max(tc.max_daily_hours) lim from public.schedule_scenario_rows r join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
  where r.scenario_id=p_scenario_id and tc.max_daily_hours is not null group by r.teacher_id,r.weekday having count(*)>max(tc.max_daily_hours)
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'TEACHER_DAILY_LIMIT',n,'Öğretmenin günlük azami ders saati aşılmış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.teacher_id,count(distinct r.weekday) d,max(tc.max_working_days) mx,max(tc.min_working_days) mn from public.schedule_scenario_rows r join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
  where r.scenario_id=p_scenario_id group by r.teacher_id having (max(tc.max_working_days) is not null and count(distinct r.weekday)>max(tc.max_working_days)) or (max(tc.min_working_days) is not null and count(distinct r.weekday)<max(tc.min_working_days))
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'TEACHER_WORKING_DAYS',n,'Öğretmenin asgari/azami çalışma günü kuralı sağlanmıyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_scenario_rows r join public.teacher_unavailability u on u.teacher_id=r.teacher_id and u.weekday=r.weekday and u.period=r.period and u.active where r.scenario_id=p_scenario_id;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'TEACHER_UNAVAILABLE',n,'Senaryoda öğretmenin kesin uygun olmadığı saat kullanılmış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_scenario_rows r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active
 where r.scenario_id=p_scenario_id and ((cardinality(cr.prohibited_days)>0 and r.weekday=any(cr.prohibited_days)) or (cardinality(cr.prohibited_periods)>0 and r.period=any(cr.prohibited_periods)));
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_TIME_RULE',n,'Ders yasaklanan gün/saatte bulunuyor.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from (
  select r.class_id,r.course_id,r.weekday,count(*) c,max(cr.max_per_day) mx from public.schedule_scenario_rows r join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active
  where r.scenario_id=p_scenario_id and cr.max_per_day is not null group by r.class_id,r.course_id,r.weekday having count(*)>max(cr.max_per_day)
 ) q;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'COURSE_DAILY_LIMIT',n,'Dersin aynı sınıftaki günlük azami saati aşılmış.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_sync_groups g where g.active and g.required_simultaneous and exists(
   select 1 from public.schedule_sync_group_members m where m.sync_group_id=g.id and (
     select count(*) from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.sync_group_id=g.id and r.teacher_assignment_id=m.teacher_assignment_id
   )<>m.block_hours
 );
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'SYNC_GROUP_HOURS',n,'Paralel blok üyelerinin saat sayısı eksik/fazla.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_sync_groups g where g.active and g.required_simultaneous and exists(
   select 1 from public.schedule_sync_group_members m1 join public.schedule_sync_group_members m2 on m2.sync_group_id=m1.sync_group_id and m2.id>m1.id
   where m1.sync_group_id=g.id and (
     exists((select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id) except (select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id))
     or exists((select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m2.teacher_assignment_id) except (select weekday,period from public.schedule_scenario_rows where scenario_id=p_scenario_id and sync_group_id=g.id and teacher_assignment_id=m1.teacher_assignment_id))
   )
 );
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'SYNC_GROUP_SLOT_MISMATCH',n,'Paralel blok üyeleri tam olarak aynı saatlerde değil.',now());v_count:=v_count+n;end if;

 select count(*)::integer into n from public.schedule_room_assignment_issues where scenario_id=p_scenario_id;
 if n>0 then insert into public.schedule_scenario_integrity_issues values(gen_random_uuid(),p_scenario_id,'CLASSROOM_ISSUE',n,'Bir veya daha fazla ders için uygun derslik bulunamadı.',now());v_count:=v_count+n;end if;

 return v_count;
end;$$;
revoke all on function public.validate_schedule_scenario_v2(uuid) from public;
grant execute on function public.validate_schedule_scenario_v2(uuid) to authenticated;

-- Application gate also checks scenario integrity explicitly.
create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;v_issues integer;
begin
 if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
 v_issues:=public.validate_schedule_scenario_v2(p_scenario_id);
 if v_issues>0 then raise exception 'SCENARIO_HAS_HARD_INTEGRITY_ISSUES: %',v_issues;end if;
 if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS';end if;
 perform public.create_schedule_restore_point('Senaryo uygulanmadan önce otomatik yedek','before_scenario_apply');
 delete from public.teacher_schedule where active=true and locked=false;
 insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked,course_id,class_course_requirement_id,teacher_assignment_id,source_kind,sync_group_id,block_key)
 select r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,r.subgroup_id,r.subgroup_key,r.is_group_split,true,r.locked,r.course_id,r.requirement_id,r.teacher_assignment_id,'solver',r.sync_group_id,r.block_key
 from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.locked=false order by r.weekday,r.period,r.class_name;
 get diagnostics v_count=row_count;
 update public.schedule_scenarios set status=case when id=p_scenario_id then 'applied' else status end where generation_group=(select generation_group from public.schedule_scenarios where id=p_scenario_id);
 perform public.assert_schedule_publishable();
 return v_count;
end;$$;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;
create or replace view public.schedule_scenario_status_v2
with (security_invoker=true)
as
select s.generation_group,s.id as scenario_id,s.scenario_no,s.score,s.row_count,s.unplaced_count,
  coalesce((select sum(i.affected_count)::integer from public.schedule_scenario_integrity_issues i where i.scenario_id=s.id),0) as hard_issue_count,
  coalesce((select count(*)::integer from public.schedule_room_assignment_issues r where r.scenario_id=s.id),0) as room_issue_count,
  (s.unplaced_count=0
   and not exists(select 1 from public.schedule_scenario_integrity_issues i where i.scenario_id=s.id)
   and not exists(select 1 from public.schedule_room_assignment_issues r where r.scenario_id=s.id)) as applicable
from public.schedule_scenarios s;
grant select on public.schedule_scenario_status_v2 to authenticated;
-- Timetable V2 configuration integrity guards.
-- Prevents contradictory configuration from reaching the solver.

create or replace function public.validate_schedule_time_profile_v2()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if cardinality(new.teaching_days)=0 then
    raise exception 'SCHEDULE_TIME_PROFILE_REQUIRES_TEACHING_DAY';
  end if;
  if exists(select 1 from unnest(new.teaching_days) as d(day_no) where d.day_no not between 1 and 7) then
    raise exception 'INVALID_TEACHING_DAY';
  end if;
  if cardinality(new.teaching_days) <> (select count(distinct d.day_no) from unnest(new.teaching_days) as d(day_no)) then
    raise exception 'DUPLICATE_TEACHING_DAY';
  end if;
  if new.lunch_after_period is not null and new.lunch_after_period >= new.periods_per_day then
    raise exception 'LUNCH_BREAK_MUST_BE_BEFORE_LAST_PERIOD';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_schedule_time_profile_v2 on public.schedule_time_profiles;
create trigger trg_validate_schedule_time_profile_v2
before insert or update on public.schedule_time_profiles
for each row execute function public.validate_schedule_time_profile_v2();

create or replace function public.validate_teacher_schedule_constraints_v2()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  v_periods integer;
  v_days integer;
begin
  select periods_per_day,cardinality(teaching_days)
    into v_periods,v_days
  from public.schedule_time_profiles where active=true limit 1;

  if new.min_working_days is not null and new.max_working_days is not null
     and new.min_working_days>new.max_working_days then
    raise exception 'MIN_WORKING_DAYS_EXCEEDS_MAX';
  end if;
  if v_days is not null and new.min_working_days is not null and new.min_working_days>v_days then
    raise exception 'MIN_WORKING_DAYS_EXCEEDS_SCHOOL_DAYS';
  end if;
  if v_periods is not null and new.max_daily_hours is not null and new.max_daily_hours>v_periods then
    raise exception 'MAX_DAILY_HOURS_EXCEEDS_PERIODS_PER_DAY';
  end if;
  if v_periods is not null and new.max_consecutive_hours is not null and new.max_consecutive_hours>v_periods then
    raise exception 'MAX_CONSECUTIVE_HOURS_EXCEEDS_PERIODS_PER_DAY';
  end if;
  if new.max_weekly_hours is not null and new.max_daily_hours is not null and new.max_working_days is not null
     and new.max_weekly_hours>(new.max_daily_hours*new.max_working_days) then
    raise exception 'MAX_WEEKLY_HOURS_IMPOSSIBLE_WITH_DAILY_AND_DAY_LIMITS';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_teacher_schedule_constraints_v2 on public.teacher_schedule_constraints;
create trigger trg_validate_teacher_schedule_constraints_v2
before insert or update on public.teacher_schedule_constraints
for each row execute function public.validate_teacher_schedule_constraints_v2();

create or replace function public.validate_course_schedule_rule_v2()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  v_periods integer;
  v_days integer;
begin
  select periods_per_day,cardinality(teaching_days)
    into v_periods,v_days
  from public.schedule_time_profiles where active=true limit 1;

  if exists(select 1 from unnest(new.preferred_days) as d(day_no) where d.day_no not between 1 and 7)
     or exists(select 1 from unnest(new.prohibited_days) as d(day_no) where d.day_no not between 1 and 7) then
    raise exception 'INVALID_COURSE_DAY_RULE';
  end if;
  if exists(select 1 from unnest(new.preferred_periods) as p(period_no) where p.period_no<1 or (v_periods is not null and p.period_no>v_periods))
     or exists(select 1 from unnest(new.prohibited_periods) as p(period_no) where p.period_no<1 or (v_periods is not null and p.period_no>v_periods)) then
    raise exception 'INVALID_COURSE_PERIOD_RULE';
  end if;
  if exists(
    select 1
    from unnest(new.preferred_days) as p(day_no)
    join unnest(new.prohibited_days) as x(day_no) on x.day_no=p.day_no
  ) then
    raise exception 'COURSE_DAY_BOTH_PREFERRED_AND_PROHIBITED';
  end if;
  if exists(
    select 1
    from unnest(new.preferred_periods) as p(period_no)
    join unnest(new.prohibited_periods) as x(period_no) on x.period_no=p.period_no
  ) then
    raise exception 'COURSE_PERIOD_BOTH_PREFERRED_AND_PROHIBITED';
  end if;
  if v_periods is not null and new.max_per_day is not null and new.max_per_day>v_periods then
    raise exception 'COURSE_MAX_PER_DAY_EXCEEDS_SCHOOL_DAY';
  end if;
  if v_days is not null and new.min_distinct_days is not null and new.min_distinct_days>v_days then
    raise exception 'COURSE_MIN_SPREAD_EXCEEDS_TEACHING_DAYS';
  end if;
  if cardinality(new.block_pattern)>0 and exists(
    select 1 from unnest(new.block_pattern) as b(block_hours)
    where b.block_hours<1 or (v_periods is not null and b.block_hours>v_periods)
  ) then
    raise exception 'INVALID_COURSE_BLOCK_PATTERN';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_course_schedule_rule_v2 on public.course_schedule_rules;
create trigger trg_validate_course_schedule_rule_v2
before insert or update on public.course_schedule_rules
for each row execute function public.validate_course_schedule_rule_v2();

-- NULL subgroup values must not allow duplicate copies of the same assignment in one parallel block.
with ranked as (
  select id,row_number() over(
    partition by sync_group_id,teacher_assignment_id,coalesce(subgroup_id,'00000000-0000-0000-0000-000000000000'::uuid)
    order by id
  ) rn
  from public.schedule_sync_group_members
)
delete from public.schedule_sync_group_members m
using ranked r where r.id=m.id and r.rn>1;

create unique index if not exists uq_schedule_sync_member_semantic
on public.schedule_sync_group_members(
  sync_group_id,teacher_assignment_id,coalesce(subgroup_id,'00000000-0000-0000-0000-000000000000'::uuid)
);

create or replace function public.get_schedule_configuration_issues_v2()
returns table(code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
with
profile_bad as (
  select count(*)::integer n from public.schedule_time_profiles
  where active and (
    cardinality(teaching_days)=0
    or exists(select 1 from unnest(teaching_days) as d(day_no) where d.day_no not between 1 and 7)
    or cardinality(teaching_days)<>(select count(distinct d.day_no) from unnest(teaching_days) as d(day_no))
    or (lunch_after_period is not null and lunch_after_period>=periods_per_day)
  )
),
constraint_bad as (
  select count(*)::integer n
  from public.teacher_schedule_constraints c
  cross join lateral (select periods_per_day,cardinality(teaching_days) school_days from public.schedule_time_profiles where active limit 1) p
  where (c.min_working_days is not null and c.max_working_days is not null and c.min_working_days>c.max_working_days)
     or (c.min_working_days is not null and c.min_working_days>p.school_days)
     or (c.max_daily_hours is not null and c.max_daily_hours>p.periods_per_day)
     or (c.max_consecutive_hours is not null and c.max_consecutive_hours>p.periods_per_day)
     or (c.max_weekly_hours is not null and c.max_daily_hours is not null and c.max_working_days is not null and c.max_weekly_hours>c.max_daily_hours*c.max_working_days)
),
course_rule_bad as (
  select count(*)::integer n
  from public.course_schedule_rules r
  cross join lateral (select periods_per_day,cardinality(teaching_days) school_days from public.schedule_time_profiles where active limit 1) p
  where r.active and (
    exists(select 1 from unnest(r.preferred_days) as d(day_no) where d.day_no not between 1 and 7)
    or exists(select 1 from unnest(r.prohibited_days) as d(day_no) where d.day_no not between 1 and 7)
    or exists(select 1 from unnest(r.preferred_periods) as x(period_no) where x.period_no<1 or x.period_no>p.periods_per_day)
    or exists(select 1 from unnest(r.prohibited_periods) as x(period_no) where x.period_no<1 or x.period_no>p.periods_per_day)
    or exists(select 1 from unnest(r.preferred_days) as x(day_no) join unnest(r.prohibited_days) as y(day_no) on y.day_no=x.day_no)
    or exists(select 1 from unnest(r.preferred_periods) as x(period_no) join unnest(r.prohibited_periods) as y(period_no) on y.period_no=x.period_no)
    or (r.max_per_day is not null and r.max_per_day>p.periods_per_day)
    or (r.min_distinct_days is not null and r.min_distinct_days>p.school_days)
    or exists(select 1 from unnest(r.block_pattern) as x(block_hours) where x.block_hours<1 or x.block_hours>p.periods_per_day)
  )
),
sync_member_count_bad as (
  select count(*)::integer n from (
    select g.id
    from public.schedule_sync_groups g
    left join public.schedule_sync_group_members m on m.sync_group_id=g.id
    where g.active and g.required_simultaneous
    group by g.id having count(m.id)<2
  ) q
),
sync_class_bad as (
  select count(*)::integer n
  from public.schedule_sync_groups g
  join public.schedule_sync_group_members m on m.sync_group_id=g.id
  join public.teacher_course_assignments a on a.id=m.teacher_assignment_id
  join public.class_course_requirements r on r.id=a.class_course_requirement_id
  where g.active and g.class_id is not null and r.class_id<>g.class_id
),
sync_total_bad as (
  select count(*)::integer n from (
    select m.teacher_assignment_id,sum(m.block_hours) sync_hours,max(a.assigned_hours) assigned_hours
    from public.schedule_sync_group_members m
    join public.schedule_sync_groups g on g.id=m.sync_group_id and g.active
    join public.teacher_course_assignments a on a.id=m.teacher_assignment_id
    group by m.teacher_assignment_id
    having sum(m.block_hours)>max(a.assigned_hours)
  ) q
)
select * from (
  select 'TIME_PROFILE_CONFIGURATION_INVALID',n,'Aktif okul zaman şablonunda gün/ders saati/öğle arası çelişkisi var.' from profile_bad where n>0 union all
  select 'TEACHER_CONSTRAINT_CONFIGURATION_INVALID',n,'Öğretmen min/max gün veya günlük/haftalık ders sınırları birbiriyle uygulanabilir değil.' from constraint_bad where n>0 union all
  select 'COURSE_RULE_CONFIGURATION_INVALID',n,'Ders blok, gün veya saat kuralları çelişkili ya da okul zaman şablonu dışında.' from course_rule_bad where n>0 union all
  select 'SYNC_GROUP_REQUIRES_TWO_MEMBERS',n,'Eşzamanlı bir paralel blokta en az iki üye bulunmalıdır.' from sync_member_count_bad where n>0 union all
  select 'SYNC_GROUP_CLASS_MISMATCH',n,'Eşzamanlı grup sınıfı ile grup üyesinin öğretmen-ders ataması aynı sınıfa ait değil.' from sync_class_bad where n>0 union all
  select 'SYNC_TOTAL_HOURS_EXCEED_ASSIGNMENT',n,'Bir öğretmen-ders atamasının eşzamanlı blok toplamı atanmış haftalık saatini aşıyor.' from sync_total_bad where n>0
) q;
$$;
revoke all on function public.get_schedule_configuration_issues_v2() from public;
grant execute on function public.get_schedule_configuration_issues_v2() to authenticated;
-- Connect configuration-integrity issues to the existing timetable preparation and publish gates.

alter function public.get_schedule_preparation_readiness()
rename to get_schedule_preparation_readiness_core_v2;

create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select * from public.get_schedule_preparation_readiness_core_v2()
  union all
  select 'yapılandırma'::text,i.code,'error'::text,i.affected_count,i.detail
  from public.get_schedule_configuration_issues_v2() i;
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;

create or replace function public.assert_schedule_publishable()
returns boolean
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_bad record;
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  perform public.assert_curriculum_ready_for_timetable();

  select * into v_bad
  from public.get_schedule_configuration_issues_v2()
  limit 1;
  if found then
    raise exception 'SCHEDULE_CONFIGURATION_INVALID: % (% kayıt) - %',v_bad.code,v_bad.affected_count,v_bad.detail;
  end if;

  select * into v_bad
  from public.get_schedule_integrity_report()
  where severity='error'
  limit 1;
  if found then
    raise exception 'SCHEDULE_NOT_PUBLISHABLE: % (% kayıt) - %',v_bad.code,v_bad.affected_count,v_bad.detail;
  end if;

  return true;
end;
$$;
revoke all on function public.assert_schedule_publishable() from public;
grant execute on function public.assert_schedule_publishable() to authenticated;
-- Surface configuration-integrity problems in the same report used by the validation UI.

alter function public.get_schedule_integrity_report()
rename to get_schedule_integrity_report_core_v2;

create or replace function public.get_schedule_integrity_report()
returns table(severity text,code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select * from public.get_schedule_integrity_report_core_v2()
  union all
  select 'error'::text,i.code,i.affected_count,i.detail
  from public.get_schedule_configuration_issues_v2() i;
$$;
revoke all on function public.get_schedule_integrity_report() from public;
grant execute on function public.get_schedule_integrity_report() to authenticated;