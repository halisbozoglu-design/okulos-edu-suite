create or replace function public.has_permission(p_user_id uuid, p_code text, p_scope jsonb default '{}'::jsonb)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(p_user_id is not null and (
    exists(select 1 from public.profiles p where p.user_id=p_user_id and (p.is_super_admin or p.role='admin'))
    or exists(select 1 from public.profiles p where p.user_id=p_user_id and p.role='manager' and p.permission_mode='role')
    or exists(
      select 1 from public.user_permission_grants g
      where g.user_id=p_user_id and g.permission_code=p_code and g.active
        and (g.valid_from is null or g.valid_from<=current_date)
        and (g.valid_until is null or g.valid_until>=current_date)
        and (g.scope='{}'::jsonb or p_scope='{}'::jsonb or g.scope @> p_scope)
    )
    or exists(
      select 1
      from public.user_task_role_assignments a
      join public.task_role_templates t on t.id=a.template_id and t.active
      join public.task_role_template_permissions tp on tp.template_id=t.id
      where a.user_id=p_user_id and a.active and tp.permission_code=p_code
        and (a.valid_from is null or a.valid_from<=current_date)
        and (a.valid_until is null or a.valid_until>=current_date)
        and (tp.scope='{}'::jsonb or p_scope='{}'::jsonb or tp.scope @> p_scope)
    )
  ), false);
$$;

revoke all on function public.has_permission(uuid,text,jsonb) from public;
grant execute on function public.has_permission(uuid,text,jsonb) to authenticated, service_role;