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
