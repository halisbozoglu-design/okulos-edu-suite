-- ==== duty history ====
create table if not exists public.duty_assignment_history (
  id bigint generated always as identity primary key,
  assignment_type text not null check (assignment_type in ('teacher_duty','vice_principal_duty')),
  subject_user_id uuid not null references public.profiles(user_id) on delete restrict,
  duty_date date not null,
  duty_location text,
  effective_start_date date not null,
  effective_end_date date,
  source text not null default 'manual',
  previous_record jsonb,
  new_record jsonb,
  change_reason text,
  changed_by uuid references public.profiles(user_id) on delete set null,
  changed_at timestamptz not null default now(),
  check (effective_end_date is null or effective_end_date >= effective_start_date)
);

create index if not exists idx_duty_history_subject on public.duty_assignment_history(subject_user_id, effective_start_date desc, changed_at desc);
create index if not exists idx_duty_history_duty_date on public.duty_assignment_history(duty_date, assignment_type, changed_at desc);

alter table public.duty_assignment_history enable row level security;
grant select on public.duty_assignment_history to authenticated;
grant all on public.duty_assignment_history to service_role;
create policy "managers read duty assignment history"
on public.duty_assignment_history for select to authenticated
using (public.is_manager_or_admin());

create or replace function public.log_teacher_duty_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date, duty_location,
      effective_start_date, source, new_record, changed_by
    ) values (
      'teacher_duty', new.teacher_id, new.duty_date, new.duty_location,
      new.duty_date, coalesce(new.assignment_source,'manual'), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date, duty_location,
      effective_start_date, effective_end_date, source,
      previous_record, new_record, changed_by
    ) values (
      'teacher_duty', old.teacher_id, old.duty_date, old.duty_location,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date, duty_location,
      effective_start_date, effective_end_date, source,
      previous_record, changed_by
    ) values (
      'teacher_duty', old.teacher_id, old.duty_date, old.duty_location,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), auth.uid()
    );
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_log_teacher_duty_history on public.teacher_duty_assignments;
create trigger trg_log_teacher_duty_history
after insert or update or delete on public.teacher_duty_assignments
for each row execute function public.log_teacher_duty_history();

create or replace function public.log_vp_duty_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date,
      effective_start_date, source, new_record, changed_by
    ) values (
      'vice_principal_duty', new.vice_principal_id, new.duty_date,
      new.duty_date, coalesce(new.assignment_source,'manual'), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date,
      effective_start_date, effective_end_date, source,
      previous_record, new_record, changed_by
    ) values (
      'vice_principal_duty', old.vice_principal_id, old.duty_date,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date,
      effective_start_date, effective_end_date, source,
      previous_record, changed_by
    ) values (
      'vice_principal_duty', old.vice_principal_id, old.duty_date,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), auth.uid()
    );
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_log_vp_duty_history on public.duty_rotation;
create trigger trg_log_vp_duty_history
after insert or update or delete on public.duty_rotation
for each row execute function public.log_vp_duty_history();

revoke insert, update, delete on public.duty_assignment_history from authenticated;

-- ==== super admin bootstrap + TTKB/norm registry ====
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
grant all on public.super_admin_bootstrap to service_role;
create policy "super admin reads bootstrap status"
on public.super_admin_bootstrap for select to authenticated
using (public.is_super_admin());

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
grant all on public.legal_rule_sources,public.teaching_areas,public.area_course_permissions,public.norm_rule_sets,public.norm_rule_bands to service_role;

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
  if auth.uid() is null or new.user_id <> auth.uid() then raise exception 'PROFILE_INSERT_NOT_OWN_USER'; end if;
  select lower(email) into v_auth_email from auth.users where id=auth.uid();
  if v_auth_email is null then raise exception 'AUTH_EMAIL_REQUIRED'; end if;

  select * into v_bootstrap from public.super_admin_bootstrap where email=v_auth_email and active=true limit 1;
  if found then
    new.tckn:=null; new.email:=v_auth_email; new.full_name:=v_bootstrap.full_name;
    new.role:='admin'; new.is_super_admin:=true; new.teaching_area_id:=null; new.updated_at:=now();
    return new;
  end if;

  if new.tckn is null or new.tckn !~ '^\d{11}$' then raise exception 'INVALID_TCKN'; end if;
  select * into v_pre from public.pre_registered_teachers where tckn=new.tckn and active=true limit 1;
  if not found then raise exception 'PRE_REGISTERED_TEACHER_NOT_FOUND'; end if;
  if v_pre.email is not null and lower(trim(v_pre.email))<>v_auth_email then raise exception 'EMAIL_DOES_NOT_MATCH_PRE_REGISTRATION'; end if;

  new.tckn:=v_pre.tckn; new.email:=v_auth_email; new.full_name:=v_pre.full_name;
  new.role:=v_pre.role; new.is_super_admin:=false; new.teaching_area_id:=v_pre.teaching_area_id; new.updated_at:=now();
  update public.pre_registered_teachers set email=coalesce(email,v_auth_email) where id=v_pre.id;
  return new;
