create extension if not exists pgcrypto;

create table if not exists public.telegram_integrations (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  telegram_chat_id bigint unique,
  enabled boolean not null default false,
  linked_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.telegram_link_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_telegram_link_tokens_user
  on public.telegram_link_tokens(user_id, created_at desc);

alter table public.telegram_integrations enable row level security;
alter table public.telegram_link_tokens enable row level security;

grant select, update on public.telegram_integrations to authenticated;

create policy "users can read own telegram integration"
on public.telegram_integrations for select to authenticated
using (user_id = (select auth.uid()));

create policy "users can disable own telegram integration"
on public.telegram_integrations for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.create_telegram_link_token()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_token text;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  delete from public.telegram_link_tokens
  where user_id = v_user and used_at is null;

  v_token := encode(gen_random_bytes(32), 'hex');

  insert into public.telegram_link_tokens(user_id, token_hash, expires_at)
  values (
    v_user,
    encode(digest(v_token, 'sha256'), 'hex'),
    now() + interval '15 minutes'
  );

  return v_token;
end;
$$;

revoke all on function public.create_telegram_link_token() from public;
grant execute on function public.create_telegram_link_token() to authenticated;

create or replace function public.disable_telegram_notifications()
returns void
language sql
security definer
set search_path = public
as $$
  update public.telegram_integrations
  set enabled = false, updated_at = now()
  where user_id = auth.uid();
$$;

revoke all on function public.disable_telegram_notifications() from public;
grant execute on function public.disable_telegram_notifications() to authenticated;
