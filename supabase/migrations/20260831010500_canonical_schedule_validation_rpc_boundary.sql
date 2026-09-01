-- Final public boundary for scenario validation. Keep the canonical HARD-rule
-- implementation intact; this layer only enforces tenant/permission access.

create or replace function public.assert_canonical_schedule_scenario_access_v1(
  p_scenario_id uuid
) returns void
language plpgsql stable security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if not (
    public.is_manager_or_admin()
    or public.has_permission('schedule.view')
    or public.has_permission('schedule.edit')
    or public.has_permission('schedule.rules')
    or public.has_permission('schedule.generate')
    or public.has_permission('schedule.apply')
    or public.has_permission('schedule.publish')
    or public.has_permission('schedule.restore')
  ) then
    raise exception 'PERMISSION_DENIED: schedule.view';
  end if;
end $$;

alter function public.get_schedule_scenario_hard_issues_v2(uuid)
  rename to get_schedule_scenario_hard_issues_pre_access_v1;
create or replace function public.get_schedule_scenario_hard_issues_v2(
  p_scenario_id uuid
) returns table(code text, affected_count integer, detail text)
language plpgsql stable security definer set search_path=public as $$
begin
  perform public.assert_canonical_schedule_scenario_access_v1(p_scenario_id);
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return query
    select x.code, x.affected_count, x.detail
    from public.get_schedule_scenario_hard_issues_pre_access_v1(p_scenario_id) x;
end $$;

alter function public.validate_schedule_scenario_v2(uuid)
  rename to validate_schedule_scenario_pre_access_v1;
create or replace function public.validate_schedule_scenario_v2(
  p_scenario_id uuid
) returns integer
language plpgsql security definer set search_path=public as $$
begin
  perform public.assert_canonical_schedule_scenario_access_v1(p_scenario_id);
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return public.validate_schedule_scenario_pre_access_v1(p_scenario_id);
end $$;

revoke all on function public.assert_canonical_schedule_scenario_access_v1(uuid),
  public.get_schedule_scenario_hard_issues_pre_access_v1(uuid),
  public.validate_schedule_scenario_pre_access_v1(uuid),
  public.get_schedule_scenario_hard_issues_v2(uuid),
  public.validate_schedule_scenario_v2(uuid)
from public, anon;
grant execute on function public.get_schedule_scenario_hard_issues_v2(uuid),
  public.validate_schedule_scenario_v2(uuid)
to authenticated;
