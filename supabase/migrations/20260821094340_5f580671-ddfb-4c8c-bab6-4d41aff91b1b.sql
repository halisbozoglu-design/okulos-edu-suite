-- OkulOS tenant auth/admin compatibility consolidation.
-- Keeps legacy auth/profile triggers and Super Admin preregistration compatible with
-- the tenantized schema without scattering one-off corrective migrations.

-- The generic tenant write guard must permit the global Super Admin bootstrap profile
-- and service-role registration flows while still requiring an explicit tenant on ordinary rows.
create or replace function public.enforce_tenant_row()
returns trigger
language plpgsql security definer set search_path=public as $$
declare v_code text;v_new jsonb;
begin
  v_new:=to_jsonb(new);

  -- Super Admin bootstrap is global in authority but is also bound to the first tenant for
  -- institution-owner duties. Fresh installs therefore receive tenant 774380 automatically.
  if tg_table_name='profiles' and coalesce((v_new->>'is_super_admin')::boolean,false) then
    if new.institution_code is null then new.institution_code:='774380'; end if;
    if tg_op='UPDATE' and old.institution_code is distinct from new.institution_code and old.institution_code is not null then
      raise exception 'TENANT_CODE_IMMUTABLE';
    end if;
    return new;
  end if;

  -- Service-role Edge Functions have no auth.uid(). Inserts must carry an explicit tenant;
  -- tenant identity can never be moved by an update.
  if auth.uid() is null then
    if tg_op='INSERT' and new.institution_code is null then raise exception 'TENANT_CODE_REQUIRED_FOR_SERVICE_WRITE'; end if;
    if tg_op='UPDATE' and old.institution_code is distinct from new.institution_code then raise exception 'TENANT_CODE_IMMUTABLE'; end if;
    return new;
  end if;

  if public.is_super_admin() then
    if tg_op='INSERT' and new.institution_code is null then new.institution_code:=coalesce(public.get_my_institution_code(),'774380'); end if;
    if tg_op='UPDATE' and old.institution_code is distinct from new.institution_code then raise exception 'TENANT_CODE_IMMUTABLE'; end if;
    return new;
  end if;

  v_code:=public.get_my_institution_code();
  if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if new.institution_code is null then new.institution_code:=v_code; end if;
  if new.institution_code<>v_code then raise exception 'CROSS_TENANT_WRITE_BLOCKED'; end if;
  if tg_op='UPDATE' and old.institution_code is distinct from new.institution_code then raise exception 'TENANT_CODE_IMMUTABLE'; end if;
  return new;
end $$;
revoke all on function public.enforce_tenant_row() from public;

-- Replace the old single-school profile identity trigger. Tenant + TCKN together identify
-- a preregistration; service-role registration is validated instead of being rejected.
create or replace function public.enforce_profile_insert_identity()
returns trigger
language plpgsql security definer set search_path=public as $$
declare
  v_pre public.pre_registered_teachers%rowtype;
  v_auth_email text;
  v_bootstrap public.super_admin_bootstrap%rowtype;
  v_service boolean:=auth.uid() is null;
  v_code text;
