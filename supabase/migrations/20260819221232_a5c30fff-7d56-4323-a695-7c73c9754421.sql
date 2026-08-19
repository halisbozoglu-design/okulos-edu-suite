-- 20260819072100_timetable_revision_scope_completion.sql
do $$
declare
  t text;
begin
  foreach t in array array[
    'schedule_generation_settings',
    'school_classes',
    'course_catalog',
    'class_subgroups',
    'quran_split_plans',
    'area_course_permissions',
    'teaching_areas'
  ] loop
    if to_regclass('public.'||t) is not null then
      execute format('drop trigger if exists trg_schedule_revision_%I on public.%I',t,t);
      execute format(
        'create trigger trg_schedule_revision_%I after insert or update or delete on public.%I for each statement execute function public.bump_schedule_engine_revision()',
        t,t
      );
    end if;
  end loop;
end;
$$;

drop trigger if exists trg_schedule_revision_profile_teaching_area on public.profiles;
create trigger trg_schedule_revision_profile_teaching_area
after update of teaching_area_id on public.profiles
for each statement execute function public.bump_schedule_engine_revision();

-- 20260819072200_timetable_rule_scope_overrides_v2.sql
create table if not exists public.schedule_rule_overrides(
  id uuid primary key default gen_random_uuid(),
  class_course_requirement_id uuid references public.class_course_requirements(id) on delete cascade,
  teacher_assignment_id uuid references public.teacher_course_assignments(id) on delete cascade,
  block_pattern smallint[] not null default '{}'::smallint[],
  max_per_day smallint check(max_per_day between 1 and 12),
  min_distinct_days smallint check(min_distinct_days between 1 and 7),
  preferred_days smallint[] not null default '{}'::smallint[],
  prohibited_days smallint[] not null default '{}'::smallint[],
  preferred_periods smallint[] not null default '{}'::smallint[],
  prohibited_periods smallint[] not null default '{}'::smallint[],
  avoid_last_period boolean not null default false,
  note text,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  check(num_nonnulls(class_course_requirement_id,teacher_assignment_id)=1)
);

create unique index if not exists uq_schedule_rule_override_requirement
on public.schedule_rule_overrides(class_course_requirement_id)
where class_course_requirement_id is not null;

create unique index if not exists uq_schedule_rule_override_assignment
on public.schedule_rule_overrides(teacher_assignment_id)
where teacher_assignment_id is not null;

alter table public.schedule_rule_overrides enable row level security;
grant select,insert,update,delete on public.schedule_rule_overrides to authenticated;
grant all on public.schedule_rule_overrides to service_role;
drop policy if exists "authenticated read schedule rule overrides" on public.schedule_rule_overrides;
create policy "authenticated read schedule rule overrides" on public.schedule_rule_overrides
for select to authenticated using(true);
drop policy if exists "managers manage schedule rule overrides" on public.schedule_rule_overrides;
create policy "managers manage schedule rule overrides" on public.schedule_rule_overrides
for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

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
    select class_course_requirement_id into v_req
    from public.teacher_course_assignments where id=new.teacher_assignment_id;
    if v_req is null then raise exception 'RULE_OVERRIDE_ASSIGNMENT_NOT_FOUND';end if;
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
  elsif exists(select 1 from unnest(new.preferred_periods) x where x<1 or x>12)
     or exists(select 1 from unnest(new.prohibited_periods) x where x<1 or x>12) then raise exception 'INVALID_RULE_PERIOD';end if;

  if exists(select 1 from unnest(new.preferred_periods) a join unnest(new.prohibited_periods) b on a=b) then raise exception 'PREFERRED_AND_PROHIBITED_PERIOD_OVERLAP';end if;
  new.updated_at:=now();
  return new;
end;
$$;

drop trigger if exists trg_validate_schedule_rule_override_v2 on public.schedule_rule_overrides;
create trigger trg_validate_schedule_rule_override_v2
before insert or update on public.schedule_rule_overrides
for each row execute function public.validate_schedule_rule_override_v2();

