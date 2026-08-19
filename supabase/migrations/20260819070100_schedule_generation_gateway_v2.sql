-- Timetable generation gateway: synchronize derived plans, then enforce preflight readiness.
create or replace function public.generate_schedule_scenarios_v2()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql security definer set search_path=public as $$
declare v_sync record;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  select * into v_sync from public.sync_all_quran_plans_to_timetable();
  perform public.assert_schedule_preparation_ready();
  return query select * from public.generate_schedule_scenarios();
end;$$;
revoke all on function public.generate_schedule_scenarios_v2() from public;
grant execute on function public.generate_schedule_scenarios_v2() to authenticated;

-- The central time profile is authoritative; legacy quality settings cannot diverge from it.
create or replace function public.enforce_generation_time_from_profile()
returns trigger language plpgsql security definer set search_path=public as $$
declare p public.schedule_time_profiles%rowtype;
begin
  select * into p from public.schedule_time_profiles where active=true limit 1;
  if found then new.teaching_days:=p.teaching_days;new.periods_per_day:=p.periods_per_day;end if;
  return new;
end;$$;
drop trigger if exists trg_enforce_generation_time_profile on public.schedule_generation_settings;
create trigger trg_enforce_generation_time_profile before insert or update on public.schedule_generation_settings
for each row execute function public.enforce_generation_time_from_profile();
