-- OkulOS tenant isolation consolidation.
-- One migration intentionally batches the institution_code retrofit, RLS fence,
-- write guards, legacy backfill and tenant audit to reduce migration churn.

create table if not exists public.tenant_scope_registry (
  table_name text primary key,
  scope text not null check (scope in ('global','tenant','user')),
  note text,
  updated_at timestamptz not null default now()
);

-- Global catalogs are shared across institutions and maintained centrally.
insert into public.tenant_scope_registry(table_name,scope,note) values
 ('institutions','global','Tenant master'),
 ('institution_memberships','global','Tenant membership bridge'),
 ('institution_principals','global','Legacy principal bridge'),
 ('principal_recovery_identity','global','Private recovery identity; no client access'),
 ('tenant_messages','global','Already carries institution_code and dedicated policies'),
 ('system_feature_catalog','global','System-wide module switches'),
 ('system_runtime_settings','global','System-wide maintenance state'),
 ('tenant_scope_registry','global','Tenant metadata'),
 ('teaching_areas','global','MEB/TTKB teaching-area catalog'),
 ('course_catalog','global','Central course catalog'),
 ('responsibility_catalog','global','System responsibility/sub-duty catalog'),
 ('legal_rule_sources','global','Central legal source catalog'),
 ('area_course_permissions','global','Central TTKB mapping'),
 ('norm_rule_sets','global','Central norm rules'),
 ('norm_rule_bands','global','Central norm bands'),
 ('personnel_field_catalog','global','Super Admin default field catalog'),
 ('system_modules','global','Permission/module catalog if present'),
 ('system_operations','global','Permission operation catalog if present'),
 ('permission_catalog','global','Permission catalog if present'),
 ('permission_definitions','global','Permission definitions if present'),
 ('notifications','user','User-owned and already protected by user_id'),
 ('telegram_integrations','user','User-owned notification endpoint'),
 ('telegram_link_tokens','user','User-owned temporary token'),
 ('web_push_subscriptions','user','User-owned push endpoint')
on conflict(table_name) do update set scope=excluded.scope,note=excluded.note,updated_at=now();

-- Catalog tables created by older feature migrations are centrally shared by default.
-- This catches KBS/scope/etc. catalogs without maintaining another migration per catalog.
insert into public.tenant_scope_registry(table_name,scope,note)
select p.tablename,'global','Shared catalog discovered during tenant consolidation'
from pg_tables p
where p.schemaname='public' and p.tablename like '%\_catalog' escape '\'
on conflict(table_name) do update set scope='global',note=excluded.note,updated_at=now();

create or replace function public.current_tenant_code()
returns text
language sql stable security definer set search_path=public as $$
  select public.get_my_institution_code();
$$;
revoke all on function public.current_tenant_code() from public;
grant execute on function public.current_tenant_code() to authenticated;

create or replace function public.tenant_row_allowed(p_institution_code text)
returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_super_admin()
      or (auth.uid() is not null and p_institution_code is not null and p_institution_code=public.get_my_institution_code());
$$;
revoke all on function public.tenant_row_allowed(text) from public;
grant execute on function public.tenant_row_allowed(text) to authenticated;

create or replace function public.enforce_tenant_row()
returns trigger
language plpgsql security definer set search_path=public as $$
declare v_code text;
begin
  -- Database/service-role jobs have no auth.uid(). They may update existing tenant rows,
  -- but inserts must explicitly provide the tenant code.
  if auth.uid() is null then
    if tg_op='INSERT' and new.institution_code is null then
      raise exception 'TENANT_CODE_REQUIRED_FOR_SERVICE_WRITE';
    end if;
    if tg_op='UPDATE' and old.institution_code is distinct from new.institution_code then
      raise exception 'TENANT_CODE_IMMUTABLE';
    end if;
    return new;
  end if;

  if public.is_super_admin() then
    if tg_op='UPDATE' and old.institution_code is distinct from new.institution_code then
      raise exception 'TENANT_CODE_IMMUTABLE';
    end if;
    return new;
  end if;

  v_code:=public.get_my_institution_code();
  if v_code is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if new.institution_code is null then new.institution_code:=v_code; end if;
  if new.institution_code<>v_code then raise exception 'CROSS_TENANT_WRITE_BLOCKED'; end if;
  if tg_op='UPDATE' and old.institution_code is distinct from new.institution_code then
    raise exception 'TENANT_CODE_IMMUTABLE';
  end if;
  return new;
