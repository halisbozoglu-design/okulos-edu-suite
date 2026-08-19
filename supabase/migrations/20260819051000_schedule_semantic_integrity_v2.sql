-- OkulOS Timetable V2 semantic integrity.
-- Makes timetable rows traceable to curriculum + teacher assignment and centralizes hard/soft scheduling rules.

create table if not exists public.schedule_time_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  teaching_days smallint[] not null default array[1,2,3,4,5]::smallint[],
  periods_per_day smallint not null default 8 check(periods_per_day between 1 and 12),
  lunch_after_period smallint,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(lunch_after_period is null or lunch_after_period between 1 and 11)
);

insert into public.schedule_time_profiles(name,teaching_days,periods_per_day,active)
values('Varsayılan Okul Zaman Şablonu',array[1,2,3,4,5]::smallint[],8,true)
on conflict(name) do nothing;

create unique index if not exists uq_schedule_time_profile_active
on public.schedule_time_profiles((active)) where active=true;

alter table public.teacher_schedule
  add column if not exists course_id uuid references public.course_catalog(id) on delete restrict,
  add column if not exists class_course_requirement_id uuid references public.class_course_requirements(id) on delete restrict,
  add column if not exists teacher_assignment_id uuid references public.teacher_course_assignments(id) on delete restrict,
  add column if not exists source_kind text not null default 'legacy' check(source_kind in ('legacy','manual','solver','import'));

-- Best-effort legacy backfill only when the mapping is unambiguous.
with candidates as (
  select ts.id schedule_id,a.id assignment_id,r.id requirement_id,r.course_id,
         count(*) over(partition by ts.id) match_count
  from public.teacher_schedule ts
  join public.teacher_course_assignments a on a.teacher_id=ts.teacher_id
  join public.class_course_requirements r on r.id=a.class_course_requirement_id and r.class_id=ts.class_id
  join public.course_catalog c on c.id=r.course_id and lower(trim(c.name))=lower(trim(ts.subject))
  where ts.class_course_requirement_id is null
)
update public.teacher_schedule ts
set teacher_assignment_id=c.assignment_id,
    class_course_requirement_id=c.requirement_id,
    course_id=c.course_id
from candidates c
where c.schedule_id=ts.id and c.match_count=1;

alter table public.teacher_schedule_constraints
  add column if not exists max_daily_hours smallint check(max_daily_hours between 1 and 12),
  add column if not exists max_working_days smallint check(max_working_days between 1 and 7),
  add column if not exists min_working_days smallint check(min_working_days between 1 and 7),
  add column if not exists preferred_free_day smallint check(preferred_free_day between 1 and 7);

create table if not exists public.teacher_schedule_preferences (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  weekday smallint not null check(weekday between 1 and 7),
  period smallint not null check(period between 1 and 12),
  preference text not null check(preference in ('prefer','avoid')),
  weight integer not null default 5 check(weight between 1 and 100),
  note text,
  active boolean not null default true,
  unique(teacher_id,weekday,period,preference)
);

create table if not exists public.course_schedule_rules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null unique references public.course_catalog(id) on delete cascade,
  block_pattern smallint[] not null default '{}'::smallint[],
  max_per_day smallint check(max_per_day between 1 and 8),
  min_distinct_days smallint check(min_distinct_days between 1 and 7),
  preferred_days smallint[] not null default '{}'::smallint[],
  prohibited_days smallint[] not null default '{}'::smallint[],
  preferred_periods smallint[] not null default '{}'::smallint[],
  prohibited_periods smallint[] not null default '{}'::smallint[],
  avoid_last_period boolean not null default false,
  note text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_sync_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  class_id uuid references public.school_classes(id) on delete cascade,
  required_simultaneous boolean not null default true,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_sync_group_members (
  id uuid primary key default gen_random_uuid(),
  sync_group_id uuid not null references public.schedule_sync_groups(id) on delete cascade,
  teacher_assignment_id uuid not null references public.teacher_course_assignments(id) on delete cascade,
  subgroup_id uuid references public.class_subgroups(id) on delete restrict,
  block_hours smallint not null default 1 check(block_hours between 1 and 6),
  unique(sync_group_id,teacher_assignment_id,subgroup_id)
);

alter table public.schedule_time_profiles enable row level security;
alter table public.teacher_schedule_preferences enable row level security;
alter table public.course_schedule_rules enable row level security;
alter table public.schedule_sync_groups enable row level security;
alter table public.schedule_sync_group_members enable row level security;

