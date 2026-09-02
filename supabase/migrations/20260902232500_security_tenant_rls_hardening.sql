begin;

drop policy if exists security_ops_visitor_people on public.visitor_people;
drop policy if exists security_read_visitor_people on public.visitor_people;
drop policy if exists security_write_visitor_people on public.visitor_people;
create policy security_ops_visitor_people on public.visitor_people for all to authenticated
using (tenant_row_allowed(institution_code) and (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()))
with check (tenant_row_allowed(institution_code) and (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()));

drop policy if exists security_ops_visitor_relations on public.visitor_student_relations;
create policy security_ops_visitor_relations on public.visitor_student_relations for all to authenticated
using (tenant_row_allowed(institution_code) and (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()))
with check (tenant_row_allowed(institution_code) and (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()));

drop policy if exists security_ops_visitor_visits on public.visitor_visits;
drop policy if exists security_read_visitor_visits on public.visitor_visits;
drop policy if exists security_write_visitor_visits on public.visitor_visits;
create policy security_ops_visitor_visits on public.visitor_visits for all to authenticated
using (tenant_row_allowed(institution_code) and (has_permission('security.checkin') or has_permission('security.manage') or has_permission('security.view') or is_manager_or_admin()))
with check (tenant_row_allowed(institution_code) and (has_permission('security.checkin') or has_permission('security.manage') or is_manager_or_admin()));

drop policy if exists security_manage_restrictions on public.visitor_access_restrictions;
drop policy if exists security_read_visitor_access_restrictions on public.visitor_access_restrictions;
drop policy if exists security_write_visitor_access_restrictions on public.visitor_access_restrictions;
create policy security_manage_restrictions on public.visitor_access_restrictions for all to authenticated
using (tenant_row_allowed(institution_code) and (has_permission('security.manage') or is_manager_or_admin()))
with check (tenant_row_allowed(institution_code) and (has_permission('security.manage') or is_manager_or_admin()));

do $$ declare t text; begin
  foreach t in array array['student_duty_settings','student_duty_exemptions','student_duty_assignments','student_duty_generation_state'] loop
    execute format('drop policy if exists security_read_%I on public.%I',t,t);
    execute format('drop policy if exists security_write_%I on public.%I',t,t);
    execute format('drop policy if exists security_view_%I on public.%I',t,t);
    execute format('drop policy if exists security_manage_%I on public.%I',t,t);
    execute format('create policy %I on public.%I for select to authenticated using (tenant_row_allowed(institution_code) and (has_permission(''security.view'') or has_permission(''security.checkin'') or has_permission(''security.student_duty'') or has_permission(''security.manage'') or is_manager_or_admin()))','security_view_'||t,t);
    execute format('create policy %I on public.%I for all to authenticated using (tenant_row_allowed(institution_code) and (has_permission(''security.student_duty'') or has_permission(''security.manage'') or is_manager_or_admin())) with check (tenant_row_allowed(institution_code) and (has_permission(''security.student_duty'') or has_permission(''security.manage'') or is_manager_or_admin()))','security_manage_'||t,t);
  end loop;
end $$;

commit;
