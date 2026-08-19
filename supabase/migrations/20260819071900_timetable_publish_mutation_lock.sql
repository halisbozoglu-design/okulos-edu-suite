-- Serialize all working-timetable mutations with publication snapshots.
-- This prevents a publish hash/snapshot from observing a schedule that changes mid-transaction.

create or replace function public.lock_teacher_schedule_mutation_v2()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('okulos:timetable:engine'));
  return null;
end;
$$;

drop trigger if exists trg_lock_teacher_schedule_mutation_v2 on public.teacher_schedule;
create trigger trg_lock_teacher_schedule_mutation_v2
before insert or update or delete on public.teacher_schedule
for each statement execute function public.lock_teacher_schedule_mutation_v2();

-- Preserve the final V2 publication implementation as a core, and expose a locked wrapper.
alter function public.publish_current_schedule(date,text,text,text)
rename to publish_current_schedule_core_v2;

create or replace function public.publish_current_schedule(
  p_effective_from date,
  p_academic_year text default null,
  p_title text default 'Haftalık Ders Programı',
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  perform pg_advisory_xact_lock(hashtext('okulos:timetable:engine'));
  return public.publish_current_schedule_core_v2(p_effective_from,p_academic_year,p_title,p_note);
end;
$$;

revoke all on function public.publish_current_schedule(date,text,text,text) from public;
grant execute on function public.publish_current_schedule(date,text,text,text) to authenticated;
