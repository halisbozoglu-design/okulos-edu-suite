-- Stage 1 hardening: defense-in-depth closure for legacy permissive write policies.
-- This migration is intentionally idempotent and forward-only.

-- PostgreSQL permissive RLS policies are OR-combined. Any legacy ALL/UPDATE policy
-- without tenant scope can therefore bypass a newer scoped policy. Remove every
-- known legacy policy again so replay/order differences cannot reopen the boundary.
drop policy if exists "delegated class managers manage classes" on public.school_classes;
drop policy if exists "delegated curriculum managers manage teacher course assignments" on public.teacher_course_assignments;
drop policy if exists "managers manage teacher course assignments" on public.teacher_course_assignments;
drop policy if exists "admins can update all profiles" on public.profiles;
drop policy if exists "admins can read all profiles" on public.profiles;
drop policy if exists "managers can read operational profiles" on public.profiles;
drop policy if exists "delegated operators read operational profiles" on public.profiles;

-- Guardian links must never point at a student from another institution even if an
-- operator accidentally supplies a valid UUID from a different tenant.
create or replace function public.enforce_student_guardian_tenant()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_student_institution text;
begin
  select s.institution_code
    into v_student_institution
  from public.students s
  where s.id = new.student_id;

  if v_student_institution is null then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  if new.institution_code is distinct from v_student_institution then
    raise exception 'GUARDIAN_STUDENT_CROSS_TENANT_BLOCKED';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_student_guardian_tenant on public.student_guardians;
create trigger trg_student_guardian_tenant
before insert or update of institution_code, student_id
on public.student_guardians
for each row execute function public.enforce_student_guardian_tenant();

-- Recreate/normalize the scoped write policies after removing legacy alternatives.
drop policy if exists school_classes_admin_write on public.school_classes;
create policy school_classes_admin_write on public.school_classes
for all to authenticated
using (
  public.is_system_admin()
  or (
    institution_code = public.current_tenant_code()
    and (public.is_institution_admin(institution_code) or public.has_permission('classes.manage'))
  )
)
with check (
  public.is_system_admin()
  or (
    institution_code = public.current_tenant_code()
    and (public.is_institution_admin(institution_code) or public.has_permission('classes.manage'))
  )
);

drop policy if exists teacher_assignments_scoped_write on public.teacher_course_assignments;
create policy teacher_assignments_scoped_write on public.teacher_course_assignments
for all to authenticated
using (
  public.is_system_admin()
  or (
    institution_code = public.current_tenant_code()
    and (public.is_institution_admin(institution_code) or public.has_permission('curriculum.manage'))
  )
)
with check (
  public.is_system_admin()
  or (
    institution_code = public.current_tenant_code()
    and (public.is_institution_admin(institution_code) or public.has_permission('curriculum.manage'))
  )
);

drop policy if exists profiles_scoped_admin_update on public.profiles;
create policy profiles_scoped_admin_update on public.profiles
for update to authenticated
using (
  public.is_system_admin()
  or (
    institution_code = public.current_tenant_code()
    and public.is_institution_admin(institution_code)
  )
)
with check (
  public.is_system_admin()
  or (
    institution_code = public.current_tenant_code()
    and public.is_institution_admin(institution_code)
  )
);
