-- OkulOS: secure super-admin bootstrap + data-driven TTKB area/course and norm registries.
-- Legal mappings are editable/versioned. Do not hard-code an outdated TTKB or norm table in client code.

create table if not exists public.super_admin_bootstrap (
  email text primary key,
  full_name text not null default 'Süper Admin',
  active boolean not null default true,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  check (email = lower(email))
);

insert into public.super_admin_bootstrap(email, full_name, active)
values ('halisbozoglu@yahoo.com', 'Süper Admin', true)
on conflict (email) do update set active = true;

alter table public.profiles alter column tckn drop not null;
alter table public.profiles add column if not exists is_super_admin boolean not null default false;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin' and is_super_admin = true
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

alter table public.super_admin_bootstrap enable row level security;
revoke all on public.super_admin_bootstrap from anon, authenticated;
grant select on public.super_admin_bootstrap to authenticated;
create policy "super admin reads bootstrap status"
on public.super_admin_bootstrap for select to authenticated
using (public.is_super_admin());

-- Replace insert guard so the allow-listed bootstrap email may create one admin profile without a TCKN.
create or replace function public.enforce_profile_insert_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pre public.pre_registered_teachers%rowtype;
  v_auth_email text;
  v_bootstrap public.super_admin_bootstrap%rowtype;
begin
  if auth.uid() is null or new.user_id <> auth.uid() then
    raise exception 'PROFILE_INSERT_NOT_OWN_USER';
  end if;

  select lower(email) into v_auth_email from auth.users where id = auth.uid();
  if v_auth_email is null then raise exception 'AUTH_EMAIL_REQUIRED'; end if;

  select * into v_bootstrap
  from public.super_admin_bootstrap
  where email = v_auth_email and active = true
  limit 1;

  if found then
    new.tckn := null;
    new.email := v_auth_email;
    new.full_name := v_bootstrap.full_name;
    new.role := 'admin';
    new.is_super_admin := true;
    new.updated_at := now();
    return new;
  end if;

  if new.tckn is null or new.tckn !~ '^\d{11}$' then raise exception 'INVALID_TCKN'; end if;
  select * into v_pre from public.pre_registered_teachers where tckn = new.tckn and active = true limit 1;
  if not found then raise exception 'PRE_REGISTERED_TEACHER_NOT_FOUND'; end if;
  if v_pre.email is not null and lower(trim(v_pre.email)) <> v_auth_email then raise exception 'EMAIL_DOES_NOT_MATCH_PRE_REGISTRATION'; end if;

  new.tckn := v_pre.tckn;
  new.email := v_auth_email;
  new.full_name := v_pre.full_name;
  new.role := v_pre.role;
  new.is_super_admin := false;
  new.updated_at := now();
  update public.pre_registered_teachers set email = coalesce(email, v_auth_email) where id = v_pre.id;
  return new;
end;
$$;

-- Protect super-admin flag as an identity field too.
create or replace function public.protect_profile_identity_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_super_admin() and auth.uid() <> old.user_id then
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

create or replace function public.claim_super_admin_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_bootstrap public.super_admin_bootstrap%rowtype;
  v_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select lower(email) into v_email from auth.users where id = auth.uid();
  select * into v_bootstrap from public.super_admin_bootstrap where email=v_email and active=true limit 1;
  if not found then raise exception 'SUPER_ADMIN_EMAIL_NOT_ALLOWED'; end if;

  insert into public.profiles(user_id,tckn,email,full_name,role,is_super_admin)
  values(auth.uid(),null,v_email,v_bootstrap.full_name,'admin',true)
  on conflict(user_id) do update set
    email=excluded.email, full_name=excluded.full_name, role='admin', is_super_admin=true, updated_at=now()
  returning * into v_profile;

  update public.super_admin_bootstrap set claimed_by=auth.uid(), claimed_at=coalesce(claimed_at,now()) where email=v_email;
  return v_profile;
end;
$$;
revoke all on function public.claim_super_admin_profile() from public;
grant execute on function public.claim_super_admin_profile() to authenticated;

-- Current TTKB source registry. 129/19.12.2025 updated the prior 9-number decision.
create table if not exists public.legal_rule_sources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  authority text not null,
  decision_date date,
  effective_from date,
  effective_to date,
  source_url text,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.legal_rule_sources(code,title,authority,decision_date,effective_from,source_url,note)
