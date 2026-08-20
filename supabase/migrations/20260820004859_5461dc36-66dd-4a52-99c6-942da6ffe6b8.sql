-- Secure delegated-permission gateway.
create or replace function public.current_permission_context()
returns text
language sql stable security definer set search_path=public as $$
  select nullif(current_setting('app.okulos_permission',true),'');
$$;

create or replace function public.open_permission_context(p_code text)
returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_permission(p_code) then raise exception 'PERMISSION_DENIED: %',p_code;end if;
  perform set_config('app.okulos_permission',p_code,true);
end;
$$;
revoke all on function public.open_permission_context(text) from public;

create or replace function public.is_manager_or_admin()
returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_super_admin()
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin')
    or exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='manager' and p.permission_mode='role')
    or (
      public.current_permission_context() is not null
      and public.has_permission(public.current_permission_context())
    );
$$;
revoke all on function public.is_manager_or_admin() from public;
grant execute on function public.is_manager_or_admin() to authenticated;

-- ===================== TIMETABLE RPC GATEWAYS =====================
alter function public.generate_schedule_scenarios_v2() rename to generate_schedule_scenarios_permission_core_v2;
create or replace function public.generate_schedule_scenarios_v2()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.generate');
  return query select * from public.generate_schedule_scenarios_permission_core_v2();
end;$$;

alter function public.apply_schedule_scenario(uuid) rename to apply_schedule_scenario_permission_core_v2;
create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.apply');
  return public.apply_schedule_scenario_permission_core_v2(p_scenario_id);
end;$$;

alter function public.repair_schedule_scenario_v2(uuid) rename to repair_schedule_scenario_permission_core_v2;
create or replace function public.repair_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.generate');
  return public.repair_schedule_scenario_permission_core_v2(p_scenario_id);
end;$$;

alter function public.rescore_schedule_scenario_v2(uuid) rename to rescore_schedule_scenario_permission_core_v2;
create or replace function public.rescore_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.generate');
  return public.rescore_schedule_scenario_permission_core_v2(p_scenario_id);
end;$$;

alter function public.assign_classrooms_to_scenario(uuid) rename to assign_classrooms_to_scenario_permission_core_v2;
create or replace function public.assign_classrooms_to_scenario(p_scenario_id uuid)
returns table(assigned_count integer,unassigned_count integer)
language plpgsql security definer set search_path=public as $$
begin
  if not(public.has_permission('schedule.generate') or public.has_permission('classrooms.manage')) then
    raise exception 'PERMISSION_DENIED: schedule.generate/classrooms.manage';
  end if;
  perform set_config('app.okulos_permission',case when public.has_permission('schedule.generate') then 'schedule.generate' else 'classrooms.manage' end,true);
  return query select * from public.assign_classrooms_to_scenario_permission_core_v2(p_scenario_id);
end;$$;

alter function public.upsert_schedule_slot_v2(uuid,smallint,smallint,uuid,uuid,uuid,boolean,text)
rename to upsert_schedule_slot_permission_core_v2;
create or replace function public.upsert_schedule_slot_v2(
  p_teacher_assignment_id uuid,p_weekday smallint,p_period smallint,p_classroom_id uuid default null,
  p_subgroup_id uuid default null,p_schedule_id uuid default null,p_locked boolean default false,p_source_kind text default 'manual'
)
returns uuid language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.edit');
  return public.upsert_schedule_slot_permission_core_v2(p_teacher_assignment_id,p_weekday,p_period,p_classroom_id,p_subgroup_id,p_schedule_id,p_locked,p_source_kind);
end;$$;

alter function public.publish_current_schedule(date,text,text,text) rename to publish_current_schedule_permission_core_v2;
create or replace function public.publish_current_schedule(
  p_effective_from date,p_academic_year text default null,p_title text default 'Haftalık Ders Programı',p_note text default null
)
returns uuid language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.publish');
  return public.publish_current_schedule_permission_core_v2(p_effective_from,p_academic_year,p_title,p_note);
end;$$;

