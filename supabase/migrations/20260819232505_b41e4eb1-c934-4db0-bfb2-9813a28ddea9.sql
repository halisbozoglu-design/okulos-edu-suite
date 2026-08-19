-- Preflight/configuration authority for scoped rules and flexible block templates.

-- Assignment-scoped rules are teacher-specific. Class-wide daily/spread limits belong
-- to requirement/course scope to avoid ambiguous aggregation semantics.
create or replace function public.validate_schedule_rule_override_v2()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_req uuid;
  v_profile public.schedule_time_profiles%rowtype;
begin
  if new.teacher_assignment_id is not null then
    select class_course_requirement_id into v_req from public.teacher_course_assignments where id=new.teacher_assignment_id;
    if v_req is null then raise exception 'RULE_OVERRIDE_ASSIGNMENT_NOT_FOUND';end if;
    if new.max_per_day is not null or new.min_distinct_days is not null then
      raise exception 'ASSIGNMENT_RULE_CLASS_LEVEL_FIELDS_NOT_ALLOWED';
    end if;
  else
    v_req:=new.class_course_requirement_id;
    if not exists(select 1 from public.class_course_requirements where id=v_req) then raise exception 'RULE_OVERRIDE_REQUIREMENT_NOT_FOUND';end if;
  end if;
  if exists(select 1 from unnest(new.block_pattern) x where x<1 or x>6) then raise exception 'INVALID_BLOCK_PATTERN';end if;
  if exists(select 1 from unnest(new.preferred_days) x where x<1 or x>7)
    or exists(select 1 from unnest(new.prohibited_days) x where x<1 or x>7) then raise exception 'INVALID_RULE_DAY';end if;
  if exists(select 1 from unnest(new.preferred_days) a join unnest(new.prohibited_days) b on a=b) then raise exception 'PREFERRED_AND_PROHIBITED_DAY_OVERLAP';end if;
  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  if found then
    if exists(select 1 from unnest(new.preferred_periods) x where x<1 or x>v_profile.periods_per_day)
      or exists(select 1 from unnest(new.prohibited_periods) x where x<1 or x>v_profile.periods_per_day) then raise exception 'INVALID_RULE_PERIOD';end if;
    if new.max_per_day is not null and new.max_per_day>v_profile.periods_per_day then raise exception 'RULE_MAX_PER_DAY_EXCEEDS_SCHOOL_DAY';end if;
    if new.min_distinct_days is not null and new.min_distinct_days>cardinality(v_profile.teaching_days) then raise exception 'RULE_MIN_SPREAD_EXCEEDS_TEACHING_DAYS';end if;
  end if;
  if exists(select 1 from unnest(new.preferred_periods) a join unnest(new.prohibited_periods) b on a=b) then raise exception 'PREFERRED_AND_PROHIBITED_PERIOD_OVERLAP';end if;
  new.updated_at:=now();return new;
end;
$$;

-- Extend existing configuration diagnostics with scoped-rule data integrity.
alter function public.get_schedule_configuration_issues_v2()
rename to get_schedule_configuration_issues_before_scoped_rules_v2;