values(
  'TTKB-129-2025',
  'Öğretmenlik Alanları, Atama ve Ders Okutma Esasları',
  'MEB Talim ve Terbiye Kurulu Başkanlığı',
  '2025-12-19',
  '2025-12-19',
  'https://ttkb.meb.gov.tr/www/ogretmenlik-alanlari-atama-ve-ders-okutma-esaslarini-duzenleyen-9-sayili-karar-guncellenerek-yururluge-girmistir/icerik/844/tr',
  '19.12.2025 tarih ve 129 sayılı Kurul Kararı; alan-ders eşleşmeleri karar eki çizelgeden girilmelidir.'
)
on conflict(code) do update set active=true;

create table if not exists public.teaching_areas (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists teaching_area_id uuid references public.teaching_areas(id) on delete set null;
alter table public.pre_registered_teachers add column if not exists teaching_area_id uuid references public.teaching_areas(id) on delete set null;

create table if not exists public.area_course_permissions (
  id uuid primary key default gen_random_uuid(),
  teaching_area_id uuid not null references public.teaching_areas(id) on delete cascade,
  course_id uuid not null references public.course_catalog(id) on delete cascade,
  priority_order smallint not null default 1 check(priority_order > 0),
  condition_note text,
  source_id uuid references public.legal_rule_sources(id) on delete restrict,
  effective_from date not null default current_date,
  effective_to date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check(effective_to is null or effective_to >= effective_from),
  unique(teaching_area_id,course_id,effective_from)
);

create table if not exists public.norm_rule_sets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  teacher_category text not null,
  source_id uuid references public.legal_rule_sources(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  repeating_block_hours integer,
  remainder_min_hours integer,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check(repeating_block_hours is null or repeating_block_hours > 0),
  check(remainder_min_hours is null or remainder_min_hours >= 0)
);

create table if not exists public.norm_rule_bands (
  id uuid primary key default gen_random_uuid(),
  rule_set_id uuid not null references public.norm_rule_sets(id) on delete cascade,
  min_hours integer not null check(min_hours >= 0),
  max_hours integer,
  norm_count integer not null check(norm_count >= 0),
  sort_order smallint not null default 1,
  check(max_hours is null or max_hours >= min_hours),
  unique(rule_set_id,min_hours)
);

alter table public.legal_rule_sources enable row level security;
alter table public.teaching_areas enable row level security;
alter table public.area_course_permissions enable row level security;
alter table public.norm_rule_sets enable row level security;
alter table public.norm_rule_bands enable row level security;

grant select on public.legal_rule_sources,public.teaching_areas,public.area_course_permissions,public.norm_rule_sets,public.norm_rule_bands to authenticated;
grant insert,update,delete on public.legal_rule_sources,public.teaching_areas,public.area_course_permissions,public.norm_rule_sets,public.norm_rule_bands to authenticated;

create policy "authenticated read legal sources" on public.legal_rule_sources for select to authenticated using(true);
create policy "authenticated read teaching areas" on public.teaching_areas for select to authenticated using(true);
create policy "authenticated read area permissions" on public.area_course_permissions for select to authenticated using(true);
create policy "authenticated read norm rules" on public.norm_rule_sets for select to authenticated using(true);
create policy "authenticated read norm bands" on public.norm_rule_bands for select to authenticated using(true);
create policy "super admin manages legal sources" on public.legal_rule_sources for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());
create policy "super admin manages teaching areas" on public.teaching_areas for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());
create policy "super admin manages area permissions" on public.area_course_permissions for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());
create policy "super admin manages norm rules" on public.norm_rule_sets for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());
create policy "super admin manages norm bands" on public.norm_rule_bands for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());

