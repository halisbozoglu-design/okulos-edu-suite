create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  room_type text not null default 'standard',
  capacity integer not null check (capacity > 0),
  department text,
  hardware jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_room_rules (
  id uuid primary key default gen_random_uuid(),
  subject_pattern text not null,
  required_room_type text,
  required_department text,
  required_hardware jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  unique(subject_pattern)
);

create table if not exists public.teacher_schedule_constraints (
  teacher_id uuid primary key references public.profiles(user_id) on delete cascade,
  max_weekly_hours smallint check (max_weekly_hours between 1 and 60),
  max_consecutive_hours smallint not null default 4 check (max_consecutive_hours between 1 and 12),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_unavailability (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  period smallint not null check (period between 1 and 12),
  reason text not null default 'unavailable',
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz,
  active boolean not null default true,
  unique(teacher_id, weekday, period)
);

create table if not exists public.class_subgroups (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.school_classes(id) on delete cascade,
  subgroup_key text not null,
  label text,
  active boolean not null default true,
  unique(class_id, subgroup_key)
);

create table if not exists public.class_subgroup_students (
  subgroup_id uuid not null references public.class_subgroups(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  primary key(subgroup_id, student_id)
);

alter table public.teacher_schedule
  add column if not exists classroom_id uuid references public.classrooms(id) on delete restrict,
  add column if not exists subgroup_id uuid references public.class_subgroups(id) on delete restrict;

create unique index if not exists uq_teacher_schedule_classroom_slot
  on public.teacher_schedule(classroom_id, weekday, period)
  where active = true and classroom_id is not null;

alter table public.classrooms enable row level security;
alter table public.lesson_room_rules enable row level security;
alter table public.teacher_schedule_constraints enable row level security;
alter table public.teacher_unavailability enable row level security;
alter table public.class_subgroups enable row level security;
alter table public.class_subgroup_students enable row level security;

grant select on public.classrooms, public.lesson_room_rules, public.teacher_schedule_constraints,
  public.teacher_unavailability, public.class_subgroups, public.class_subgroup_students to authenticated;
grant insert, update, delete on public.classrooms, public.lesson_room_rules, public.teacher_schedule_constraints,
  public.teacher_unavailability, public.class_subgroups, public.class_subgroup_students to authenticated;

create policy "authenticated read classrooms" on public.classrooms for select to authenticated using (true);
create policy "managers manage classrooms" on public.classrooms for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read room rules" on public.lesson_room_rules for select to authenticated using (true);
create policy "managers manage room rules" on public.lesson_room_rules for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read teacher constraints" on public.teacher_schedule_constraints for select to authenticated using (true);
create policy "managers manage teacher constraints" on public.teacher_schedule_constraints for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read teacher unavailability" on public.teacher_unavailability for select to authenticated using (true);
create policy "managers manage teacher unavailability" on public.teacher_unavailability for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read subgroups" on public.class_subgroups for select to authenticated using (true);
create policy "managers manage subgroups" on public.class_subgroups for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read subgroup students" on public.class_subgroup_students for select to authenticated using (true);
create policy "managers manage subgroup students" on public.class_subgroup_students for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());

create or replace function public.student_count_for_schedule(p_class_id uuid, p_subgroup_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_subgroup_id is not null then (
      select count(*)::integer from public.class_subgroup_students css where css.subgroup_id = p_subgroup_id
    )
    else (
      select count(*)::integer from public.students s where s.class_id = p_class_id and s.active = true
    )
  end;
$$;

create or replace function public.max_consecutive_with_candidate(
  p_teacher_id uuid,
  p_weekday smallint,
  p_period smallint,
  p_exclude_id uuid default null
)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_periods integer[];
  v_value integer;
  v_prev integer := null;
  v_run integer := 0;
  v_max integer := 0;
begin
  select array_agg(distinct x order by x) into v_periods
  from (
    select ts.period::integer as x
    from public.teacher_schedule ts
    where ts.teacher_id = p_teacher_id
      and ts.weekday = p_weekday
      and ts.active = true
      and (p_exclude_id is null or ts.id <> p_exclude_id)
    union all select p_period::integer
  ) q;

  foreach v_value in array coalesce(v_periods, array[]::integer[]) loop
    if v_prev is not null and v_value = v_prev + 1 then v_run := v_run + 1; else v_run := 1; end if;
    v_max := greatest(v_max, v_run);
    v_prev := v_value;
  end loop;
  return v_max;
end;
$$;

create or replace function public.validate_schedule_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.classrooms%rowtype;
  v_rule public.lesson_room_rules%rowtype;
  v_class_count integer;
  v_weekly_count integer;
  v_max_weekly integer;
  v_max_consecutive integer;
  v_candidate_consecutive integer;
  v_group_class uuid;
begin
  if new.weekday not between 1 and 7 then raise exception 'INVALID_DAY'; end if;
  if new.period not between 1 and 12 then raise exception 'INVALID_PERIOD'; end if;

  if exists (
    select 1 from public.teacher_schedule ts
    where ts.teacher_id = new.teacher_id and ts.weekday = new.weekday and ts.period = new.period
      and ts.active = true and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) then raise exception 'TEACHER_DOUBLE_BOOKING'; end if;

  if exists (
    select 1 from public.teacher_unavailability u
    where u.teacher_id = new.teacher_id and u.weekday = new.weekday and u.period = new.period and u.active = true
  ) then raise exception 'TEACHER_UNAVAILABLE'; end if;

  select max_weekly_hours, max_consecutive_hours into v_max_weekly, v_max_consecutive
  from public.teacher_schedule_constraints where teacher_id = new.teacher_id;

  if v_max_weekly is not null then
    select count(*) into v_weekly_count from public.teacher_schedule ts
    where ts.teacher_id = new.teacher_id and ts.active = true
      and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
    if v_weekly_count + 1 > v_max_weekly then raise exception 'TEACHER_WEEKLY_LIMIT_EXCEEDED'; end if;
  end if;

  v_candidate_consecutive := public.max_consecutive_with_candidate(new.teacher_id, new.weekday, new.period, new.id);
  if coalesce(v_max_consecutive, 4) < v_candidate_consecutive then raise exception 'TEACHER_CONSECUTIVE_LIMIT_EXCEEDED'; end if;

  if new.classroom_id is not null then
    select * into v_room from public.classrooms where id = new.classroom_id and active = true;
    if not found then raise exception 'CLASSROOM_NOT_FOUND'; end if;

    if exists (
      select 1 from public.teacher_schedule ts
      where ts.classroom_id = new.classroom_id and ts.weekday = new.weekday and ts.period = new.period
        and ts.active = true and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) then raise exception 'ROOM_DOUBLE_BOOKING'; end if;

    select * into v_rule from public.lesson_room_rules r
    where r.active = true and new.subject ilike r.subject_pattern
    order by length(r.subject_pattern) desc limit 1;

    if found then
      if v_rule.required_room_type is not null and v_room.room_type <> v_rule.required_room_type then
        raise exception 'ROOM_TYPE_MISMATCH';
      end if;
      if v_rule.required_department is not null and coalesce(v_room.department,'') <> v_rule.required_department then
        raise exception 'ROOM_DEPARTMENT_MISMATCH';
      end if;
      if v_rule.required_hardware <> '{}'::jsonb and not (v_room.hardware @> v_rule.required_hardware) then
        raise exception 'ROOM_HARDWARE_MISMATCH';
      end if;
    end if;

    v_class_count := public.student_count_for_schedule(new.class_id, new.subgroup_id);
    if v_class_count > v_room.capacity then raise exception 'ROOM_CAPACITY_EXCEEDED'; end if;
  end if;

  if new.subgroup_id is not null then
    select class_id into v_group_class from public.class_subgroups where id = new.subgroup_id and active = true;
    if v_group_class is null or v_group_class <> new.class_id then raise exception 'SUBGROUP_CLASS_MISMATCH'; end if;
    new.is_group_split := true;
    select subgroup_key into new.subgroup_key from public.class_subgroups where id = new.subgroup_id;
  elsif new.is_group_split and coalesce(btrim(new.subgroup_key),'') = '' then
    raise exception 'SUBGROUP_REQUIRED';
  end if;

  if new.class_id is not null then
    if new.subgroup_id is null then
      if exists (
        select 1 from public.teacher_schedule ts
        where ts.class_id = new.class_id and ts.weekday = new.weekday and ts.period = new.period and ts.active = true
          and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) then raise exception 'CLASS_DOUBLE_BOOKING'; end if;
    else
      if exists (
        select 1
        from public.teacher_schedule ts
        where ts.class_id = new.class_id and ts.weekday = new.weekday and ts.period = new.period and ts.active = true
          and ts.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          and (
            ts.subgroup_id is null
            or exists (
              select 1
              from public.class_subgroup_students a
              join public.class_subgroup_students b on b.student_id = a.student_id
              where a.subgroup_id = new.subgroup_id and b.subgroup_id = ts.subgroup_id
            )
          )
      ) then raise exception 'STUDENT_GROUP_CONFLICT'; end if;
    end if;
  end if;

  if new.classroom_id is not null then
    select name into new.classroom from public.classrooms where id = new.classroom_id;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace view public.schedules
with (security_invoker = true)
as
select
  ts.id,
  ts.teacher_id,
  ts.class_id,
  ts.weekday as day_of_week,
  ts.period as period_number,
  ts.class_name,
  ts.subject,
  ts.classroom_id,
  c.name as classroom,
  ts.subgroup_id,
  ts.subgroup_key,
  ts.is_group_split,
  ts.active,
  ts.updated_at
from public.teacher_schedule ts
left join public.classrooms c on c.id = ts.classroom_id;

grant select on public.schedules to authenticated;