grant select on public.schedule_time_profiles,public.teacher_schedule_preferences,public.course_schedule_rules,public.schedule_sync_groups,public.schedule_sync_group_members to authenticated;
grant insert,update,delete on public.schedule_time_profiles,public.teacher_schedule_preferences,public.course_schedule_rules,public.schedule_sync_groups,public.schedule_sync_group_members to authenticated;

create policy "authenticated read schedule time profiles" on public.schedule_time_profiles for select to authenticated using(true);
create policy "managers manage schedule time profiles" on public.schedule_time_profiles for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "authenticated read teacher schedule preferences" on public.teacher_schedule_preferences for select to authenticated using(true);
create policy "managers manage teacher schedule preferences" on public.teacher_schedule_preferences for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "authenticated read course schedule rules" on public.course_schedule_rules for select to authenticated using(true);
create policy "managers manage course schedule rules" on public.course_schedule_rules for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "authenticated read schedule sync groups" on public.schedule_sync_groups for select to authenticated using(true);
create policy "managers manage schedule sync groups" on public.schedule_sync_groups for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "authenticated read schedule sync members" on public.schedule_sync_group_members for select to authenticated using(true);
create policy "managers manage schedule sync members" on public.schedule_sync_group_members for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.get_active_schedule_time_profile()
returns public.schedule_time_profiles
language sql stable security definer set search_path=public as $$
  select * from public.schedule_time_profiles where active=true order by updated_at desc limit 1;
$$;
revoke all on function public.get_active_schedule_time_profile() from public;
grant execute on function public.get_active_schedule_time_profile() to authenticated;

create or replace function public.validate_schedule_semantics_v2()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_assignment public.teacher_course_assignments%rowtype;
  v_req public.class_course_requirements%rowtype;
  v_course public.course_catalog%rowtype;
  v_profile public.schedule_time_profiles%rowtype;
  v_constraint public.teacher_schedule_constraints%rowtype;
  v_rule public.course_schedule_rules%rowtype;
  v_daily integer;
  v_days integer;
  v_assignment_hours integer;
begin
  -- All new/edited active rows must be semantically linked. Existing legacy rows remain readable but fail publish readiness.
  if new.active and (new.teacher_assignment_id is null or new.class_course_requirement_id is null or new.course_id is null) then
    raise exception 'SCHEDULE_SEMANTIC_LINK_REQUIRED';
  end if;
  if not new.active then return new; end if;

  select * into v_assignment from public.teacher_course_assignments where id=new.teacher_assignment_id;
  if not found then raise exception 'TEACHER_ASSIGNMENT_NOT_FOUND'; end if;
  select * into v_req from public.class_course_requirements where id=v_assignment.class_course_requirement_id;
  if not found then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;
  select * into v_course from public.course_catalog where id=v_req.course_id and active=true;
  if not found then raise exception 'COURSE_NOT_FOUND'; end if;

  if v_assignment.teacher_id<>new.teacher_id then raise exception 'SCHEDULE_TEACHER_ASSIGNMENT_MISMATCH'; end if;
  if v_req.id<>new.class_course_requirement_id or v_req.class_id is distinct from new.class_id then raise exception 'SCHEDULE_REQUIREMENT_MISMATCH'; end if;
  if v_course.id<>new.course_id then raise exception 'SCHEDULE_COURSE_MISMATCH'; end if;
  new.subject:=v_course.name;
  select class_name into new.class_name from public.school_classes where id=v_req.class_id;

  select * into v_profile from public.schedule_time_profiles where active=true limit 1;
  if found then
    if not(new.weekday=any(v_profile.teaching_days)) then raise exception 'DAY_OUTSIDE_ACTIVE_TIME_PROFILE'; end if;
    if new.period<1 or new.period>v_profile.periods_per_day then raise exception 'PERIOD_OUTSIDE_ACTIVE_TIME_PROFILE'; end if;
  end if;

  select * into v_constraint from public.teacher_schedule_constraints where teacher_id=new.teacher_id;
  if found and v_constraint.max_daily_hours is not null then
    select count(*) into v_daily from public.teacher_schedule ts
    where ts.teacher_id=new.teacher_id and ts.weekday=new.weekday and ts.active=true
      and ts.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
    if v_daily+1>v_constraint.max_daily_hours then raise exception 'TEACHER_DAILY_LIMIT_EXCEEDED'; end if;
  end if;

  if found and v_constraint.max_working_days is not null then
    select count(distinct weekday) into v_days from public.teacher_schedule ts
    where ts.teacher_id=new.teacher_id and ts.active=true
      and ts.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
    if not exists(select 1 from public.teacher_schedule ts where ts.teacher_id=new.teacher_id and ts.active=true and ts.weekday=new.weekday and ts.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)) then v_days:=v_days+1; end if;
    if v_days>v_constraint.max_working_days then raise exception 'TEACHER_MAX_WORKING_DAYS_EXCEEDED'; end if;
  end if;

  select count(*) into v_assignment_hours from public.teacher_schedule ts
  where ts.teacher_assignment_id=new.teacher_assignment_id and ts.active=true
    and ts.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
  if v_assignment_hours+1>v_assignment.assigned_hours then raise exception 'TEACHER_ASSIGNMENT_HOURS_EXCEEDED'; end if;

  select * into v_rule from public.course_schedule_rules where course_id=new.course_id and active=true;
  if found then
    if cardinality(v_rule.prohibited_days)>0 and new.weekday=any(v_rule.prohibited_days) then raise exception 'COURSE_DAY_PROHIBITED'; end if;
    if cardinality(v_rule.prohibited_periods)>0 and new.period=any(v_rule.prohibited_periods) then raise exception 'COURSE_PERIOD_PROHIBITED'; end if;
    if v_rule.max_per_day is not null and (
      select count(*) from public.teacher_schedule ts
      where ts.class_id=new.class_id and ts.course_id=new.course_id and ts.weekday=new.weekday and ts.active=true
        and ts.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)
    )+1>v_rule.max_per_day then raise exception 'COURSE_DAILY_LIMIT_EXCEEDED'; end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_schedule_semantics_v2 on public.teacher_schedule;
