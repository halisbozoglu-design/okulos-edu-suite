-- Ensure every teacher has an explicit constraint row; keep legacy solver time setting synchronized with central profile.
insert into public.teacher_schedule_constraints(teacher_id,max_consecutive_hours)
select user_id,4 from public.profiles where role='teacher'
on conflict(teacher_id) do nothing;

create or replace function public.ensure_teacher_schedule_constraint()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.role='teacher' then
    insert into public.teacher_schedule_constraints(teacher_id,max_consecutive_hours) values(new.user_id,4)
    on conflict(teacher_id) do nothing;
  end if;
  return new;
end;$$;
drop trigger if exists trg_ensure_teacher_schedule_constraint on public.profiles;
create trigger trg_ensure_teacher_schedule_constraint
after insert or update of role on public.profiles
for each row execute function public.ensure_teacher_schedule_constraint();

create or replace function public.sync_active_time_profile_to_solver_settings()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.active=true then
    update public.schedule_generation_settings set teaching_days=new.teaching_days,periods_per_day=new.periods_per_day,updated_at=now() where id=true;
  end if;
  return new;
end;$$;
drop trigger if exists trg_sync_time_profile_solver on public.schedule_time_profiles;
create trigger trg_sync_time_profile_solver
after insert or update of teaching_days,periods_per_day,active on public.schedule_time_profiles
for each row execute function public.sync_active_time_profile_to_solver_settings();

update public.schedule_generation_settings s
set teaching_days=p.teaching_days,periods_per_day=p.periods_per_day,updated_at=now()
from public.schedule_time_profiles p where p.active=true and s.id=true;

create or replace function public.validate_sync_group_member_hours()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_hours integer;
begin
  select assigned_hours into v_hours from public.teacher_course_assignments where id=new.teacher_assignment_id;
  if v_hours is null then raise exception 'TEACHER_ASSIGNMENT_NOT_FOUND';end if;
  if new.block_hours>v_hours then raise exception 'SYNC_BLOCK_EXCEEDS_ASSIGNED_HOURS';end if;
  return new;
end;$$;
drop trigger if exists trg_validate_sync_group_member_hours on public.schedule_sync_group_members;
create trigger trg_validate_sync_group_member_hours before insert or update on public.schedule_sync_group_members
for each row execute function public.validate_sync_group_member_hours();
