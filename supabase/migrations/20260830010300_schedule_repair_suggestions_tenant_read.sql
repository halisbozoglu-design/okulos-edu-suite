-- The solver UI reads repair suggestions directly. Restore that read path
-- only through the owning scenario's tenant boundary; no write policy exists.
grant select on table public.schedule_repair_suggestions to authenticated;

create policy schedule_repair_suggestions_tenant_read_v1
on public.schedule_repair_suggestions
for select
to authenticated
using (
  exists (
    select 1
    from public.schedule_scenarios s
    where s.id = schedule_repair_suggestions.scenario_id
      and public.tenant_row_allowed(s.institution_code)
  )
);