end $$;
revoke all on function public.enforce_tenant_row() from public;

create or replace function public.tenantize_public_table(p_table text,p_legacy_code text default '774380')
returns void
language plpgsql security definer set search_path=public as $$
declare
  v_exists boolean;
  v_constraint text;
  v_trigger text;
  v_policy text;
begin
  select exists(select 1 from pg_tables where schemaname='public' and tablename=p_table) into v_exists;
  if not v_exists then return; end if;

  execute format('alter table public.%I add column if not exists institution_code text',p_table);
  execute format('update public.%I set institution_code=$1 where institution_code is null',p_table) using p_legacy_code;
  execute format('alter table public.%I alter column institution_code set default public.current_tenant_code()',p_table);

  v_constraint:=left('fk_'||p_table||'_institution_code',63);
  if not exists(
    select 1 from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
    where n.nspname='public' and t.relname=p_table and c.conname=v_constraint
  ) then
    begin
      execute format('alter table public.%I add constraint %I foreign key(institution_code) references public.institutions(institution_code) on delete restrict not valid',p_table,v_constraint);
      execute format('alter table public.%I validate constraint %I',p_table,v_constraint);
    exception when others then
      raise notice 'Tenant FK skipped for %: %',p_table,sqlerrm;
    end;
  end if;

  execute format('create index if not exists %I on public.%I(institution_code)',left('idx_'||p_table||'_tenant',63),p_table);
  execute format('alter table public.%I enable row level security',p_table);
  execute format('alter table public.%I force row level security',p_table);

  v_policy:=left('tenant_boundary_'||p_table,63);
  if not exists(
    select 1 from pg_policies where schemaname='public' and tablename=p_table and policyname=v_policy
  ) then
    execute format('create policy %I on public.%I as restrictive for all to authenticated using (public.tenant_row_allowed(institution_code)) with check (public.tenant_row_allowed(institution_code))',v_policy,p_table);
  end if;

  v_trigger:=left('trg_tenant_guard_'||p_table,63);
  if not exists(
    select 1 from pg_trigger tr join pg_class t on t.oid=tr.tgrelid join pg_namespace n on n.oid=t.relnamespace
    where n.nspname='public' and t.relname=p_table and tr.tgname=v_trigger and not tr.tgisinternal
  ) then
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.enforce_tenant_row()',v_trigger,p_table);
  end if;

  insert into public.tenant_scope_registry(table_name,scope,note)
  values(p_table,'tenant','Auto-tenantized operational table')
  on conflict(table_name) do update set scope='tenant',note=excluded.note,updated_at=now();
end $$;
revoke all on function public.tenantize_public_table(text,text) from public;

-- Batch every operational public table in the current schema. Only explicit global/user
-- tables stay outside the tenant fence. This intentionally captures new operational tables
-- created by earlier migrations without maintaining a huge hard-coded list.
do $$
declare r record;
begin
  for r in
    select p.tablename
    from pg_tables p
    left join public.tenant_scope_registry s on s.table_name=p.tablename
    where p.schemaname='public'
      and coalesce(s.scope,'tenant')='tenant'
      and p.tablename not like 'pg_%'
    order by p.tablename
  loop
    perform public.tenantize_public_table(r.tablename,'774380');
  end loop;
end $$;

