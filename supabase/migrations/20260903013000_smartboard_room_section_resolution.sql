-- OkulOS -> SmartBoard canonical placement model.
-- A board belongs to a physical room. A section name is NOT a permanent identity.
-- Every academic year gets new section instances and dated room placements.
-- Runtime integration never depends on a Lovable token.

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  code text not null,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (institution_code, code)
);

create table if not exists public.physical_rooms (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  room_code text not null,
  name text not null,
  building text,
  floor_label text,
  room_type text not null default 'classroom',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_code, room_code)
);

create table if not exists public.section_instances (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  display_name text not null,
  grade_level smallint,
  branch_code text,
  program_code text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (institution_code, academic_year_id, display_name)
);

create table if not exists public.section_room_placements (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  section_instance_id uuid not null references public.section_instances(id) on delete cascade,
  physical_room_id uuid not null references public.physical_rooms(id) on delete restrict,
  valid_from date not null,
  valid_until date,
  is_primary boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until >= valid_from)
);

create table if not exists public.smartboard_room_bindings (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  smartboard_device_key text not null,
  physical_room_id uuid not null references public.physical_rooms(id) on delete restrict,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until >= valid_from)
);

-- Existing teacher_schedule stays backward-compatible. class_name remains display/fallback data;
-- normalized columns become authoritative once populated.
alter table public.teacher_schedule
  add column if not exists institution_code text,
  add column if not exists academic_year_id uuid references public.academic_years(id) on delete set null,
  add column if not exists section_instance_id uuid references public.section_instances(id) on delete set null,
  add column if not exists physical_room_id uuid references public.physical_rooms(id) on delete set null;

create unique index if not exists uq_section_primary_placement_open
  on public.section_room_placements(institution_code, section_instance_id)
  where is_primary = true and valid_until is null;
create unique index if not exists uq_smartboard_active_room_binding
  on public.smartboard_room_bindings(institution_code, smartboard_device_key)
  where active = true and valid_until is null;
create index if not exists idx_section_placements_room_window
  on public.section_room_placements(institution_code, physical_room_id, valid_from, valid_until);
create index if not exists idx_section_instances_year_name
  on public.section_instances(institution_code, academic_year_id, display_name);
create index if not exists idx_teacher_schedule_section_time
  on public.teacher_schedule(institution_code, section_instance_id, weekday, period);
create index if not exists idx_teacher_schedule_room_time
  on public.teacher_schedule(institution_code, physical_room_id, weekday, period);

-- Data-integrity trigger prevents cross-tenant and cross-year links even when service_role writes.
create or replace function public.enforce_smartboard_academic_scope()
returns trigger
language plpgsql
set search_path=public
as $$
declare v_inst text; v_year_inst text;
begin
  if tg_table_name = 'section_instances' then
    select institution_code into v_year_inst from public.academic_years where id=new.academic_year_id;
    if v_year_inst is distinct from new.institution_code then raise exception 'ACADEMIC_YEAR_TENANT_MISMATCH'; end if;
  elsif tg_table_name = 'section_room_placements' then
    select institution_code into v_inst from public.section_instances where id=new.section_instance_id;
    if v_inst is distinct from new.institution_code then raise exception 'SECTION_TENANT_MISMATCH'; end if;
    select institution_code into v_inst from public.physical_rooms where id=new.physical_room_id;
    if v_inst is distinct from new.institution_code then raise exception 'ROOM_TENANT_MISMATCH'; end if;
  elsif tg_table_name = 'smartboard_room_bindings' then
    select institution_code into v_inst from public.physical_rooms where id=new.physical_room_id;
    if v_inst is distinct from new.institution_code then raise exception 'ROOM_TENANT_MISMATCH'; end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_section_instance_scope on public.section_instances;
create trigger trg_section_instance_scope before insert or update on public.section_instances for each row execute function public.enforce_smartboard_academic_scope();
drop trigger if exists trg_section_room_scope on public.section_room_placements;
create trigger trg_section_room_scope before insert or update on public.section_room_placements for each row execute function public.enforce_smartboard_academic_scope();
drop trigger if exists trg_smartboard_binding_scope on public.smartboard_room_bindings;
create trigger trg_smartboard_binding_scope before insert or update on public.smartboard_room_bindings for each row execute function public.enforce_smartboard_academic_scope();

-- Explicit lesson-room override wins. Otherwise the section placement valid on date is used.
create or replace function public.resolve_lesson_room(p_schedule_id uuid,p_on_date date default current_date)
returns uuid
language sql stable security definer set search_path=public
as $$
 select coalesce(ts.physical_room_id,(
   select srp.physical_room_id
   from public.section_room_placements srp
   where srp.institution_code=ts.institution_code
     and srp.section_instance_id=ts.section_instance_id
     and srp.valid_from<=p_on_date
     and (srp.valid_until is null or srp.valid_until>=p_on_date)
   order by srp.is_primary desc,srp.valid_from desc,srp.created_at desc limit 1
 ))
 from public.teacher_schedule ts where ts.id=p_schedule_id;
