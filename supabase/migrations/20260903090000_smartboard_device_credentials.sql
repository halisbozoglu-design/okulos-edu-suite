-- Device-scoped OkulOS integration credential registry.
-- Never place SUPABASE_SERVICE_ROLE_KEY or a Lovable token on boards/Local Hub.

create table if not exists public.smartboard_integration_devices (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  smartboard_device_key text not null,
  credential_sha256 text not null,
  enabled boolean not null default true,
  expires_at timestamptz,
  last_seen_at timestamptz,
  last_plan_date date,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_code, smartboard_device_key),
  check (length(credential_sha256)=64)
);

create index if not exists idx_smartboard_integration_device_lookup
  on public.smartboard_integration_devices(institution_code,smartboard_device_key)
  where enabled=true;

alter table public.smartboard_integration_devices enable row level security;

do $$ begin
  create policy "managers manage smartboard integration devices"
  on public.smartboard_integration_devices for all to authenticated
  using(public.has_institution_access(institution_code) and public.is_manager_or_admin())
  with check(public.has_institution_access(institution_code) and public.is_manager_or_admin());
exception when duplicate_object then null; end $$;

grant all on public.smartboard_integration_devices to service_role;
grant select,insert,update,delete on public.smartboard_integration_devices to authenticated;