-- Profiles already carry institution_code from tenant bootstrap. Keep their legacy self/admin
-- policies, but add a restrictive tenant fence so a broad old policy cannot cross institutions.
insert into public.tenant_scope_registry(table_name,scope,note)
values('profiles','tenant','Identity/profile rows belong to one institution')
on conflict(table_name) do update set scope='tenant',note=excluded.note,updated_at=now();
select public.tenantize_public_table('profiles','774380');

-- Pre-registration must be tenant-aware. Existing single-school records belong to the first tenant.
select public.tenantize_public_table('pre_registered_teachers','774380');

-- Institution-scoped personnel override tables already had institution_code; add the same hard fence.
select public.tenantize_public_table('personnel_field_overrides','774380');
select public.tenantize_public_table('personnel_private_details','774380');
select public.tenantize_public_table('personnel_registry','774380');
select public.tenantize_public_table('personnel_import_payloads','774380');

-- Tenant-safe helper for Edge Functions using service role: resolve a user's institution without
-- exposing membership rows to the caller.
create or replace function public.resolve_user_institution(p_user_id uuid)
returns text
language sql stable security definer set search_path=public as $$
  select m.institution_code from public.institution_memberships m
  where m.user_id=p_user_id and m.active
  order by m.is_owner desc,m.created_at limit 1;
$$;
revoke all on function public.resolve_user_institution(uuid) from public;
grant execute on function public.resolve_user_institution(uuid) to authenticated;

-- Tenant-aware lookup used by personnel/teacher registration. It never returns T.C. data.
create or replace function public.resolve_pre_registered_teacher(p_tckn text,p_institution_code text)
returns table(id uuid,email text,institution_code text)
language sql stable security definer set search_path=public as $$
  select p.id,p.email,p.institution_code
  from public.pre_registered_teachers p
  join public.institutions i on i.institution_code=p.institution_code
  where p.tckn=p_tckn and p.institution_code=p_institution_code and p.active
    and i.approval_status='approved'
  limit 1;
$$;
revoke all on function public.resolve_pre_registered_teacher(text,text) from public;

-- Super Admin audit: null tenants, tenantized table count and any table accidentally left
-- outside the registry. This keeps future development tenant-aware without producing new migrations.
create or replace function public.super_admin_tenant_isolation_audit()
returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare r record;v_nulls bigint;v_items jsonb:='[]'::jsonb;v_unregistered text[];
begin
  if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
  for r in select table_name from public.tenant_scope_registry where scope='tenant' order by table_name loop
    if exists(select 1 from pg_tables where schemaname='public' and tablename=r.table_name) then
      execute format('select count(*) from public.%I where institution_code is null',r.table_name) into v_nulls;
      if v_nulls>0 then v_items:=v_items||jsonb_build_array(jsonb_build_object('table',r.table_name,'null_rows',v_nulls)); end if;
    end if;
  end loop;
  select array_agg(p.tablename order by p.tablename) into v_unregistered
  from pg_tables p left join public.tenant_scope_registry s on s.table_name=p.tablename
  where p.schemaname='public' and s.table_name is null;
  return jsonb_build_object(
    'tenant_tables',(select count(*) from public.tenant_scope_registry where scope='tenant'),
    'global_tables',(select count(*) from public.tenant_scope_registry where scope='global'),
    'user_tables',(select count(*) from public.tenant_scope_registry where scope='user'),
    'null_tenant_rows',v_items,
    'unregistered_tables',coalesce(to_jsonb(v_unregistered),'[]'::jsonb)
  );
end $$;
revoke all on function public.super_admin_tenant_isolation_audit() from public;
grant execute on function public.super_admin_tenant_isolation_audit() to authenticated;

-- Helper for future feature migrations: call tenantize_public_table('new_table') in the SAME
-- feature migration instead of creating follow-up tenant patch migrations.
comment on function public.tenantize_public_table(text,text) is
'Future operational tables should be tenantized in the same migration by calling tenantize_public_table(table_name).';
