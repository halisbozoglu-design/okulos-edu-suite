drop policy if exists "teacher can read own crisis" on public.crisis_reports;
create policy "users read authorized crisis reports" on public.crisis_reports
for select to authenticated using(
  teacher_id=auth.uid()
  or public.is_admin()
  or public.has_permission('substitutes.view')
  or public.has_permission('substitutes.manage')
  or public.has_module_operation_permission('duty')
);

drop policy if exists "teacher can read own absence lessons" on public.absence_lessons;
create policy "users read authorized absence lessons" on public.absence_lessons
for select to authenticated using(
  teacher_id=auth.uid()
  or public.is_admin()
  or public.has_permission('substitutes.view')
  or public.has_permission('substitutes.manage')
  or public.has_module_operation_permission('duty')
);

drop policy if exists "assigned teacher can read assignments" on public.substitute_assignments;
create policy "users read authorized substitute assignments" on public.substitute_assignments
for select to authenticated using(
  substitute_user_id=auth.uid()
  or public.is_admin()
  or public.has_permission('substitutes.view')
  or public.has_permission('substitutes.manage')
  or public.has_module_operation_permission('duty')
);

grant select on public.crisis_reports,public.absence_lessons,public.substitute_assignments to authenticated;