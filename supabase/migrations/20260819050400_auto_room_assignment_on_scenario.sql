-- Automatically run classroom assignment when a generated scenario receives its final row count.

create or replace function public.auto_assign_rooms_after_scenario_generation()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.row_count>0 and (old.row_count is distinct from new.row_count or old.status is distinct from new.status) then
    perform * from public.assign_classrooms_to_scenario(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_auto_assign_rooms_after_scenario_generation on public.schedule_scenarios;
create trigger trg_auto_assign_rooms_after_scenario_generation
after update of row_count,status on public.schedule_scenarios
for each row
when (new.row_count>0)
execute function public.auto_assign_rooms_after_scenario_generation();
