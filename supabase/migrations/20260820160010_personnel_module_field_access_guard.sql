-- Approved personnel fields are exposed only to operators who already hold an operation permission for that module.
create or replace function public.get_personnel_module_fields(p_personnel_id uuid, p_module_key text)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null then return '{}'::jsonb; end if;
  if not public.is_super_admin()
     and not public.has_permission(auth.uid(),'personnel.view')
     and not public.has_permission(auth.uid(),'personnel.manage')
     and not public.has_module_operation_permission(p_module_key) then
    return '{}'::jsonb;
  end if;

  with current_payload as (
    select raw_data from public.personnel_import_payloads
    where personnel_id=p_personnel_id and is_current
    order by imported_at desc limit 1
  )
  select coalesce(jsonb_object_agg(f.field_key, p.raw_data->f.field_key),'{}'::jsonb)
    into v_result
  from public.personnel_field_catalog f
  cross join current_payload p
  where f.enabled=true and p_module_key=any(f.module_keys) and p.raw_data ? f.field_key;

  return coalesce(v_result,'{}'::jsonb);
end $$;
revoke all on function public.get_personnel_module_fields(uuid,text) from public;
grant execute on function public.get_personnel_module_fields(uuid,text) to authenticated;
