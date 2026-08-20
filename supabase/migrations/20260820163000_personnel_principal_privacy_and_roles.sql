-- MEB Personnel Summary privacy model.
-- Imported detail is principal-only. Super Admin controls defaults only; institution principals control local overrides.

alter table public.personnel_registry add column if not exists institution_code text;
alter table public.personnel_registry add column if not exists derived_roles text[] not null default '{}';

create table if not exists public.personnel_private_details (
  personnel_id uuid primary key references public.personnel_registry(id) on delete cascade,
  institution_code text,
  province text,
  district text,
  institution_name text,
  tc_identity_no text,
  personnel_status text,
  grade_step text,
  base_title text,
  duty_title text,
  teaching_area text,
  career_stage text,
  education_status text,
  institution_registry_no text,
  retirement_registry_no text,
  archive_no text,
  gender text,
  blood_group text,
  birth_date date,
  first_service_date date,
  raw_data jsonb not null default '{}'::jsonb,
  raw_labels jsonb not null default '{}'::jsonb,
  source_file_name text,
  source_format text,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institution_principals (
  institution_code text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  active boolean not null default true,
  assigned_at timestamptz not null default now(),
  primary key(institution_code,user_id)
);

create table if not exists public.personnel_field_overrides (
  institution_code text not null,
  field_key text not null references public.personnel_field_catalog(field_key) on delete cascade,
  enabled boolean,
  module_keys text[],
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(institution_code,field_key)
);

alter table public.personnel_private_details enable row level security;
alter table public.institution_principals enable row level security;
alter table public.personnel_field_overrides enable row level security;

create or replace function public.is_principal_user()
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and not public.is_super_admin() and (
    exists(select 1 from public.personnel_registry r where r.linked_user_id=auth.uid() and r.system_role='principal' and r.active)
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
  );
$$;
revoke all on function public.is_principal_user() from public;
grant execute on function public.is_principal_user() to authenticated;

create or replace function public.can_manage_personnel_private_data()
returns boolean language sql stable security definer set search_path=public as $$ select public.is_principal_user(); $$;
revoke all on function public.can_manage_personnel_private_data() from public;
grant execute on function public.can_manage_personnel_private_data() to authenticated;

create or replace function public.can_manage_institution_personnel(p_institution_code text)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_principal_user() and (
    exists(select 1 from public.institution_principals x where x.user_id=auth.uid() and x.active and x.institution_code=p_institution_code)
    or not exists(select 1 from public.institution_principals x where x.user_id=auth.uid() and x.active)
  );
$$;
revoke all on function public.can_manage_institution_personnel(text) from public;
grant execute on function public.can_manage_institution_personnel(text) to authenticated;

-- Remove former broad/super-admin access to imported payloads and personnel registry.
drop policy if exists personnel_import_payloads_super_read on public.personnel_import_payloads;
drop policy if exists personnel_registry_read on public.personnel_registry;
drop policy if exists personnel_registry_manage on public.personnel_registry;
create policy personnel_registry_principal_read on public.personnel_registry for select to authenticated
using(public.is_principal_user() and (institution_code is null or public.can_manage_institution_personnel(institution_code)));
create policy personnel_registry_principal_manage on public.personnel_registry for all to authenticated
using(public.is_principal_user() and (institution_code is null or public.can_manage_institution_personnel(institution_code)))
with check(public.is_principal_user());

create policy personnel_private_principal_read on public.personnel_private_details for select to authenticated
using(public.is_principal_user() and public.can_manage_institution_personnel(coalesce(institution_code,'')));
create policy institution_principals_self_read on public.institution_principals for select to authenticated using(user_id=auth.uid());
create policy personnel_field_overrides_principal_read on public.personnel_field_overrides for select to authenticated
using(public.is_principal_user() and public.can_manage_institution_personnel(institution_code));
create policy personnel_field_overrides_principal_manage on public.personnel_field_overrides for all to authenticated
using(public.is_principal_user() and public.can_manage_institution_personnel(institution_code))
with check(public.is_principal_user() and public.can_manage_institution_personnel(institution_code));

-- Existing raw payload archive is now inaccessible by direct client SELECT; principal uses controlled RPCs.
revoke select on public.personnel_import_payloads from authenticated;

-- Super Admin catalog fields are SYSTEM DEFAULTS only.
create or replace function public.set_personnel_field_rule(p_field_key text,p_enabled boolean,p_module_keys text[])
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
  update public.personnel_field_catalog set enabled=p_enabled,module_keys=coalesce(p_module_keys,'{}'::text[]),updated_at=now(),updated_by=auth.uid() where field_key=p_field_key;
end $$;

create or replace function public.get_my_principal_institution_code()
returns text language sql stable security definer set search_path=public as $$
  select institution_code from public.institution_principals where user_id=auth.uid() and active order by assigned_at limit 1;
$$;
revoke all on function public.get_my_principal_institution_code() from public;
grant execute on function public.get_my_principal_institution_code() to authenticated;

create or replace function public.set_personnel_field_override(p_field_key text,p_enabled boolean,p_module_keys text[])
returns void language plpgsql security definer set search_path=public as $$
declare v_code text;
begin
  if not public.is_principal_user() then raise exception 'FORBIDDEN'; end if;
  v_code:=public.get_my_principal_institution_code();
  if v_code is null then raise exception 'INSTITUTION_SCOPE_NOT_SET'; end if;
  insert into public.personnel_field_overrides(institution_code,field_key,enabled,module_keys,updated_by,updated_at)
  values(v_code,p_field_key,p_enabled,coalesce(p_module_keys,'{}'::text[]),auth.uid(),now())
  on conflict(institution_code,field_key) do update set enabled=excluded.enabled,module_keys=excluded.module_keys,updated_by=auth.uid(),updated_at=now();
end $$;
revoke all on function public.set_personnel_field_override(text,boolean,text[]) from public;
grant execute on function public.set_personnel_field_override(text,boolean,text[]) to authenticated;

create or replace function public.get_personnel_field_settings()
returns table(field_key text,display_name text,source_headers text[],default_enabled boolean,default_module_keys text[],effective_enabled boolean,effective_module_keys text[],institution_code text,mode text)
language sql stable security definer set search_path=public as $$
  with ctx as (select public.get_my_principal_institution_code() code)
  select f.field_key,f.display_name,f.source_headers,f.enabled,f.module_keys,
         case when public.is_super_admin() then f.enabled else coalesce(o.enabled,f.enabled) end,
         case when public.is_super_admin() then f.module_keys else coalesce(o.module_keys,f.module_keys) end,
         case when public.is_super_admin() then null else ctx.code end,
         case when public.is_super_admin() then 'super_default' else 'principal_override' end
  from public.personnel_field_catalog f cross join ctx
  left join public.personnel_field_overrides o on o.field_key=f.field_key and o.institution_code=ctx.code
  where public.is_super_admin() or public.is_principal_user()
  order by f.display_name;
$$;
revoke all on function public.get_personnel_field_settings() from public;
grant execute on function public.get_personnel_field_settings() to authenticated;

-- Modules/ordinary users never receive imported private fields. Only the institution principal may inspect effective fields.
create or replace function public.get_personnel_module_fields(p_personnel_id uuid,p_module_key text)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_code text;v_result jsonb;
begin
  if not public.is_principal_user() then return '{}'::jsonb; end if;
  select institution_code into v_code from public.personnel_registry where id=p_personnel_id;
  if v_code is not null and not public.can_manage_institution_personnel(v_code) then return '{}'::jsonb; end if;
  with current_payload as (
    select raw_data from public.personnel_import_payloads where personnel_id=p_personnel_id and is_current order by imported_at desc limit 1
  ), effective as (
    select f.field_key,coalesce(o.enabled,f.enabled) enabled,coalesce(o.module_keys,f.module_keys) module_keys
    from public.personnel_field_catalog f left join public.personnel_field_overrides o on o.field_key=f.field_key and o.institution_code=v_code
  )
  select coalesce(jsonb_object_agg(e.field_key,p.raw_data->e.field_key),'{}'::jsonb) into v_result
  from effective e cross join current_payload p where e.enabled and p_module_key=any(e.module_keys) and p.raw_data?e.field_key;
  return coalesce(v_result,'{}'::jsonb);
end $$;
revoke all on function public.get_personnel_module_fields(uuid,text) from public;
grant execute on function public.get_personnel_module_fields(uuid,text) to authenticated;

create or replace function public.import_personnel_registry(p_file_name text,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r jsonb;n jsonb;v_id uuid;v_uid uuid;v_count int:=0;v_raw jsonb;v_labels jsonb;v_pair record;v_key text;v_label text;v_format text;v_code text;v_roles text[];
begin
  if not public.is_principal_user() then raise exception 'FORBIDDEN_PRINCIPAL_ONLY'; end if;
  v_format:=lower(coalesce(nullif(regexp_replace(p_file_name,'^.*\\.',''),''),'unknown'));
  for r in select * from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    n:=coalesce(r->'normalized','{}'::jsonb);v_code:=nullif(n->>'institutionCode','');
    v_roles:=array(select jsonb_array_elements_text(coalesce(r->'derivedRoles','[]'::jsonb)));
    insert into public.personnel_registry(full_name,title,duty_title,teaching_area_raw,employment_status,system_role,source_file_name,institution_code,derived_roles)
    values(nullif(coalesce(n->>'fullName',r->>'fullName'),''),nullif(coalesce(n->>'baseTitle',r->>'title'),''),nullif(coalesce(n->>'dutyTitle',r->>'dutyTitle'),''),nullif(coalesce(n->>'teachingArea',r->>'teachingArea'),''),nullif(coalesce(n->>'personnelStatus',r->>'employmentStatus'),''),nullif(r->>'systemRole',''),p_file_name,v_code,coalesce(v_roles,'{}'))
    on conflict(full_name,teaching_area_raw,duty_title) do update set title=excluded.title,employment_status=excluded.employment_status,system_role=excluded.system_role,source_file_name=excluded.source_file_name,institution_code=excluded.institution_code,derived_roles=excluded.derived_roles,active=true,updated_at=now()
    returning id into v_id;

    if v_code is not null then insert into public.institution_principals(institution_code,user_id,active) values(v_code,auth.uid(),true) on conflict(institution_code,user_id) do update set active=true; end if;

    v_raw:=coalesce(r->'rawFields','{}'::jsonb);v_labels:=coalesce(r->'rawLabels','{}'::jsonb);
    insert into public.personnel_private_details(personnel_id,institution_code,province,district,institution_name,tc_identity_no,personnel_status,grade_step,base_title,duty_title,teaching_area,career_stage,education_status,institution_registry_no,retirement_registry_no,archive_no,gender,blood_group,birth_date,first_service_date,raw_data,raw_labels,source_file_name,source_format,imported_at,updated_at)
    values(v_id,v_code,nullif(n->>'province',''),nullif(n->>'district',''),nullif(n->>'institutionName',''),nullif(n->>'tcIdentityNo',''),nullif(n->>'personnelStatus',''),nullif(n->>'gradeStep',''),nullif(n->>'baseTitle',''),nullif(n->>'dutyTitle',''),nullif(n->>'teachingArea',''),nullif(n->>'careerStage',''),nullif(n->>'educationStatus',''),nullif(n->>'institutionRegistryNo',''),nullif(n->>'retirementRegistryNo',''),nullif(n->>'archiveNo',''),nullif(n->>'gender',''),nullif(n->>'bloodGroup',''),nullif(n->>'birthDate','')::date,nullif(n->>'firstServiceDate','')::date,v_raw,v_labels,p_file_name,v_format,now(),now())
    on conflict(personnel_id) do update set institution_code=excluded.institution_code,province=excluded.province,district=excluded.district,institution_name=excluded.institution_name,tc_identity_no=excluded.tc_identity_no,personnel_status=excluded.personnel_status,grade_step=excluded.grade_step,base_title=excluded.base_title,duty_title=excluded.duty_title,teaching_area=excluded.teaching_area,career_stage=excluded.career_stage,education_status=excluded.education_status,institution_registry_no=excluded.institution_registry_no,retirement_registry_no=excluded.retirement_registry_no,archive_no=excluded.archive_no,gender=excluded.gender,blood_group=excluded.blood_group,birth_date=excluded.birth_date,first_service_date=excluded.first_service_date,raw_data=excluded.raw_data,raw_labels=excluded.raw_labels,source_file_name=excluded.source_file_name,source_format=excluded.source_format,imported_at=now(),updated_at=now();

    update public.personnel_import_payloads set is_current=false where personnel_id=v_id and is_current;
    insert into public.personnel_import_payloads(personnel_id,source_file_name,source_format,raw_data,is_current) values(v_id,p_file_name,v_format,v_raw,true);
    for v_pair in select key,value from jsonb_each(v_raw) loop
      v_key:=v_pair.key;v_label:=coalesce(nullif(v_labels->>v_key,''),v_key);
      insert into public.personnel_field_catalog(field_key,display_name,source_headers,last_seen_at) values(v_key,v_label,array[v_label],now())
      on conflict(field_key) do update set source_headers=(select array(select distinct x from unnest(public.personnel_field_catalog.source_headers||excluded.source_headers)x)),last_seen_at=now();
    end loop;

    select user_id into v_uid from public.profiles where tckn=nullif(n->>'tcIdentityNo','') limit 1;
    if v_uid is not null then
      update public.personnel_registry set linked_user_id=v_uid where id=v_id;
      update public.profiles set role=case when r->>'systemRole'='principal' then 'admin'::public.app_role when r->>'systemRole'='vice_principal' then 'manager'::public.app_role else 'teacher'::public.app_role end,updated_at=now() where user_id=v_uid;
    end if;
    v_count:=v_count+1;
  end loop;
  return jsonb_build_object('affected_personnel',v_count,'institution_code',public.get_my_principal_institution_code());
end $$;
revoke all on function public.import_personnel_registry(text,jsonb) from public;
grant execute on function public.import_personnel_registry(text,jsonb) to authenticated;
