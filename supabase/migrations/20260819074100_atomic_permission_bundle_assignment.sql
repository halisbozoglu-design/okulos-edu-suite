-- Quick task bundles must be all-or-nothing. Multiple client RPC calls can leave a half-assigned role.

create or replace function public.set_user_permission_bundle(
  p_user_id uuid,
  p_permission_codes text[],
  p_valid_from date default null,
  p_valid_until date default null,
  p_note text default 'Hızlı görev paketi'
)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_code text;
  v_count integer:=0;
begin
  if not public.can_manage_permissions() then raise exception 'NOT_AUTHORIZED';end if;
  if p_user_id=auth.uid() and not public.is_super_admin() then raise exception 'CANNOT_CHANGE_OWN_PERMISSIONS';end if;
  if not exists(select 1 from public.profiles where user_id=p_user_id) then raise exception 'USER_NOT_FOUND';end if;
  if p_valid_until is not null and p_valid_from is not null and p_valid_until<p_valid_from then raise exception 'INVALID_VALIDITY_RANGE';end if;
  if coalesce(cardinality(p_permission_codes),0)=0 then raise exception 'EMPTY_PERMISSION_BUNDLE';end if;

  if exists(
    select 1 from unnest(p_permission_codes) x(code)
    where not exists(select 1 from public.permission_catalog c where c.code=x.code and c.active)
  ) then raise exception 'UNKNOWN_PERMISSION_IN_BUNDLE';end if;

  -- Keep the security root out of ordinary quick bundles unless the actor is already allowed by the single-grant API.
  perform public.set_user_permission_mode(p_user_id,'delegated');

  for v_code in select distinct x.code from unnest(p_permission_codes) x(code) loop
    perform public.set_user_permission(
      p_user_id,
      v_code,
      true,
      '{}'::jsonb,
      p_valid_from,
      p_valid_until,
      p_note
    );
    v_count:=v_count+1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.set_user_permission_bundle(uuid,text[],date,date,text) from public;
grant execute on function public.set_user_permission_bundle(uuid,text[],date,date,text) to authenticated;
