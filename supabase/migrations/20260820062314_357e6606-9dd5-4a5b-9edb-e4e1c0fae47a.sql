create or replace function public.get_personnel_admin_list()
returns table(
  user_id uuid,
  full_name text,
  email text,
  role public.app_role,
  teaching_area_id uuid,
  permission_mode text,
  is_super_admin boolean,
  updated_at timestamptz
)
language plpgsql stable security definer set search_path=public as $$
begin
  if not(public.has_permission('personnel.view') or public.has_permission('personnel.manage')) then
    raise exception 'PERMISSION_DENIED: personnel.view';
  end if;
  return query
  select p.user_id,p.full_name,p.email,p.role,p.teaching_area_id,p.permission_mode,p.is_super_admin,p.updated_at
  from public.profiles p
  order by p.full_name nulls last,p.user_id;
end;$$;

create or replace function public.set_personnel_teaching_area(p_user_id uuid,p_teaching_area_id uuid default null)
returns boolean
language plpgsql security definer set search_path=public as $$
declare v_target_super boolean;
begin
  if not public.has_permission('personnel.manage') then raise exception 'PERMISSION_DENIED: personnel.manage';end if;
  select p.is_super_admin into v_target_super from public.profiles p where p.user_id=p_user_id;
  if not found then raise exception 'USER_NOT_FOUND';end if;
  if coalesce(v_target_super,false) and not public.is_super_admin() then raise exception 'CANNOT_MODIFY_SUPER_ADMIN';end if;
  if p_teaching_area_id is not null and not exists(select 1 from public.teaching_areas where id=p_teaching_area_id and active=true) then raise exception 'TEACHING_AREA_NOT_FOUND';end if;

  update public.profiles set teaching_area_id=p_teaching_area_id,updated_at=now() where user_id=p_user_id;
  insert into public.permission_audit_log(target_user_id,permission_code,operation,scope,note,actor_user_id)
  values(p_user_id,'personnel.manage','update',jsonb_build_object('teaching_area_id',p_teaching_area_id), 'Personel atama alanı güncellendi',auth.uid());
  return true;
end;$$;

create policy "delegated personnel users read teaching areas" on public.teaching_areas
for select to authenticated using(public.has_permission('personnel.view') or public.has_permission('personnel.manage') or public.has_permission('norm.view') or public.has_permission('norm.manage'));

revoke all on function public.get_personnel_admin_list(),public.set_personnel_teaching_area(uuid,uuid) from public;
grant execute on function public.get_personnel_admin_list(),public.set_personnel_teaching_area(uuid,uuid) to authenticated;