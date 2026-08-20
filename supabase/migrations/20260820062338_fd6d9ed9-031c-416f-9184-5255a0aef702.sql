create or replace function public.has_module_operation_permission(p_module text)
returns boolean
language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.permission_catalog c
    where c.module_code=p_module and c.active and public.has_permission(c.code)
  );
$$;
revoke all on function public.has_module_operation_permission(text) from public;
grant execute on function public.has_module_operation_permission(text) to authenticated;

create or replace function public.payroll_month_matrix(p_year int,p_month int)
returns table(teacher_id uuid,full_name text,role public.app_role,work_date date,category text,hours numeric,kbs_data_type text,approved boolean)
language plpgsql stable security definer set search_path=public as $$
declare v_code text;
begin
  select c.code into v_code from public.permission_catalog c
  where c.module_code='payroll' and c.active and public.has_permission(c.code)
  order by case c.code when 'payroll.view' then 0 else 1 end,c.sort_order limit 1;
  if v_code is null then raise exception 'PERMISSION_DENIED: payroll.view';end if;
  perform set_config('app.okulos_permission',v_code,true);
  return query select * from public.payroll_month_matrix_permission_core_v2(p_year,p_month);
end;$$;
revoke all on function public.payroll_month_matrix(int,int) from public;
grant execute on function public.payroll_month_matrix(int,int) to authenticated;

create policy "delegated payroll operators read activities" on public.payroll_activity_entries
for select to authenticated using(public.has_module_operation_permission('payroll'));
create policy "delegated duty operators read vice principals" on public.vice_principals
for select to authenticated using(public.has_module_operation_permission('duty'));
create policy "delegated duty operators read rotation" on public.duty_rotation
for select to authenticated using(public.has_module_operation_permission('duty'));
create policy "delegated duty operators read teacher assignments" on public.teacher_duty_assignments
for select to authenticated using(public.has_module_operation_permission('duty'));
create policy "delegated duty operators read locations" on public.duty_locations
for select to authenticated using(public.has_module_operation_permission('duty'));
create policy "delegated duty operators read cycle members" on public.teacher_duty_cycle_members
for select to authenticated using(public.has_module_operation_permission('duty'));
create policy "delegated duty operators read month locks" on public.duty_month_locks
for select to authenticated using(public.has_module_operation_permission('duty'));
create policy "delegated duty operators read day notes" on public.duty_day_notes
for select to authenticated using(public.has_module_operation_permission('duty'));

create policy "delegated operators read operational profiles" on public.profiles
for select to authenticated using(
  user_id=auth.uid()
  or public.has_module_operation_permission('schedule')
  or public.has_module_operation_permission('duty')
  or public.has_module_operation_permission('payroll')
  or public.has_module_operation_permission('substitutes')
  or public.has_module_operation_permission('curriculum')
  or public.has_module_operation_permission('quran')
  or public.has_module_operation_permission('personnel')
  or public.has_module_operation_permission('norm')
);