-- Allow only the verified allow-listed bootstrap account to convert its own existing profile.
-- All other self-service identity/role changes remain blocked.

create or replace function public.protect_profile_identity_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_email text;
  v_bootstrap_allowed boolean := false;
begin
  if auth.uid() is not null then
    select lower(email) into v_auth_email from auth.users where id=auth.uid();
    select exists(
      select 1 from public.super_admin_bootstrap b
      where b.email=v_auth_email and b.active=true
    ) into v_bootstrap_allowed;
  end if;

  -- A claimed super admin may administer other profiles.
  if public.is_super_admin() and auth.uid() <> old.user_id then
    return new;
  end if;

  -- One-time bootstrap conversion: verified allow-listed account may convert only its own row.
  if auth.uid() = old.user_id
     and v_bootstrap_allowed
     and new.user_id = old.user_id
     and new.email = v_auth_email
     and new.role = 'admin'
     and new.is_super_admin = true
     and new.tckn is null then
    return new;
  end if;

  if auth.uid() = old.user_id then
    if new.user_id is distinct from old.user_id
      or new.tckn is distinct from old.tckn
      or new.email is distinct from old.email
      or new.full_name is distinct from old.full_name
      or new.role is distinct from old.role
      or new.is_super_admin is distinct from old.is_super_admin then
      raise exception 'PROTECTED_PROFILE_FIELD';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_identity_fields on public.profiles;
create trigger trg_protect_profile_identity_fields
before update on public.profiles
for each row execute function public.protect_profile_identity_fields();

-- NULL TCKN is reserved for admin bootstrap/system admin accounts.
alter table public.profiles
  drop constraint if exists profiles_non_admin_tckn_required;
alter table public.profiles
  add constraint profiles_non_admin_tckn_required
  check (role = 'admin' or (tckn is not null and tckn ~ '^\d{11}$')) not valid;

-- Stronger identity validation for normal OkulOS users.
-- Super Admin may have NULL TCKN; normal TCKNs must satisfy the official checksum structure.

create or replace function public.is_valid_tckn(p_tckn text)
returns boolean
language plpgsql
immutable
strict
set search_path = public
as $$
declare
  d integer[];
  v_tenth integer;
  v_eleventh integer;
begin
  if p_tckn !~ '^\d{11}$' or left(p_tckn, 1) = '0' then
    return false;
  end if;

  d := array[
    substr(p_tckn,1,1)::integer, substr(p_tckn,2,1)::integer,
    substr(p_tckn,3,1)::integer, substr(p_tckn,4,1)::integer,
    substr(p_tckn,5,1)::integer, substr(p_tckn,6,1)::integer,
    substr(p_tckn,7,1)::integer, substr(p_tckn,8,1)::integer,
    substr(p_tckn,9,1)::integer, substr(p_tckn,10,1)::integer,
    substr(p_tckn,11,1)::integer
  ];

  v_tenth := (((d[1]+d[3]+d[5]+d[7]+d[9]) * 7 - (d[2]+d[4]+d[6]+d[8])) % 10 + 10) % 10;
  v_eleventh := (d[1]+d[2]+d[3]+d[4]+d[5]+d[6]+d[7]+d[8]+d[9]+d[10]) % 10;

  return d[10] = v_tenth and d[11] = v_eleventh;
end;
$$;

revoke all on function public.is_valid_tckn(text) from public;
grant execute on function public.is_valid_tckn(text) to authenticated;

alter table public.pre_registered_teachers
  drop constraint if exists pre_registered_teachers_tckn_algorithm_chk;
alter table public.pre_registered_teachers
  add constraint pre_registered_teachers_tckn_algorithm_chk
  check (public.is_valid_tckn(tckn)) not valid;

alter table public.profiles
  drop constraint if exists profiles_tckn_algorithm_chk;
alter table public.profiles
  add constraint profiles_tckn_algorithm_chk
  check (tckn is null or public.is_valid_tckn(tckn)) not valid;

alter table public.profiles
  drop constraint if exists profiles_phone_tr_mobile_chk;
alter table public.profiles
  add constraint profiles_phone_tr_mobile_chk
  check (phone is null or phone ~ '^05\d{9}$') not valid;

-- OkulOS central academic year / working calendar engine.
-- Schedule, duty, exams and payroll should consume the same date source.

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  teacher_work_starts_on date,
  teaching_starts_on date,
  first_term_ends_on date,
  second_term_starts_on date,
  teaching_ends_on date,
  active boolean not null default false,
  source_note text,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (teaching_ends_on is null or teaching_starts_on is null or teaching_ends_on >= teaching_starts_on)
);