-- Super-admin-only personnel pre-registration API. Raw TCKN never needs to be exposed in a public listing.
create or replace function public.super_admin_upsert_personnel(
  p_tckn text,
  p_full_name text,
  p_email text default null,
  p_role public.app_role default 'teacher',
  p_teaching_area_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;
begin
  if not public.is_super_admin() then raise exception 'NOT_SUPER_ADMIN'; end if;
  if p_tckn !~ '^\d{11}$' then raise exception 'INVALID_TCKN'; end if;
  if trim(coalesce(p_full_name,''))='' then raise exception 'FULL_NAME_REQUIRED'; end if;
  insert into public.pre_registered_teachers(tckn,email,full_name,role,active,teaching_area_id)
  values(p_tckn,nullif(lower(trim(p_email)),''),trim(p_full_name),p_role,true,p_teaching_area_id)
  on conflict(tckn) do update set email=excluded.email,full_name=excluded.full_name,role=excluded.role,active=true,teaching_area_id=excluded.teaching_area_id
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.super_admin_upsert_personnel(text,text,text,public.app_role,uuid) from public;
grant execute on function public.super_admin_upsert_personnel(text,text,text,public.app_role,uuid) to authenticated;

create or replace function public.get_super_admin_personnel()
returns table(id uuid,tckn_masked text,full_name text,email text,role public.app_role,teaching_area_id uuid,active boolean)
language sql
stable
security definer
set search_path=public
as $$
  select p.id, left(p.tckn,2)||'*******'||right(p.tckn,2),p.full_name,p.email,p.role,p.teaching_area_id,p.active
  from public.pre_registered_teachers p
  where public.is_super_admin()
  order by p.full_name;
$$;
revoke all on function public.get_super_admin_personnel() from public;
grant execute on function public.get_super_admin_personnel() to authenticated;

create or replace function public.teacher_course_permission_status(p_teacher_id uuid,p_course_id uuid,p_on_date date default current_date)
returns text
language plpgsql
stable
security definer
set search_path=public
as $$
declare v_area uuid; v_exists boolean; v_allowed boolean;
begin
  select teaching_area_id into v_area from public.profiles where user_id=p_teacher_id;
  if v_area is null then return 'AREA_NOT_DEFINED'; end if;
  select exists(select 1 from public.area_course_permissions where teaching_area_id=v_area and active=true) into v_exists;
  if not v_exists then return 'AREA_RULES_NOT_ENTERED'; end if;
  select exists(
    select 1 from public.area_course_permissions
    where teaching_area_id=v_area and course_id=p_course_id and active=true
      and effective_from<=p_on_date and (effective_to is null or effective_to>=p_on_date)
  ) into v_allowed;
  return case when v_allowed then 'ALLOWED' else 'NOT_ALLOWED' end;
end;
$$;
revoke all on function public.teacher_course_permission_status(uuid,uuid,date) from public;
grant execute on function public.teacher_course_permission_status(uuid,uuid,date) to authenticated;

create or replace function public.validate_teacher_course_assignment_area()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare v_status text;
begin
  v_status:=public.teacher_course_permission_status(new.teacher_id,(select course_id from public.class_course_requirements where id=new.requirement_id),current_date);
  if v_status='NOT_ALLOWED' then raise exception 'TTKB_AREA_COURSE_NOT_ALLOWED'; end if;
  -- AREA_NOT_DEFINED / AREA_RULES_NOT_ENTERED remain visible readiness warnings while the super admin is entering source data.
  return new;
end;
$$;
drop trigger if exists trg_validate_teacher_course_assignment_area on public.teacher_course_assignments;
create trigger trg_validate_teacher_course_assignment_area
before insert or update on public.teacher_course_assignments
for each row execute function public.validate_teacher_course_assignment_area();

create or replace function public.calculate_norm_from_rule(p_rule_set_id uuid,p_total_hours integer)
returns integer
language plpgsql
stable
security definer
set search_path=public
as $$
declare v_rule public.norm_rule_sets%rowtype; v_band public.norm_rule_bands%rowtype; v_base integer; v_remainder integer;
begin
  if p_total_hours<0 then raise exception 'INVALID_TOTAL_HOURS'; end if;
  select * into v_rule from public.norm_rule_sets where id=p_rule_set_id and active=true;
  if not found then raise exception 'NORM_RULE_NOT_FOUND'; end if;
  select * into v_band from public.norm_rule_bands
    where rule_set_id=p_rule_set_id and p_total_hours>=min_hours and (max_hours is null or p_total_hours<=max_hours)
    order by sort_order,min_hours desc limit 1;
  if found then return v_band.norm_count; end if;
  if v_rule.repeating_block_hours is null then raise exception 'NORM_RULE_INCOMPLETE'; end if;
  select coalesce(max(norm_count),0) into v_base from public.norm_rule_bands where rule_set_id=p_rule_set_id;
  select greatest(p_total_hours-coalesce(max(max_hours),0),0) into v_remainder from public.norm_rule_bands where rule_set_id=p_rule_set_id;
  v_base:=v_base+(v_remainder/v_rule.repeating_block_hours);
  if v_rule.remainder_min_hours is not null and mod(v_remainder,v_rule.repeating_block_hours)>=v_rule.remainder_min_hours then v_base:=v_base+1; end if;
  return v_base;
end;
$$;
revoke all on function public.calculate_norm_from_rule(uuid,integer) from public;
grant execute on function public.calculate_norm_from_rule(uuid,integer) to authenticated;
