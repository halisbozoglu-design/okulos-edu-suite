-- Super-admin management of already registered personnel without exposing raw TCKN.

create or replace function public.get_super_admin_registered_personnel()
returns table(
  user_id uuid,
  full_name text,
  email text,
  role public.app_role,
  teaching_area_id uuid,
  is_super_admin boolean,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path=public
as $$
  select p.user_id,p.full_name,p.email,p.role,p.teaching_area_id,p.is_super_admin,p.updated_at
  from public.profiles p
  where public.is_super_admin()
  order by coalesce(p.full_name,p.email);
$$;

revoke all on function public.get_super_admin_registered_personnel() from public;
grant execute on function public.get_super_admin_registered_personnel() to authenticated;

create or replace function public.super_admin_set_profile_teaching_area(
  p_user_id uuid,
  p_teaching_area_id uuid
)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_super_admin() then raise exception 'NOT_SUPER_ADMIN'; end if;
  if not exists(select 1 from public.profiles where user_id=p_user_id) then raise exception 'PROFILE_NOT_FOUND'; end if;
  if p_teaching_area_id is not null and not exists(
    select 1 from public.teaching_areas where id=p_teaching_area_id and active=true
  ) then raise exception 'TEACHING_AREA_NOT_FOUND'; end if;

  update public.profiles
  set teaching_area_id=p_teaching_area_id,updated_at=now()
  where user_id=p_user_id;
  return true;
end;
$$;

revoke all on function public.super_admin_set_profile_teaching_area(uuid,uuid) from public;
grant execute on function public.super_admin_set_profile_teaching_area(uuid,uuid) to authenticated;
