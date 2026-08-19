-- Preserve every duty change as historical evidence instead of overwriting/deleting prior assignments.

create table if not exists public.duty_assignment_history (
  id bigint generated always as identity primary key,
  assignment_type text not null check (assignment_type in ('teacher_duty','vice_principal_duty')),
  subject_user_id uuid not null references public.profiles(user_id) on delete restrict,
  duty_date date not null,
  duty_location text,
  effective_start_date date not null,
  effective_end_date date,
  source text not null default 'manual',
  previous_record jsonb,
  new_record jsonb,
  change_reason text,
  changed_by uuid references public.profiles(user_id) on delete set null,
  changed_at timestamptz not null default now(),
  check (effective_end_date is null or effective_end_date >= effective_start_date)
);

create index if not exists idx_duty_history_subject on public.duty_assignment_history(subject_user_id, effective_start_date desc, changed_at desc);
create index if not exists idx_duty_history_duty_date on public.duty_assignment_history(duty_date, assignment_type, changed_at desc);

alter table public.duty_assignment_history enable row level security;
grant select on public.duty_assignment_history to authenticated;
create policy "managers read duty assignment history"
on public.duty_assignment_history for select to authenticated
using (public.is_manager_or_admin());

create or replace function public.log_teacher_duty_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date, duty_location,
      effective_start_date, source, new_record, changed_by
    ) values (
      'teacher_duty', new.teacher_id, new.duty_date, new.duty_location,
      new.duty_date, coalesce(new.assignment_source,'manual'), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date, duty_location,
      effective_start_date, effective_end_date, source,
      previous_record, new_record, changed_by
    ) values (
      'teacher_duty', old.teacher_id, old.duty_date, old.duty_location,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date, duty_location,
      effective_start_date, effective_end_date, source,
      previous_record, changed_by
    ) values (
      'teacher_duty', old.teacher_id, old.duty_date, old.duty_location,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), auth.uid()
    );
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_log_teacher_duty_history on public.teacher_duty_assignments;
create trigger trg_log_teacher_duty_history
after insert or update or delete on public.teacher_duty_assignments
for each row execute function public.log_teacher_duty_history();

create or replace function public.log_vp_duty_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date,
      effective_start_date, source, new_record, changed_by
    ) values (
      'vice_principal_duty', new.vice_principal_id, new.duty_date,
      new.duty_date, coalesce(new.assignment_source,'manual'), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date,
      effective_start_date, effective_end_date, source,
      previous_record, new_record, changed_by
    ) values (
      'vice_principal_duty', old.vice_principal_id, old.duty_date,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), to_jsonb(new), auth.uid()
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.duty_assignment_history(
      assignment_type, subject_user_id, duty_date,
      effective_start_date, effective_end_date, source,
      previous_record, changed_by
    ) values (
      'vice_principal_duty', old.vice_principal_id, old.duty_date,
      old.duty_date, greatest(old.duty_date, current_date - 1), coalesce(old.assignment_source,'manual'),
      to_jsonb(old), auth.uid()
    );
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_log_vp_duty_history on public.duty_rotation;
create trigger trg_log_vp_duty_history
after insert or update or delete on public.duty_rotation
for each row execute function public.log_vp_duty_history();

-- Current-state tables may be regenerated, but history is append-only evidence.
revoke insert, update, delete on public.duty_assignment_history from authenticated;
