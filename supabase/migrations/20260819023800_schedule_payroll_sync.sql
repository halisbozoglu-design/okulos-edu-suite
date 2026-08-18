create table if not exists public.payroll_dirty_periods (
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  reason text not null,
  marked_at timestamptz not null default now(),
  primary key (teacher_id, year, month)
);

alter table public.payroll_dirty_periods enable row level security;
grant select on public.payroll_dirty_periods to authenticated;

create policy "managers read dirty payroll periods"
on public.payroll_dirty_periods for select to authenticated
using (public.is_manager_or_admin());

create or replace function public.mark_payroll_dirty_from_schedule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := coalesce(new.teacher_id, old.teacher_id);
  v_today date := current_date;
  v_next date := (current_date + interval '1 month')::date;
begin
  insert into public.payroll_dirty_periods(teacher_id, year, month, reason, marked_at)
  values (v_teacher, extract(year from v_today)::int, extract(month from v_today)::int, 'Ders programı değişti', now())
  on conflict (teacher_id, year, month)
  do update set reason = excluded.reason, marked_at = now();

  insert into public.payroll_dirty_periods(teacher_id, year, month, reason, marked_at)
  values (v_teacher, extract(year from v_next)::int, extract(month from v_next)::int, 'Ders programı değişti', now())
  on conflict (teacher_id, year, month)
  do update set reason = excluded.reason, marked_at = now();

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_schedule_marks_payroll_dirty on public.teacher_schedule;
create trigger trg_schedule_marks_payroll_dirty
after insert or update or delete on public.teacher_schedule
for each row execute function public.mark_payroll_dirty_from_schedule();

create or replace function public.clear_payroll_dirty_after_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'calculated' then
    delete from public.payroll_dirty_periods
    where year = extract(year from new.period_start)::int
      and month = extract(month from new.period_start)::int;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clear_payroll_dirty_after_recalc on public.payroll_calculation_runs;
create trigger trg_clear_payroll_dirty_after_recalc
after insert on public.payroll_calculation_runs
for each row execute function public.clear_payroll_dirty_after_recalc();