create or replace function public.normalize_schedule_block_pattern_v2(p_pattern smallint[],p_hours integer)
returns smallint[]
language plpgsql
immutable
set search_path=public
as $$
declare
  v_result smallint[]:='{}'::smallint[];
  v_remaining integer:=greatest(coalesce(p_hours,0),0);
  v_block smallint;
  v_idx integer:=1;
begin
  if v_remaining=0 then return v_result;end if;
  while v_remaining>0 loop
    if p_pattern is not null and cardinality(p_pattern)>=v_idx then
      v_block:=least(greatest(p_pattern[v_idx],1),v_remaining)::smallint;
      v_idx:=v_idx+1;
    else
      v_block:=1;
    end if;
    v_result:=array_append(v_result,v_block);
    v_remaining:=v_remaining-v_block;
  end loop;
  return v_result;
end;
$$;

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
  v_override public.schedule_rule_overrides%rowtype;
  v_result public.course_schedule_rules%rowtype;
  v_override_found boolean:=false;
begin
  select course_id into v_course from public.class_course_requirements where id=p_requirement_id;
  if v_course is null then return null;end if;

  if p_teacher_assignment_id is not null then
    select * into v_override from public.schedule_rule_overrides
    where teacher_assignment_id=p_teacher_assignment_id and active=true limit 1;
    v_override_found:=found;
  end if;
  if not v_override_found then
    select * into v_override from public.schedule_rule_overrides
    where class_course_requirement_id=p_requirement_id and active=true limit 1;
    v_override_found:=found;
  end if;

  if v_override_found then
    v_result.id:=v_override.id;
    v_result.course_id:=v_course;
    v_result.block_pattern:=v_override.block_pattern;
    v_result.max_per_day:=v_override.max_per_day;
    v_result.min_distinct_days:=v_override.min_distinct_days;
    v_result.preferred_days:=v_override.preferred_days;
    v_result.prohibited_days:=v_override.prohibited_days;
    v_result.preferred_periods:=v_override.preferred_periods;
    v_result.prohibited_periods:=v_override.prohibited_periods;
    v_result.avoid_last_period:=v_override.avoid_last_period;
    v_result.note:=v_override.note;
    v_result.active:=v_override.active;
    v_result.updated_at:=v_override.updated_at;
    return v_result;
  end if;

  select * into v_base from public.course_schedule_rules
  where course_id=v_course and active=true limit 1;
  return v_base;
end;
$$;
revoke all on function public.get_effective_schedule_rule_v2(uuid,uuid) from public;
grant execute on function public.get_effective_schedule_rule_v2(uuid,uuid) to authenticated;

create or replace function public.validate_course_block_pattern_against_assignments()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.active and exists(select 1 from unnest(new.block_pattern) x where x<1 or x>6) then
    raise exception 'INVALID_BLOCK_PATTERN';
  end if;
  return new;
end;
$$;

create or replace function public.validate_assignment_against_course_block_pattern()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  return new;
end;
$$;

drop trigger if exists trg_schedule_revision_schedule_rule_overrides on public.schedule_rule_overrides;
create trigger trg_schedule_revision_schedule_rule_overrides
after insert or update or delete on public.schedule_rule_overrides
for each statement execute function public.bump_schedule_engine_revision();

-- 20260819072250_timetable_rule_scope_helper_v2.sql
create or replace function public.get_effective_schedule_rule_scope_v2(
  p_requirement_id uuid,
  p_teacher_assignment_id uuid default null
)
returns text
language sql
stable
security definer
set search_path=public
as $$
  select case
    when p_teacher_assignment_id is not null and exists(
      select 1 from public.schedule_rule_overrides o
      where o.teacher_assignment_id=p_teacher_assignment_id and o.active=true
    ) then 'assignment'
    when exists(
      select 1 from public.schedule_rule_overrides o
      where o.class_course_requirement_id=p_requirement_id and o.active=true
    ) then 'requirement'
    when exists(
      select 1
      from public.class_course_requirements r
      join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active=true
      where r.id=p_requirement_id
    ) then 'course'
    else 'none'
  end;
$$;
revoke all on function public.get_effective_schedule_rule_scope_v2(uuid,uuid) from public;
grant execute on function public.get_effective_schedule_rule_scope_v2(uuid,uuid) to authenticated;