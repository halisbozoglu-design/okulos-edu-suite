create policy "delegated settings managers manage academic years" on public.academic_years
for all to authenticated using(public.has_permission('settings.manage')) with check(public.has_permission('settings.manage'));
create policy "delegated settings managers manage calendar events" on public.school_calendar_events
for all to authenticated using(public.has_permission('settings.manage')) with check(public.has_permission('settings.manage'));

alter function public.set_active_academic_year(uuid) rename to set_active_academic_year_permission_core_v2;
create or replace function public.set_active_academic_year(p_academic_year_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('settings.manage');
  return public.set_active_academic_year_permission_core_v2(p_academic_year_id);
end;$$;
revoke all on function public.set_active_academic_year(uuid) from public;
grant execute on function public.set_active_academic_year(uuid) to authenticated;

create policy "delegated duty managers manage tardiness" on public.duty_tardiness_logs
for all to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));
create policy "delegated duty managers manage incidents" on public.duty_incident_logs
for update to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));
create policy "delegated duty managers delete incidents" on public.duty_incident_logs
for delete to authenticated using(public.has_permission('duty.manage'));

create policy "delegated duty users read absences" on public.absences
for select to authenticated using(public.has_module_operation_permission('duty'));
create policy "delegated duty users read tardiness" on public.duty_tardiness_logs
for select to authenticated using(public.has_module_operation_permission('duty'));

alter function public.get_daily_duty_book(date) rename to get_daily_duty_book_permission_core_v2;
create or replace function public.get_daily_duty_book(p_date date)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_code text;
begin
  select c.code into v_code from public.permission_catalog c
  where c.module_code='duty' and c.active and public.has_permission(c.code)
  order by case c.code when 'duty.view' then 0 else 1 end,c.sort_order limit 1;
  if v_code is null then raise exception 'PERMISSION_DENIED: duty.view';end if;
  perform set_config('app.okulos_permission',v_code,true);
  return public.get_daily_duty_book_permission_core_v2(p_date);
end;$$;
revoke all on function public.get_daily_duty_book(date) from public;
grant execute on function public.get_daily_duty_book(date) to authenticated;