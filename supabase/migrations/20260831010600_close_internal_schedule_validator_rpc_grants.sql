-- Explicit historical grants survive a PUBLIC revoke.  Keep implementation
-- stages internal; only the final canonical validator endpoints are callable.

revoke all on function public.assert_canonical_schedule_scenario_access_v1(uuid),
  public.get_schedule_scenario_hard_issues_pre_timebound_exception_v1(uuid),
  public.validate_schedule_scenario_pre_timebound_exception_v1(uuid)
from public, anon, authenticated;

revoke all on function public.get_schedule_scenario_hard_issues_v2(uuid),
  public.validate_schedule_scenario_v2(uuid)
from public, anon;
grant execute on function public.get_schedule_scenario_hard_issues_v2(uuid),
  public.validate_schedule_scenario_v2(uuid)
to authenticated;
