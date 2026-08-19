-- Backward-compatible transition from broad manager role to delegated task permissions.
alter table public.profiles add column if not exists permission_mode text not null default 'role'
  check(permission_mode in ('role','delegated'));

create or replace function public.has_permission(p_code text,p_scope jsonb default '{}'::jsonb)
returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_super_admin()
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='manager' and p.permission_mode='role')
    or exists(
      select 1 from public.user_permission_grants g
      where g.user_id=auth.uid() and g.permission_code=p_code and g.active
        and (g.valid_from is null or g.valid_from<=current_date)
        and (g.valid_until is null or g.valid_until>=current_date)
        and (g.scope='{}'::jsonb or p_scope='{}'::jsonb or g.scope @> p_scope)
    );
$$;

create or replace function public.has_any_module_permission(p_module text)
returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_super_admin()
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='manager' and p.permission_mode='role')
    or exists(
      select 1 from public.user_permission_grants g join public.permission_catalog c on c.code=g.permission_code
      where g.user_id=auth.uid() and c.module_code=p_module and g.active and c.active
        and (g.valid_from is null or g.valid_from<=current_date)
        and (g.valid_until is null or g.valid_until>=current_date)
    );
$$;

create or replace function public.get_my_permissions()
returns table(code text,module_code text,module_label text,label text,action text,scope jsonb,dangerous boolean)
language sql stable security definer set search_path=public as $$
  select c.code,c.module_code,c.module_label,c.label,c.action,'{}'::jsonb,c.dangerous
  from public.permission_catalog c
  where c.active and (
    public.is_super_admin()
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='manager' and p.permission_mode='role')
  )
  union all
  select c.code,c.module_code,c.module_label,c.label,c.action,g.scope,c.dangerous
  from public.user_permission_grants g join public.permission_catalog c on c.code=g.permission_code
  where g.user_id=auth.uid() and g.active and c.active
    and (g.valid_from is null or g.valid_from<=current_date)
    and (g.valid_until is null or g.valid_until>=current_date)
    and not exists(
      select 1 from public.profiles p where p.user_id=auth.uid()
        and (p.role='admin' or (p.role='manager' and p.permission_mode='role'))
    )
  order by module_label,label;
$$;

create or replace function public.set_user_permission_mode(p_user_id uuid,p_mode text)
returns boolean
language plpgsql security definer set search_path=public as $$
begin
  if not public.can_manage_permissions() then raise exception 'NOT_AUTHORIZED';end if;
  if p_mode not in ('role','delegated') then raise exception 'INVALID_PERMISSION_MODE';end if;
  if p_user_id=auth.uid() and not public.is_super_admin() then raise exception 'CANNOT_CHANGE_OWN_PERMISSION_MODE';end if;
  if exists(select 1 from public.profiles where user_id=p_user_id and role='admin') and not public.is_super_admin() then raise exception 'CANNOT_RESTRICT_ADMIN';end if;
  update public.profiles set permission_mode=p_mode,updated_at=now() where user_id=p_user_id;
  if not found then raise exception 'USER_NOT_FOUND';end if;
  insert into public.permission_audit_log(target_user_id,permission_code,operation,scope,note,actor_user_id)
  values(p_user_id,'permission_mode','update','{}'::jsonb,'permission_mode='||p_mode,auth.uid());
  return true;
end;
$$;

-- PostgreSQL cannot CREATE OR REPLACE a function when the OUT row shape changes.
-- 72700 created this function without permission_mode, therefore drop it before the V2 shape.
drop function if exists public.get_permission_admin_matrix();
create function public.get_permission_admin_matrix()
returns table(user_id uuid,full_name text,role public.app_role,permission_mode text,permission_code text,scope jsonb,valid_from date,valid_until date)
language sql stable security definer set search_path=public as $$
  select p.user_id,p.full_name,p.role,p.permission_mode,g.permission_code,g.scope,g.valid_from,g.valid_until
  from public.profiles p left join public.user_permission_grants g on g.user_id=p.user_id and g.active
  where public.can_manage_permissions()
  order by p.full_name,g.permission_code;
$$;

revoke all on function public.set_user_permission_mode(uuid,text) from public;
revoke all on function public.get_permission_admin_matrix() from public;
grant execute on function public.set_user_permission_mode(uuid,text),public.get_permission_admin_matrix() to authenticated;
