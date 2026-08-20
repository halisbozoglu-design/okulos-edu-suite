-- Preserve every column from MEB personnel summary reports while exposing only Super Admin-approved fields to modules.

create table if not exists public.personnel_import_payloads (
  id uuid primary key default gen_random_uuid(),
  personnel_id uuid not null references public.personnel_registry(id) on delete cascade,
  source_file_name text,
  source_format text,
  raw_data jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  is_current boolean not null default true
);
create index if not exists personnel_import_payloads_personnel_idx on public.personnel_import_payloads(personnel_id, imported_at desc);

create table if not exists public.personnel_field_catalog (
  field_key text primary key,
  display_name text not null,
  source_headers text[] not null default '{}',
  enabled boolean not null default false,
  module_keys text[] not null default '{}',
  data_class text not null default 'general',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.personnel_import_payloads enable row level security;
alter table public.personnel_field_catalog enable row level security;

drop policy if exists personnel_import_payloads_super_read on public.personnel_import_payloads;
create policy personnel_import_payloads_super_read on public.personnel_import_payloads
for select to authenticated using (public.is_super_admin());

drop policy if exists personnel_field_catalog_read on public.personnel_field_catalog;
create policy personnel_field_catalog_read on public.personnel_field_catalog
for select to authenticated using (public.is_super_admin());

drop policy if exists personnel_field_catalog_manage on public.personnel_field_catalog;
create policy personnel_field_catalog_manage on public.personnel_field_catalog
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create or replace function public.import_personnel_registry(p_file_name text, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb;
  v_personnel_id uuid;
  v_count integer := 0;
  v_raw jsonb;
  v_pair record;
  v_key text;
  v_label text;
  v_format text;
begin
  if not public.has_permission(auth.uid(),'personnel.manage') and not public.is_super_admin() then
    raise exception 'FORBIDDEN';
  end if;
  v_format := lower(coalesce(nullif(regexp_replace(p_file_name, '^.*\\.', ''),''),'unknown'));

  for r in select * from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    insert into public.personnel_registry(full_name,title,duty_title,teaching_area_raw,employment_status,system_role,source_file_name)
    values(
      nullif(r->>'fullName',''),
      nullif(r->>'title',''),
      nullif(r->>'dutyTitle',''),
      nullif(r->>'teachingArea',''),
      nullif(r->>'employmentStatus',''),
      nullif(r->>'systemRole',''),
      p_file_name
    )
    on conflict (full_name, teaching_area_raw, duty_title) do update set
      title=excluded.title,
      employment_status=excluded.employment_status,
      system_role=excluded.system_role,
      source_file_name=excluded.source_file_name,
      active=true,
      updated_at=now()
    returning id into v_personnel_id;

    v_raw := coalesce(r->'rawFields','{}'::jsonb);
    update public.personnel_import_payloads set is_current=false where personnel_id=v_personnel_id and is_current;
    insert into public.personnel_import_payloads(personnel_id,source_file_name,source_format,raw_data,is_current)
    values(v_personnel_id,p_file_name,v_format,v_raw,true);

    for v_pair in select key,value from jsonb_each(v_raw) loop
      v_key := v_pair.key;
      v_label := coalesce(nullif(r->'rawLabels'->>v_key,''),v_key);
      insert into public.personnel_field_catalog(field_key,display_name,source_headers,last_seen_at)
      values(v_key,v_label,array[v_label],now())
      on conflict(field_key) do update set
        display_name=case when public.personnel_field_catalog.display_name=public.personnel_field_catalog.field_key then excluded.display_name else public.personnel_field_catalog.display_name end,
        source_headers=(select array(select distinct x from unnest(public.personnel_field_catalog.source_headers || excluded.source_headers) x)),
        last_seen_at=now();
    end loop;
    v_count := v_count + 1;
  end loop;
  return jsonb_build_object('affected_personnel',v_count);
end $$;

-- Modules never read raw payloads directly. They receive only fields explicitly enabled and assigned by Super Admin.
create or replace function public.get_personnel_module_fields(p_personnel_id uuid, p_module_key text)
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  with current_payload as (
    select raw_data from public.personnel_import_payloads
    where personnel_id=p_personnel_id and is_current
    order by imported_at desc limit 1
  )
  select coalesce(jsonb_object_agg(f.field_key, p.raw_data->f.field_key),'{}'::jsonb)
  from public.personnel_field_catalog f
  cross join current_payload p
  where f.enabled=true and p_module_key=any(f.module_keys) and p.raw_data ? f.field_key;
$$;
grant execute on function public.get_personnel_module_fields(uuid,text) to authenticated;

create or replace function public.set_personnel_field_rule(p_field_key text, p_enabled boolean, p_module_keys text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
  update public.personnel_field_catalog
  set enabled=p_enabled, module_keys=coalesce(p_module_keys,'{}'::text[]), updated_at=now(), updated_by=auth.uid()
  where field_key=p_field_key;
end $$;
grant execute on function public.set_personnel_field_rule(text,boolean,text[]) to authenticated;
