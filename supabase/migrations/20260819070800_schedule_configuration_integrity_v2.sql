-- Timetable V2 configuration integrity guards.
-- Prevents contradictory configuration from reaching the solver.

create or replace function public.validate_schedule_time_profile_v2()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  v_day smallint;
begin
  if cardinality(new.teaching_days)=0 then
    raise exception 'SCHEDULE_TIME_PROFILE_REQUIRES_TEACHING_DAY';
  end if;
  if exists(select 1 from unnest(new.teaching_days) d where d not between 1 and 7) then
    raise exception 'INVALID_TEACHING_DAY';
  end if;
  if cardinality(new.teaching_days) <> (select count(distinct d) from unnest(new.teaching_days) d) then
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

  if exists(select 1 from unnest(new.preferred_days) d where d not between 1 and 7)
     or exists(select 1 from unnest(new.prohibited_days) d where d not between 1 and 7) then
    raise exception 'INVALID_COURSE_DAY_RULE';
  end if;
  if exists(select 1 from unnest(new.preferred_periods) p where p<1 or (v_periods is not null and p>v_periods))
     or exists(select 1 from unnest(new.prohibited_periods) p where p<1 or (v_periods is not null and p>v_periods)) then
    raise exception 'INVALID_COURSE_PERIOD_RULE';
  end if;
  if exists(select 1 from unnest(new.preferred_days) p join unnest(new.prohibited_days) x on x=p) then
    raise exception 'COURSE_DAY_BOTH_PREFERRED_AND_PROHIBITED';
  end if;
  if exists(select 1 from unnest(new.preferred_periods) p join unnest(new.prohibited_periods) x on x=p) then
    raise exception 'COURSE_PERIOD_BOTH_PREFERRED_AND_PROHIBITED';
  end if;
  if v_periods is not null and new.max_per_day is not null and new.max_per_day>v_periods then
    raise exception 'COURSE_MAX_PER_DAY_EXCEEDS_SCHOOL_DAY';
  end if;
  if v_days is not null and new.min_distinct_days is not null and new.min_distinct_days>v_days then
    raise exception 'COURSE_MIN_SPREAD_EXCEEDS_TEACHING_DAYS';
  end if;
  if cardinality(new.block_pattern)>0 and exists(select 1 from unnest(new.block_pattern) x where x<1 or (v_periods is not null and x>v_periods)) then
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
    or exists(select 1 from unnest(teaching_days) d where d not between 1 and 7)
    or cardinality(teaching_days)<>(select count(distinct d) from unnest(teaching_days) d)
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
    exists(select 1 from unnest(r.preferred_days) d where d not between 1 and 7)
    or exists(select 1 from unnest(r.prohibited_days) d where d not between 1 and 7)
    or exists(select 1 from unnest(r.preferred_periods) x where x<1 or x>p.periods_per_day)
    or exists(select 1 from unnest(r.prohibited_periods) x where x<1 or x>p.periods_per_day)
    or exists(select 1 from unnest(r.preferred_days) x join unnest(r.prohibited_days) y on y=x)
    or exists(select 1 from unnest(r.preferred_periods) x join unnest(r.prohibited_periods) y on y=x)
    or (r.max_per_day is not null and r.max_per_day>p.periods_per_day)
    or (r.min_distinct_days is not null and r.min_distinct_days>p.school_days)
    or exists(select 1 from unnest(r.block_pattern) x where x<1 or x>p.periods_per_day)
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