create or replace function public.get_schedule_configuration_issues_v2()
returns table(code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select * from public.get_schedule_configuration_issues_before_scoped_rules_v2()
  union all
  select 'SCOPED_RULE_CONFIGURATION_INVALID',count(*)::integer,
         'Sınıf-ders/öğretmen özel program kuralında geçersiz blok, gün, saat veya kapsam alanı var.'
  from public.schedule_rule_overrides o
  cross join lateral (select periods_per_day,cardinality(teaching_days) school_days from public.schedule_time_profiles where active limit 1) p
  where o.active and (
    (o.teacher_assignment_id is not null and (o.max_per_day is not null or o.min_distinct_days is not null))
    or exists(select 1 from unnest(o.block_pattern) x where x<1 or x>6)
    or exists(select 1 from unnest(o.preferred_days) x where x<1 or x>7)
    or exists(select 1 from unnest(o.prohibited_days) x where x<1 or x>7)
    or exists(select 1 from unnest(o.preferred_periods) x where x<1 or x>p.periods_per_day)
    or exists(select 1 from unnest(o.prohibited_periods) x where x<1 or x>p.periods_per_day)
    or exists(select 1 from unnest(o.preferred_days) a join unnest(o.prohibited_days) b on a=b)
    or exists(select 1 from unnest(o.preferred_periods) a join unnest(o.prohibited_periods) b on a=b)
    or (o.max_per_day is not null and o.max_per_day>p.periods_per_day)
    or (o.min_distinct_days is not null and o.min_distinct_days>p.school_days)
  )
  having count(*)>0;
$$;
revoke all on function public.get_schedule_configuration_issues_v2() from public;
grant execute on function public.get_schedule_configuration_issues_v2() to authenticated;

-- Remove the obsolete exact-sum block error from readiness. Block templates are now
-- normalized to each assignment's actual hours by normalize_schedule_block_pattern_v2().
alter function public.get_schedule_preparation_readiness()
rename to get_schedule_preparation_readiness_before_flexible_blocks_v2;

create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select *
  from public.get_schedule_preparation_readiness_before_flexible_blocks_v2()
  where code<>'BLOCK_PATTERN_ASSIGNMENT_MISMATCH'
  union all
  select 'yapılandırma','SCOPED_RULE_CONFIGURATION_INVALID','error',i.affected_count,i.detail
  from public.get_schedule_configuration_issues_v2() i
  where i.code='SCOPED_RULE_CONFIGURATION_INVALID';
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;

-- The renamed 709 readiness wrapper resolves get_schedule_configuration_issues_v2()
-- at execution time, so scoped configuration issues are already included there.
-- Only remove the obsolete exact block-sum error; do not union configuration twice.
create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select *
  from public.get_schedule_preparation_readiness_before_flexible_blocks_v2()
  where code<>'BLOCK_PATTERN_ASSIGNMENT_MISMATCH';
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;

-- Assignment-specific overrides customize teacher/block timing while preserving
-- class-wide pedagogical max-per-day and minimum-spread rules.
create or replace function public.get_effective_schedule_rule_v2(
  p_requirement_id uuid,
  p_teacher_assignment_id uuid default null
)
returns public.course_schedule_rules
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_course uuid;
  v_base public.course_schedule_rules%rowtype;
  v_req_override public.schedule_rule_overrides%rowtype;
  v_assignment_override public.schedule_rule_overrides%rowtype;
  v_result public.course_schedule_rules%rowtype;
  v_req_found boolean:=false;
  v_assignment_found boolean:=false;
begin
  select course_id into v_course from public.class_course_requirements where id=p_requirement_id;
  if v_course is null then return null;end if;

  select * into v_base from public.course_schedule_rules where course_id=v_course and active=true limit 1;
  if not found then
    v_base.course_id:=v_course;
    v_base.block_pattern:='{}'::smallint[];
    v_base.preferred_days:='{}'::smallint[];v_base.prohibited_days:='{}'::smallint[];
    v_base.preferred_periods:='{}'::smallint[];v_base.prohibited_periods:='{}'::smallint[];
    v_base.avoid_last_period:=false;v_base.active:=true;
  end if;

  select * into v_req_override from public.schedule_rule_overrides
  where class_course_requirement_id=p_requirement_id and active=true limit 1;
  v_req_found:=found;
  if v_req_found then
    v_base.id:=v_req_override.id;
    v_base.course_id:=v_course;
    v_base.block_pattern:=v_req_override.block_pattern;
    v_base.max_per_day:=v_req_override.max_per_day;
    v_base.min_distinct_days:=v_req_override.min_distinct_days;
    v_base.preferred_days:=v_req_override.preferred_days;
    v_base.prohibited_days:=v_req_override.prohibited_days;
    v_base.preferred_periods:=v_req_override.preferred_periods;
    v_base.prohibited_periods:=v_req_override.prohibited_periods;
    v_base.avoid_last_period:=v_req_override.avoid_last_period;
    v_base.note:=v_req_override.note;
    v_base.active:=v_req_override.active;
    v_base.updated_at:=v_req_override.updated_at;
  end if;

  if p_teacher_assignment_id is not null then
    select * into v_assignment_override from public.schedule_rule_overrides
    where teacher_assignment_id=p_teacher_assignment_id and active=true limit 1;
    v_assignment_found:=found;
  end if;

  if not v_assignment_found then return v_base;end if;

  v_result:=v_base;
  v_result.id:=v_assignment_override.id;
  -- Empty teacher-level arrays mean "inherit class/general value".
  if cardinality(v_assignment_override.block_pattern)>0 then v_result.block_pattern:=v_assignment_override.block_pattern;end if;
  if cardinality(v_assignment_override.preferred_days)>0 then v_result.preferred_days:=v_assignment_override.preferred_days;end if;
  if cardinality(v_assignment_override.prohibited_days)>0 then v_result.prohibited_days:=v_assignment_override.prohibited_days;end if;
  if cardinality(v_assignment_override.preferred_periods)>0 then v_result.preferred_periods:=v_assignment_override.preferred_periods;end if;
  if cardinality(v_assignment_override.prohibited_periods)>0 then v_result.prohibited_periods:=v_assignment_override.prohibited_periods;end if;
  if v_assignment_override.avoid_last_period then v_result.avoid_last_period:=true;end if;
  if nullif(trim(coalesce(v_assignment_override.note,'')),'') is not null then v_result.note:=v_assignment_override.note;end if;
  -- max_per_day/min_distinct_days intentionally stay inherited from class/general rule.
  return v_result;
end;
$$;
revoke all on function public.get_effective_schedule_rule_v2(uuid,uuid) from public;
grant execute on function public.get_effective_schedule_rule_v2(uuid,uuid) to authenticated;