begin
  if not v_service and new.user_id<>auth.uid() then raise exception 'PROFILE_INSERT_NOT_OWN_USER'; end if;
  select lower(email) into v_auth_email from auth.users where id=new.user_id;
  if v_auth_email is null then raise exception 'AUTH_EMAIL_REQUIRED'; end if;

  select * into v_bootstrap from public.super_admin_bootstrap where email=v_auth_email and active=true limit 1;
  if found then
    new.tckn:=null;new.email:=v_auth_email;new.full_name:=v_bootstrap.full_name;new.role:='admin';new.is_super_admin:=true;
    new.institution_code:=coalesce(new.institution_code,'774380');new.updated_at:=now();return new;
  end if;

  v_code:=coalesce(new.institution_code,case when not v_service then public.get_my_institution_code() else null end);
  if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists(select 1 from public.institutions i where i.institution_code=v_code and i.status='active') then raise exception 'TENANT_NOT_FOUND'; end if;

  -- School-registration principal profiles intentionally carry no clear T.C.; the recovery
  -- table stores only the masked/HMAC representation. The principal membership is created first.
  if new.tckn is null then
    if v_service and new.role='admin' and exists(
      select 1 from public.institution_memberships m where m.institution_code=v_code and m.user_id=new.user_id and m.membership_role='principal' and m.active
    ) then
      new.institution_code:=v_code;new.email:=v_auth_email;new.is_super_admin:=false;new.updated_at:=now();return new;
    end if;
    raise exception 'INVALID_TCKN';
  end if;

  if new.tckn!~'^\d{11}$' then raise exception 'INVALID_TCKN'; end if;
  select * into v_pre from public.pre_registered_teachers
  where institution_code=v_code and tckn=new.tckn and active=true limit 1;
  if not found then raise exception 'PRE_REGISTERED_TEACHER_NOT_FOUND'; end if;
  if v_pre.email is not null and lower(trim(v_pre.email))<>v_auth_email then raise exception 'EMAIL_DOES_NOT_MATCH_PRE_REGISTRATION'; end if;

  new.tckn:=v_pre.tckn;new.email:=v_auth_email;new.full_name:=v_pre.full_name;new.role:=v_pre.role;
  new.is_super_admin:=false;new.institution_code:=v_code;new.updated_at:=now();
  update public.pre_registered_teachers set email=coalesce(email,v_auth_email) where id=v_pre.id and institution_code=v_code;
  return new;
end $$;

-- Make Super Admin personnel preregistration explicitly tenant-capable.
create or replace function public.super_admin_upsert_personnel_for_tenant(
  p_institution_code text,
  p_tckn text,
  p_full_name text,
  p_email text default null,
  p_role public.app_role default 'teacher',
  p_teaching_area_id uuid default null
)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if not public.is_super_admin() then raise exception 'NOT_SUPER_ADMIN'; end if;
  if p_institution_code!~'^\d{5,10}$' or not exists(select 1 from public.institutions where institution_code=p_institution_code) then raise exception 'INVALID_INSTITUTION'; end if;
  if p_tckn!~'^\d{11}$' then raise exception 'INVALID_TCKN'; end if;
  if trim(coalesce(p_full_name,''))='' then raise exception 'FULL_NAME_REQUIRED'; end if;
  insert into public.pre_registered_teachers(institution_code,tckn,email,full_name,role,active,teaching_area_id)
  values(p_institution_code,p_tckn,nullif(lower(trim(p_email)),''),trim(p_full_name),p_role,true,p_teaching_area_id)
  on conflict(institution_code,tckn) do update set email=excluded.email,full_name=excluded.full_name,role=excluded.role,active=true,teaching_area_id=excluded.teaching_area_id
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.super_admin_upsert_personnel_for_tenant(text,text,text,text,public.app_role,uuid) from public;
grant execute on function public.super_admin_upsert_personnel_for_tenant(text,text,text,text,public.app_role,uuid) to authenticated;

-- Keep the old client RPC working for the first/single tenant; with multiple tenants an explicit
-- institution is required instead of silently registering a person into the wrong school.
create or replace function public.super_admin_upsert_personnel(
  p_tckn text,
  p_full_name text,
  p_email text default null,
  p_role public.app_role default 'teacher',
  p_teaching_area_id uuid default null
)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_code text;v_count integer;
begin
  if not public.is_super_admin() then raise exception 'NOT_SUPER_ADMIN'; end if;
  select institution_code into v_code from public.profiles where user_id=auth.uid();
  if v_code is null then
    select count(*),min(institution_code) into v_count,v_code from public.institutions where status='active';
    if v_count<>1 then raise exception 'INSTITUTION_CODE_REQUIRED'; end if;
  end if;
  return public.super_admin_upsert_personnel_for_tenant(v_code,p_tckn,p_full_name,p_email,p_role,p_teaching_area_id);
end $$;
revoke all on function public.super_admin_upsert_personnel(text,text,text,public.app_role,uuid) from public;
grant execute on function public.super_admin_upsert_personnel(text,text,text,public.app_role,uuid) to authenticated;

