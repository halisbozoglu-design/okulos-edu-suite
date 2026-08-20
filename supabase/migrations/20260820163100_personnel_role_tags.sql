-- Keep source-derived role tags separate from the coarse app_role enum.
-- Users can read only their own tags; the principal may manage/sync them through imports.
create table if not exists public.profile_role_tags (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_tag text not null,
  source text not null default 'meb_personnel_summary',
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key(user_id,role_tag,source)
);

alter table public.profile_role_tags enable row level security;
drop policy if exists profile_role_tags_self_read on public.profile_role_tags;
create policy profile_role_tags_self_read on public.profile_role_tags for select to authenticated using(user_id=auth.uid());
drop policy if exists profile_role_tags_principal_read on public.profile_role_tags;
create policy profile_role_tags_principal_read on public.profile_role_tags for select to authenticated using(public.is_principal_user());

create or replace function public.sync_profile_role_tags_from_registry()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_tag text;
begin
  if new.linked_user_id is null then return new; end if;
  update public.profile_role_tags set active=false,updated_at=now()
  where user_id=new.linked_user_id and source='meb_personnel_summary';
  foreach v_tag in array coalesce(new.derived_roles,'{}'::text[]) loop
    insert into public.profile_role_tags(user_id,role_tag,source,active,updated_at)
    values(new.linked_user_id,v_tag,'meb_personnel_summary',true,now())
    on conflict(user_id,role_tag,source) do update set active=true,updated_at=now();
  end loop;
  return new;
end $$;

drop trigger if exists sync_profile_role_tags_from_registry_trigger on public.personnel_registry;
create trigger sync_profile_role_tags_from_registry_trigger
after insert or update of linked_user_id,derived_roles on public.personnel_registry
for each row execute function public.sync_profile_role_tags_from_registry();

create or replace function public.get_my_role_tags()
returns text[] language sql stable security definer set search_path=public as $$
  select coalesce(array_agg(role_tag order by role_tag),'{}'::text[])
  from public.profile_role_tags where user_id=auth.uid() and active;
$$;
revoke all on function public.get_my_role_tags() from public;
grant execute on function public.get_my_role_tags() to authenticated;