end;
$$;

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

create or replace function public.super_admin_set_profile_teaching_area(p_user_id uuid,p_teaching_area_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_super_admin() then raise exception 'NOT_SUPER_ADMIN'; end if;
  if p_teaching_area_id is not null and not exists(select 1 from public.teaching_areas where id=p_teaching_area_id and active=true) then raise exception 'TEACHING_AREA_NOT_FOUND'; end if;
  update public.profiles set teaching_area_id=p_teaching_area_id,updated_at=now() where user_id=p_user_id;
  return found;
end;
$$;
revoke all on function public.super_admin_set_profile_teaching_area(uuid,uuid) from public;
grant execute on function public.super_admin_set_profile_teaching_area(uuid,uuid) to authenticated;

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
  v_status:=public.teacher_course_permission_status(
    new.teacher_id,
    (select course_id from public.class_course_requirements where id=new.class_course_requirement_id),
    current_date
  );
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

create or replace function public.get_curriculum_readiness(p_class_id uuid default null)
returns table(
  class_id uuid,
  composite_key text,
  expected_hours integer,
  planned_hours integer,
  assigned_hours integer,
  unassigned_course_count integer,
  partially_assigned_course_count integer,
  ready boolean,
  blocking_reason text
)
language sql
stable
security definer
set search_path=public
as $$
  with assignment_by_req as (
    select r.id,r.class_id,r.course_id,r.weekly_hours,
      coalesce(sum(a.assigned_hours),0)::integer as assigned,
      count(a.id) filter(where a.id is not null and public.teacher_course_permission_status(a.teacher_id,r.course_id,current_date)<>'ALLOWED')::integer as ttkb_problem_count
    from public.class_course_requirements r
    left join public.teacher_course_assignments a on a.class_course_requirement_id=r.id
    group by r.id,r.class_id,r.course_id,r.weekly_hours
  ), by_class as (
    select c.id,c.composite_key,c.expected_weekly_hours,
      coalesce(sum(ar.weekly_hours),0)::integer as planned,
      coalesce(sum(ar.assigned),0)::integer as assigned,
      count(*) filter(where ar.id is not null and ar.assigned=0)::integer as unassigned,
      count(*) filter(where ar.id is not null and ar.assigned>0 and ar.assigned<ar.weekly_hours)::integer as partial,
      coalesce(sum(ar.ttkb_problem_count),0)::integer as ttkb_problems
    from public.school_classes c
    left join assignment_by_req ar on ar.class_id=c.id
    where c.active=true and (p_class_id is null or c.id=p_class_id)
    group by c.id,c.composite_key,c.expected_weekly_hours
  )
  select b.id,b.composite_key,b.expected_weekly_hours::integer,b.planned,b.assigned,b.unassigned,b.partial,
    (b.expected_weekly_hours is not null and b.planned=b.expected_weekly_hours and b.assigned=b.planned and b.unassigned=0 and b.partial=0 and b.ttkb_problems=0) as ready,
    case
      when b.expected_weekly_hours is null then 'HEDEF_HAFTALIK_SAAT_TANIMSIZ'
      when b.planned<b.expected_weekly_hours then 'DERS_YUKU_EKSIK'
      when b.planned>b.expected_weekly_hours then 'DERS_YUKU_FAZLA'
      when b.unassigned>0 then 'OGRETMEN_ATANMAMIS_DERS_VAR'
      when b.partial>0 or b.assigned<b.planned then 'OGRETMEN_SAATI_EKSIK'
      when b.assigned>b.planned then 'OGRETMEN_SAATI_FAZLA'
      when b.ttkb_problems>0 then 'TTKB_ALAN_DERS_ESLESMESI_EKSIK_VEYA_UYGUN_DEGIL'
      else null
    end
  from by_class b order by b.composite_key;
$$;
revoke all on function public.get_curriculum_readiness(uuid) from public;
grant execute on function public.get_curriculum_readiness(uuid) to authenticated;