create trigger trg_validate_schedule_semantics_v2
before insert or update on public.teacher_schedule
for each row execute function public.validate_schedule_semantics_v2();

create or replace function public.upsert_schedule_slot_v2(
  p_teacher_assignment_id uuid,
  p_weekday smallint,
  p_period smallint,
  p_classroom_id uuid default null,
  p_subgroup_id uuid default null,
  p_schedule_id uuid default null,
  p_locked boolean default false,
  p_source_kind text default 'manual'
)
returns uuid
language plpgsql security definer set search_path=public as $$
declare
  v_a public.teacher_course_assignments%rowtype;
  v_r public.class_course_requirements%rowtype;
  v_c public.course_catalog%rowtype;
  v_id uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select * into v_a from public.teacher_course_assignments where id=p_teacher_assignment_id;
  if not found then raise exception 'TEACHER_ASSIGNMENT_NOT_FOUND'; end if;
  select * into v_r from public.class_course_requirements where id=v_a.class_course_requirement_id;
  select * into v_c from public.course_catalog where id=v_r.course_id;
  if p_schedule_id is null then
    insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,is_group_split,active,locked,course_id,class_course_requirement_id,teacher_assignment_id,source_kind)
    values(v_a.teacher_id,v_r.class_id,p_weekday,p_period,(select class_name from public.school_classes where id=v_r.class_id),v_c.name,p_classroom_id,p_subgroup_id,p_subgroup_id is not null,true,p_locked,v_c.id,v_r.id,v_a.id,coalesce(nullif(p_source_kind,''),'manual'))
    returning id into v_id;
  else
    update public.teacher_schedule set teacher_id=v_a.teacher_id,class_id=v_r.class_id,weekday=p_weekday,period=p_period,
      class_name=(select class_name from public.school_classes where id=v_r.class_id),subject=v_c.name,classroom_id=p_classroom_id,
      subgroup_id=p_subgroup_id,is_group_split=p_subgroup_id is not null,locked=p_locked,course_id=v_c.id,
      class_course_requirement_id=v_r.id,teacher_assignment_id=v_a.id,source_kind=coalesce(nullif(p_source_kind,''),'manual'),active=true,updated_at=now()
    where id=p_schedule_id returning id into v_id;
    if v_id is null then raise exception 'SCHEDULE_ROW_NOT_FOUND'; end if;
  end if;
  return v_id;
end;
$$;
revoke all on function public.upsert_schedule_slot_v2(uuid,smallint,smallint,uuid,uuid,uuid,boolean,text) from public;
grant execute on function public.upsert_schedule_slot_v2(uuid,smallint,smallint,uuid,uuid,uuid,boolean,text) to authenticated;