-- ===================== DUTY RPC GATEWAYS =====================
alter function public.generate_monthly_vp_rotation(date,uuid[],boolean) rename to generate_monthly_vp_rotation_permission_core_v2;
create or replace function public.generate_monthly_vp_rotation(p_month date,p_vice_principal_ids uuid[],p_overwrite boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('duty.generate');
  return public.generate_monthly_vp_rotation_permission_core_v2(p_month,p_vice_principal_ids,p_overwrite);
end;$$;

alter function public.generate_monthly_teacher_duties(date,boolean) rename to generate_monthly_teacher_duties_permission_core_v2;
create or replace function public.generate_monthly_teacher_duties(p_month date,p_overwrite boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('duty.generate');
  return public.generate_monthly_teacher_duties_permission_core_v2(p_month,p_overwrite);
end;$$;

alter function public.set_duty_month_lock(date,boolean) rename to set_duty_month_lock_permission_core_v2;
create or replace function public.set_duty_month_lock(p_month date,p_locked boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('duty.lock');
  perform public.set_duty_month_lock_permission_core_v2(p_month,p_locked);
end;$$;

-- ===================== PAYROLL RPC GATEWAYS =====================
alter function public.payroll_month_matrix(int,int) rename to payroll_month_matrix_permission_core_v2;
create or replace function public.payroll_month_matrix(p_year int,p_month int)
returns table(teacher_id uuid,full_name text,role public.app_role,work_date date,category text,hours numeric,kbs_data_type text,approved boolean)
language plpgsql stable security definer set search_path=public as $$
begin
  perform public.open_permission_context('payroll.view');
  return query select * from public.payroll_month_matrix_permission_core_v2(p_year,p_month);
end;$$;

alter function public.recalculate_payroll_month_v2(int,int) rename to recalculate_payroll_month_permission_core_v2;
create or replace function public.recalculate_payroll_month_v2(p_year int,p_month int)
returns uuid language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('payroll.calculate');
  return public.recalculate_payroll_month_permission_core_v2(p_year,p_month);
end;$$;

alter function public.approve_payroll_month(int,int) rename to approve_payroll_month_permission_core_v2;
create or replace function public.approve_payroll_month(p_year int,p_month int)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('payroll.approve');
  return public.approve_payroll_month_permission_core_v2(p_year,p_month);
end;$$;

alter function public.approve_payroll_activity(uuid,boolean) rename to approve_payroll_activity_permission_core_v2;
create or replace function public.approve_payroll_activity(p_activity_id uuid,p_approve boolean default true)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('payroll.approve');
  return public.approve_payroll_activity_permission_core_v2(p_activity_id,p_approve);
end;$$;

alter function public.kbs_payroll_export(int,int) rename to kbs_payroll_export_permission_core_v2;
create or replace function public.kbs_payroll_export(p_year int,p_month int)
returns table(tckn text,full_name text,data_type text,hours numeric,explanation text)
language plpgsql stable security definer set search_path=public as $$
begin
  perform public.open_permission_context('payroll.publish');
  return query select * from public.kbs_payroll_export_permission_core_v2(p_year,p_month);
end;$$;

-- ===================== DIRECT TABLE WRITE POLICIES =====================
create policy "delegated schedule editors write timetable" on public.teacher_schedule
for all to authenticated using(public.has_permission('schedule.edit')) with check(public.has_permission('schedule.edit'));

create policy "delegated schedule rules manage time profiles" on public.schedule_time_profiles
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "delegated schedule rules manage teacher constraints" on public.teacher_schedule_constraints
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "delegated schedule rules manage unavailability" on public.teacher_unavailability
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "delegated schedule rules manage preferences" on public.teacher_schedule_preferences
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "delegated schedule rules manage course rules" on public.course_schedule_rules
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "delegated schedule rules manage sync groups" on public.schedule_sync_groups
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "delegated schedule rules manage sync members" on public.schedule_sync_group_members
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));
create policy "delegated schedule rules manage scoped overrides" on public.schedule_rule_overrides
for all to authenticated using(public.has_permission('schedule.rules')) with check(public.has_permission('schedule.rules'));

create policy "delegated duty managers manage vice principals" on public.vice_principals
for all to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));
create policy "delegated duty managers manage rotation" on public.duty_rotation
for all to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));
create policy "delegated duty managers manage teacher assignments" on public.teacher_duty_assignments
for all to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));
create policy "delegated duty managers manage locations" on public.duty_locations
for all to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));
create policy "delegated duty managers manage cycle members" on public.teacher_duty_cycle_members
for all to authenticated using(public.has_permission('duty.manage')) with check(public.has_permission('duty.manage'));

create policy "delegated payroll editors manage activities" on public.payroll_activity_entries
for all to authenticated using(public.has_permission('payroll.edit')) with check(public.has_permission('payroll.edit'));
create policy "delegated payroll rule editors manage rules" on public.payroll_rule_registry
for all to authenticated using(public.has_permission('payroll.edit')) with check(public.has_permission('payroll.edit'));

revoke all on function public.generate_schedule_scenarios_v2(),public.apply_schedule_scenario(uuid),public.repair_schedule_scenario_v2(uuid),public.rescore_schedule_scenario_v2(uuid),public.assign_classrooms_to_scenario(uuid),public.upsert_schedule_slot_v2(uuid,smallint,smallint,uuid,uuid,uuid,boolean,text),public.publish_current_schedule(date,text,text,text) from public;
grant execute on function public.generate_schedule_scenarios_v2(),public.apply_schedule_scenario(uuid),public.repair_schedule_scenario_v2(uuid),public.rescore_schedule_scenario_v2(uuid),public.assign_classrooms_to_scenario(uuid),public.upsert_schedule_slot_v2(uuid,smallint,smallint,uuid,uuid,uuid,boolean,text),public.publish_current_schedule(date,text,text,text) to authenticated;
revoke all on function public.generate_monthly_vp_rotation(date,uuid[],boolean),public.generate_monthly_teacher_duties(date,boolean),public.set_duty_month_lock(date,boolean) from public;
grant execute on function public.generate_monthly_vp_rotation(date,uuid[],boolean),public.generate_monthly_teacher_duties(date,boolean),public.set_duty_month_lock(date,boolean) to authenticated;
revoke all on function public.payroll_month_matrix(int,int),public.recalculate_payroll_month_v2(int,int),public.approve_payroll_month(int,int),public.approve_payroll_activity(uuid,boolean),public.kbs_payroll_export(int,int) from public;
grant execute on function public.payroll_month_matrix(int,int),public.recalculate_payroll_month_v2(int,int),public.approve_payroll_month(int,int),public.approve_payroll_activity(uuid,boolean),public.kbs_payroll_export(int,int) to authenticated;