create unique index if not exists uq_academic_year_one_active on public.academic_years((active)) where active = true;

create table if not exists public.school_calendar_events (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  event_type text not null check (event_type in (
    'holiday','break','professional_work','teaching_day','exam_window','common_exam_window','responsibility_exam_window','ceremony','other'
  )),
  title text not null,
  starts_on date not null,
  ends_on date not null,
  blocks_teaching boolean not null default false,
  counts_as_workday boolean not null default false,
  all_day boolean not null default true,
  note text,
  source_note text,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create index if not exists idx_school_calendar_events_year_dates on public.school_calendar_events(academic_year_id, starts_on, ends_on);

alter table public.academic_years enable row level security;
alter table public.school_calendar_events enable row level security;

grant select on public.academic_years, public.school_calendar_events to authenticated;
grant insert, update, delete on public.academic_years, public.school_calendar_events to authenticated;

create policy "authenticated read academic years" on public.academic_years for select to authenticated using (true);
create policy "authenticated read calendar events" on public.school_calendar_events for select to authenticated using (true);
create policy "managers manage academic years" on public.academic_years for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers manage calendar events" on public.school_calendar_events for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());

create or replace function public.set_active_academic_year(p_academic_year_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if not exists(select 1 from public.academic_years where id=p_academic_year_id) then raise exception 'ACADEMIC_YEAR_NOT_FOUND'; end if;
  update public.academic_years set active=false,updated_at=now() where active=true and id<>p_academic_year_id;
  update public.academic_years set active=true,updated_at=now() where id=p_academic_year_id;
  return true;
end;
$$;
revoke all on function public.set_active_academic_year(uuid) from public;
grant execute on function public.set_active_academic_year(uuid) to authenticated;

create or replace function public.get_active_academic_year()
returns public.academic_years
language sql
stable
security definer
set search_path=public
as $$
  select ay from public.academic_years ay where ay.active=true limit 1;
$$;
revoke all on function public.get_active_academic_year() from public;
grant execute on function public.get_active_academic_year() to authenticated;

create or replace function public.is_teaching_day(p_date date)
returns boolean
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_year public.academic_years%rowtype;
  v_block boolean;
begin
  select * into v_year from public.academic_years where active=true limit 1;
  if not found then return false; end if;
  if v_year.teaching_starts_on is null or v_year.teaching_ends_on is null then return false; end if;
  if p_date < v_year.teaching_starts_on or p_date > v_year.teaching_ends_on then return false; end if;
  if extract(isodow from p_date)::int in (6,7) then return false; end if;
  select exists(
    select 1 from public.school_calendar_events e
    where e.academic_year_id=v_year.id and e.blocks_teaching=true and p_date between e.starts_on and e.ends_on
  ) into v_block;
  return not v_block;
end;
$$;
revoke all on function public.is_teaching_day(date) from public;
grant execute on function public.is_teaching_day(date) to authenticated;

create or replace function public.get_calendar_days(p_from date, p_to date)
returns table(
  day_date date,
  is_weekday boolean,
  is_teaching_day boolean,
  is_workday boolean,
  event_titles text[]
)
language sql
stable
security definer
set search_path=public
as $$
  with ay as (select * from public.academic_years where active=true limit 1),
  days as (select generate_series(p_from::timestamp,p_to::timestamp,interval '1 day')::date as d)
  select d.d,
    extract(isodow from d.d)::int between 1 and 5,
    public.is_teaching_day(d.d),
    (
      (extract(isodow from d.d)::int between 1 and 5 and exists(select 1 from ay where d.d between starts_on and ends_on))
      or exists(select 1 from public.school_calendar_events e, ay where e.academic_year_id=ay.id and e.counts_as_workday=true and d.d between e.starts_on and e.ends_on)
    ) and not exists(select 1 from public.school_calendar_events e, ay where e.academic_year_id=ay.id and e.event_type='holiday' and d.d between e.starts_on and e.ends_on) as is_workday,
    coalesce(array(
      select e.title from public.school_calendar_events e, ay
      where e.academic_year_id=ay.id and d.d between e.starts_on and e.ends_on
      order by e.starts_on,e.title
    ),array[]::text[]) as event_titles
  from days d
  order by d.d;
$$;
revoke all on function public.get_calendar_days(date,date) from public;
grant execute on function public.get_calendar_days(date,date) to authenticated;

create or replace function public.assert_date_in_active_academic_year(p_date date)
returns boolean
language plpgsql
stable
security definer
set search_path=public
as $$
begin
  if not exists(select 1 from public.academic_years where active=true and p_date between starts_on and ends_on) then
    raise exception 'DATE_OUTSIDE_ACTIVE_ACADEMIC_YEAR';
  end if;
  return true;
end;
$$;
revoke all on function public.assert_date_in_active_academic_year(date) from public;
grant execute on function public.assert_date_in_active_academic_year(date) to authenticated;

-- Connect central calendar to timetable publication and duty operations.

create or replace function public.publish_current_schedule(
  p_effective_from date,
  p_academic_year text default null,
  p_title text default 'Haftalık Ders Programı',
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_publication_id uuid;
  v_hash text;
  v_count integer;
  v_payload text;
  v_year public.academic_years%rowtype;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_effective_from is null then raise exception 'EFFECTIVE_DATE_REQUIRED'; end if;

  select * into v_year from public.academic_years where active=true limit 1;
  if not found then raise exception 'ACTIVE_ACADEMIC_YEAR_REQUIRED'; end if;
  if p_effective_from < v_year.starts_on or p_effective_from > v_year.ends_on then
    raise exception 'EFFECTIVE_DATE_OUTSIDE_ACTIVE_ACADEMIC_YEAR';
  end if;

  perform public.assert_curriculum_ready_for_timetable();

  select count(*)::integer into v_count from public.teacher_schedule where active=true;
  if v_count=0 then raise exception 'EMPTY_SCHEDULE_CANNOT_BE_PUBLISHED'; end if;

  select string_agg(
    concat_ws('|',ts.teacher_id::text,coalesce(ts.class_id::text,''),ts.weekday::text,ts.period::text,ts.class_name,ts.subject,
      coalesce(ts.classroom,''),coalesce(ts.classroom_id::text,''),coalesce(ts.subgroup_id::text,''),coalesce(ts.subgroup_key,''),ts.is_group_split::text),
    E'\n' order by ts.teacher_id,ts.weekday,ts.period,coalesce(ts.subgroup_key,''),ts.id
  ) into v_payload from public.teacher_schedule ts where ts.active=true;
  v_hash:=encode(digest(coalesce(v_payload,''),'sha256'),'hex');

  insert into public.schedule_publications(effective_from,academic_year,title,note,schedule_hash,row_count,published_by)
  values(p_effective_from,coalesce(nullif(trim(p_academic_year),''),v_year.code),coalesce(nullif(trim(p_title),''),'Haftalık Ders Programı'),nullif(trim(p_note),''),v_hash,v_count,auth.uid())
  returning id into v_publication_id;

  insert into public.schedule_publication_rows(
    publication_id,source_schedule_id,teacher_id,class_id,weekday,period,class_name,subject,classroom,classroom_id,subgroup_id,subgroup_key,is_group_split,snapshot
  )
  select v_publication_id,ts.id,ts.teacher_id,ts.class_id,ts.weekday,ts.period,ts.class_name,ts.subject,ts.classroom,ts.classroom_id,
    ts.subgroup_id,ts.subgroup_key,ts.is_group_split,to_jsonb(ts)
  from public.teacher_schedule ts where ts.active=true
  order by ts.teacher_id,ts.weekday,ts.period,coalesce(ts.subgroup_key,''),ts.id;

  return v_publication_id;
end;
$$;

create or replace function public.guard_operational_date_in_academic_year()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare v_date date;
begin
  v_date:=case when tg_table_name='duty_rotation' then new.duty_date else new.duty_date end;
  if not exists(select 1 from public.academic_years where active=true and v_date between starts_on and ends_on) then
    raise exception 'DUTY_DATE_OUTSIDE_ACTIVE_ACADEMIC_YEAR';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_duty_rotation_academic_year on public.duty_rotation;
create trigger trg_guard_duty_rotation_academic_year
before insert or update of duty_date on public.duty_rotation
for each row execute function public.guard_operational_date_in_academic_year();

drop trigger if exists trg_guard_teacher_duty_academic_year on public.teacher_duty_assignments;
create trigger trg_guard_teacher_duty_academic_year
before insert or update of duty_date on public.teacher_duty_assignments
for each row execute function public.guard_operational_date_in_academic_year();