-- Remove legacy permissive duty policies that would bypass delegated task permissions.

drop policy if exists "authenticated read duty incidents" on public.duty_incident_logs;
drop policy if exists "authenticated create duty incidents" on public.duty_incident_logs;

create policy "delegated duty users read incidents" on public.duty_incident_logs
for select to authenticated
using (public.has_module_operation_permission('duty'));

create policy "delegated duty managers create incidents" on public.duty_incident_logs
for insert to authenticated
with check (
  public.has_permission('duty.manage')
  and (reporter_id is null or reporter_id = auth.uid() or public.has_permission('duty.manage'))
);

-- Tardiness data is operationally sensitive as well; remove any future broad policy ambiguity.
drop policy if exists "authenticated read duty tardiness" on public.duty_tardiness_logs;

-- Daily notes may only be modified by delegated duty managers; old manager policy may coexist safely
-- for role-mode managers, but delegated mode must use the explicit permission policy.
create policy "delegated duty managers update daily notes" on public.duty_day_notes
for all to authenticated
using (public.has_permission('duty.manage'))
with check (public.has_permission('duty.manage'));