$$;

-- Lesson -> room -> board. Historical class_name never drives the device match.
create or replace function public.resolve_smartboard_for_lesson(p_schedule_id uuid,p_on_date date default current_date)
returns table(smartboard_device_key text,physical_room_id uuid,section_instance_id uuid,section_display_name text,teacher_id uuid,subject text,weekday smallint,period smallint)
language sql stable security definer set search_path=public
as $$
 with lesson as (
   select ts.*,public.resolve_lesson_room(ts.id,p_on_date) resolved_room_id
   from public.teacher_schedule ts where ts.id=p_schedule_id
 )
 select b.smartboard_device_key,l.resolved_room_id,l.section_instance_id,si.display_name,l.teacher_id,l.subject,l.weekday,l.period
 from lesson l
 left join public.section_instances si on si.id=l.section_instance_id and si.institution_code=l.institution_code
 join public.smartboard_room_bindings b on b.institution_code=l.institution_code
   and b.physical_room_id=l.resolved_room_id and b.active=true
   and b.valid_from<=p_on_date::timestamptz+interval '23 hours 59 minutes 59 seconds'
   and (b.valid_until is null or b.valid_until>=p_on_date::timestamptz)
 order by b.valid_from desc limit 1;
$$;

-- Readiness gate: never inherit last year's section->room mapping silently.
create or replace function public.smartboard_academic_year_readiness(p_academic_year_id uuid)
returns table(section_instance_id uuid,section_display_name text,problem text)
language sql stable security definer set search_path=public
as $$
 with y as (select id,institution_code from public.academic_years where id=p_academic_year_id)
 select si.id,si.display_name,
   case
    when not exists(select 1 from public.section_room_placements srp where srp.institution_code=si.institution_code and srp.section_instance_id=si.id and srp.is_primary=true) then 'PRIMARY_ROOM_MISSING'
    when not exists(
      select 1 from public.section_room_placements srp
      join public.smartboard_room_bindings b on b.institution_code=srp.institution_code and b.physical_room_id=srp.physical_room_id
      where srp.institution_code=si.institution_code and srp.section_instance_id=si.id and srp.is_primary=true and b.active=true and b.valid_until is null
    ) then 'SMARTBOARD_ROOM_BINDING_MISSING'
    else null
   end
 from public.section_instances si join y on y.id=si.academic_year_id and y.institution_code=si.institution_code
 where si.active=true and (
  not exists(select 1 from public.section_room_placements srp where srp.institution_code=si.institution_code and srp.section_instance_id=si.id and srp.is_primary=true)
  or not exists(select 1 from public.section_room_placements srp join public.smartboard_room_bindings b on b.institution_code=srp.institution_code and b.physical_room_id=srp.physical_room_id where srp.institution_code=si.institution_code and srp.section_instance_id=si.id and srp.is_primary=true and b.active=true and b.valid_until is null)
 ) order by si.display_name;
$$;

-- Tenant-aware access helper. Existing institution_memberships is the authority.
create or replace function public.has_institution_access(p_institution_code text)
returns boolean language sql stable security definer set search_path=public
as $$
 select exists(select 1 from public.institution_memberships im where im.user_id=auth.uid() and im.institution_code=p_institution_code and im.active=true);
$$;
revoke all on function public.has_institution_access(text) from public;
grant execute on function public.has_institution_access(text) to authenticated;

alter table public.academic_years enable row level security;
alter table public.physical_rooms enable row level security;
alter table public.section_instances enable row level security;
alter table public.section_room_placements enable row level security;
alter table public.smartboard_room_bindings enable row level security;

do $$ begin create policy "tenant read academic years" on public.academic_years for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read physical rooms" on public.physical_rooms for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read section instances" on public.section_instances for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read section placements" on public.section_room_placements for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;
do $$ begin create policy "tenant read smartboard bindings" on public.smartboard_room_bindings for select to authenticated using(public.has_institution_access(institution_code)); exception when duplicate_object then null; end $$;

do $$ begin create policy "managers manage academic years" on public.academic_years for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage physical rooms" on public.physical_rooms for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage section instances" on public.section_instances for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage section placements" on public.section_room_placements for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "managers manage smartboard bindings" on public.smartboard_room_bindings for all to authenticated using(public.has_institution_access(institution_code) and public.is_manager_or_admin()) with check(public.has_institution_access(institution_code) and public.is_manager_or_admin()); exception when duplicate_object then null; end $$;

grant select on public.academic_years,public.physical_rooms,public.section_instances,public.section_room_placements,public.smartboard_room_bindings to authenticated;
grant all on public.academic_years,public.physical_rooms,public.section_instances,public.section_room_placements,public.smartboard_room_bindings to service_role;
grant execute on function public.resolve_lesson_room(uuid,date) to authenticated,service_role;
grant execute on function public.resolve_smartboard_for_lesson(uuid,date) to authenticated,service_role;
grant execute on function public.smartboard_academic_year_readiness(uuid) to authenticated,service_role;
