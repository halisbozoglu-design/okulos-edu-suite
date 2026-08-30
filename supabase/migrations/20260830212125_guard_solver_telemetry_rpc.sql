create or replace function public.record_schedule_solver_operator_telemetry_v1(
  p_context_key text,
  p_observations jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant text := public.current_tenant_code();
  r jsonb;
begin
  perform public.open_permission_context('schedule.generate');
  if v_tenant is null then
    raise exception 'TENANT_REQUIRED';
  end if;

  for r in select value from jsonb_array_elements(coalesce(p_observations, '[]'::jsonb)) loop
    insert into public.schedule_solver_operator_telemetry(
      institution_code, context_key, strategy, attempts, wins, reward_sum, updated_at
    ) values (
      v_tenant,
      p_context_key,
      r ->> 'strategy',
      1,
      case when coalesce((r ->> 'win')::boolean, false) then 1 else 0 end,
      coalesce((r ->> 'reward')::double precision, 0),
      now()
    )
    on conflict (institution_code, context_key, strategy) do update
    set attempts = schedule_solver_operator_telemetry.attempts + 1,
        wins = schedule_solver_operator_telemetry.wins + excluded.wins,
        reward_sum = schedule_solver_operator_telemetry.reward_sum + excluded.reward_sum,
        updated_at = now();
  end loop;
end;
$$;
