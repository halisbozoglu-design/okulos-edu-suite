create or replace function public.payroll_month_is_locked(p_year int, p_month int)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.payroll_day_entries
    where work_date >= make_date(p_year,p_month,1)
      and work_date < make_date(p_year,p_month,1) + interval '1 month'
      and approved = true
  );
$$;

revoke all on function public.payroll_month_is_locked(int,int) from public;
grant execute on function public.payroll_month_is_locked(int,int) to authenticated;

-- Once a month has approved rows, recalculation must be explicitly unlocked by a later controlled workflow.
-- This guard prevents accidental duplicate or changed official payroll after approval.
create or replace function public.prevent_approved_payroll_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.approved then
    raise exception 'APPROVED_PAYROLL_LOCKED';
  end if;
  return old;
end;
$$;

drop trigger if exists trg_prevent_approved_payroll_delete on public.payroll_day_entries;
create trigger trg_prevent_approved_payroll_delete
before delete on public.payroll_day_entries
for each row execute function public.prevent_approved_payroll_delete();
