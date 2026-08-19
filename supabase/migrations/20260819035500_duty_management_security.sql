grant insert, update, delete on public.vice_principals to authenticated;
grant insert, update, delete on public.duty_rotation to authenticated;
grant insert, update, delete on public.teacher_duty_assignments to authenticated;

create policy "managers manage vice principals"
on public.vice_principals for all to authenticated
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

create policy "managers manage duty rotation"
on public.duty_rotation for all to authenticated
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

create policy "managers manage teacher duty assignments"
on public.teacher_duty_assignments for all to authenticated
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());
