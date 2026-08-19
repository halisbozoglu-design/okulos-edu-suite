-- Standard Web Push subscriptions for OkulOS PWA. Firebase is not required.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  platform text not null default 'web' check (platform in ('web','ios','android')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(endpoint)
);

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id) where active=true;

alter table public.push_subscriptions enable row level security;
grant select,insert,update,delete on public.push_subscriptions to authenticated;

create policy "users manage own push subscriptions"
on public.push_subscriptions for all to authenticated
using (user_id=auth.uid())
with check (user_id=auth.uid());

create or replace function public.register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null,
  p_platform text default 'web'
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if nullif(trim(p_endpoint),'') is null or nullif(trim(p_p256dh),'') is null or nullif(trim(p_auth),'') is null then
    raise exception 'INVALID_PUSH_SUBSCRIPTION';
  end if;
  if p_platform not in ('web','ios','android') then raise exception 'INVALID_PLATFORM'; end if;

  insert into public.push_subscriptions(user_id,endpoint,p256dh,auth,user_agent,platform,active,updated_at)
  values(auth.uid(),trim(p_endpoint),trim(p_p256dh),trim(p_auth),nullif(trim(p_user_agent),''),p_platform,true,now())
  on conflict(endpoint) do update set
    user_id=excluded.user_id,p256dh=excluded.p256dh,auth=excluded.auth,
    user_agent=excluded.user_agent,platform=excluded.platform,active=true,updated_at=now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.register_push_subscription(text,text,text,text,text) from public;
grant execute on function public.register_push_subscription(text,text,text,text,text) to authenticated;

create or replace function public.disable_push_subscription(p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  update public.push_subscriptions set active=false,updated_at=now()
  where user_id=auth.uid() and endpoint=p_endpoint;
  return found;
end;
$$;
revoke all on function public.disable_push_subscription(text) from public;
grant execute on function public.disable_push_subscription(text) to authenticated;