-- Tenant-aware Super Admin listing. Existing clients may ignore the extra institution columns.
drop function if exists public.get_super_admin_personnel();
create function public.get_super_admin_personnel()
returns table(id uuid,tckn_masked text,full_name text,email text,role public.app_role,teaching_area_id uuid,active boolean,institution_code text,school_name text)
language sql stable security definer set search_path=public as $$
  select p.id,left(p.tckn,2)||'*******'||right(p.tckn,2),p.full_name,p.email,p.role,p.teaching_area_id,p.active,p.institution_code,i.school_name
  from public.pre_registered_teachers p left join public.institutions i on i.institution_code=p.institution_code
  where public.is_super_admin() order by i.school_name,p.full_name;
$$;
revoke all on function public.get_super_admin_personnel() from public;
grant execute on function public.get_super_admin_personnel() to authenticated;

-- Course-assignment checks must not accidentally read a teacher from another tenant.
create or replace function public.teacher_course_permission_status(p_teacher_id uuid,p_course_id uuid,p_on_date date default current_date)
returns text language plpgsql stable security definer set search_path=public as $$
declare v_area uuid;v_exists boolean;v_allowed boolean;v_code text;
begin
  v_code:=case when public.is_super_admin() then (select institution_code from public.profiles where user_id=p_teacher_id) else public.get_my_institution_code() end;
  if v_code is null then return 'TENANT_CONTEXT_REQUIRED'; end if;
  select teaching_area_id into v_area from public.profiles where user_id=p_teacher_id and institution_code=v_code;
  if v_area is null then return 'AREA_NOT_DEFINED'; end if;
  select exists(select 1 from public.area_course_permissions where teaching_area_id=v_area and active=true) into v_exists;
  if not v_exists then return 'AREA_RULES_NOT_ENTERED'; end if;
  select exists(select 1 from public.area_course_permissions where teaching_area_id=v_area and course_id=p_course_id and active=true and effective_from<=p_on_date and (effective_to is null or effective_to>=p_on_date)) into v_allowed;
  return case when v_allowed then 'ALLOWED' else 'NOT_ALLOWED' end;
end $$;
revoke all on function public.teacher_course_permission_status(uuid,uuid,date) from public;
grant execute on function public.teacher_course_permission_status(uuid,uuid,date) to authenticated;

-- Fresh-install Super Admin claim: bind profile + first tenant membership in one operation.
create or replace function public.claim_super_admin_profile()
returns public.profiles language plpgsql security definer set search_path=public as $$
declare v_email text;v_bootstrap public.super_admin_bootstrap%rowtype;v_profile public.profiles;v_code text;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select lower(email) into v_email from auth.users where id=auth.uid();
  select * into v_bootstrap from public.super_admin_bootstrap where email=v_email and active=true limit 1;
  if not found then raise exception 'SUPER_ADMIN_EMAIL_NOT_ALLOWED'; end if;
  select coalesce((select institution_code from public.profiles where user_id=auth.uid()),(select institution_code from public.institutions where institution_code='774380'),(select min(institution_code) from public.institutions)) into v_code;
  insert into public.profiles(user_id,tckn,email,full_name,role,is_super_admin,institution_code)
  values(auth.uid(),null,v_email,v_bootstrap.full_name,'admin',true,v_code)
  on conflict(user_id) do update set email=excluded.email,full_name=excluded.full_name,role='admin',is_super_admin=true,institution_code=coalesce(public.profiles.institution_code,excluded.institution_code),updated_at=now()
  returning * into v_profile;
  if v_code is not null then
    insert into public.institution_memberships(institution_code,user_id,membership_role,is_owner,active)
    values(v_code,auth.uid(),'principal',true,true)
    on conflict(institution_code,user_id) do update set membership_role='principal',is_owner=true,active=true,updated_at=now();
    insert into public.institution_principals(institution_code,user_id,active)
    values(v_code,auth.uid(),true) on conflict(institution_code,user_id) do update set active=true;
  end if;
  update public.super_admin_bootstrap set claimed_by=auth.uid(),claimed_at=coalesce(claimed_at,now()) where email=v_email;
  return v_profile;
end $$;
revoke all on function public.claim_super_admin_profile() from public;
grant execute on function public.claim_super_admin_profile() to authenticated;