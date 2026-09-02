-- RLS policies on the timetable core are permissive by default and are OR-combined
-- by PostgreSQL.  A restrictive tenant guard makes tenant isolation mandatory even
-- when a role-specific read or write policy is added later.

drop policy if exists "tenant guard class course requirements" on public.class_course_requirements;
create policy "tenant guard class course requirements" on public.class_course_requirements
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard subgroup students" on public.class_subgroup_students;
create policy "tenant guard subgroup students" on public.class_subgroup_students
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard subgroups" on public.class_subgroups;
create policy "tenant guard subgroups" on public.class_subgroups
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard classrooms" on public.classrooms;
create policy "tenant guard classrooms" on public.classrooms
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard generation settings" on public.schedule_generation_settings;
create policy "tenant guard generation settings" on public.schedule_generation_settings
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard schedule publications" on public.schedule_publications;
create policy "tenant guard schedule publications" on public.schedule_publications
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard schedule sync members" on public.schedule_sync_group_members;
create policy "tenant guard schedule sync members" on public.schedule_sync_group_members
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard schedule sync groups" on public.schedule_sync_groups;
create policy "tenant guard schedule sync groups" on public.schedule_sync_groups
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard schedule time profiles" on public.schedule_time_profiles;
create policy "tenant guard schedule time profiles" on public.schedule_time_profiles
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard teacher course assignments" on public.teacher_course_assignments;
create policy "tenant guard teacher course assignments" on public.teacher_course_assignments
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard teacher duty assignments" on public.teacher_duty_assignments;
create policy "tenant guard teacher duty assignments" on public.teacher_duty_assignments
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard teacher duty cycle members" on public.teacher_duty_cycle_members;
create policy "tenant guard teacher duty cycle members" on public.teacher_duty_cycle_members
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard teacher schedule" on public.teacher_schedule;
create policy "tenant guard teacher schedule" on public.teacher_schedule
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard teacher constraints" on public.teacher_schedule_constraints;
create policy "tenant guard teacher constraints" on public.teacher_schedule_constraints
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard teacher schedule preferences" on public.teacher_schedule_preferences;
create policy "tenant guard teacher schedule preferences" on public.teacher_schedule_preferences
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

drop policy if exists "tenant guard teacher unavailability" on public.teacher_unavailability;
create policy "tenant guard teacher unavailability" on public.teacher_unavailability
as restrictive for all to authenticated
using (public.tenant_row_allowed(institution_code))
with check (public.tenant_row_allowed(institution_code));

-- This singleton has no institution_code and is not consumed directly by the UI.
-- Do not expose cross-tenant engine state through the data API.
drop policy if exists "authenticated read schedule engine state" on public.schedule_engine_state;
revoke select on table public.schedule_engine_state from authenticated, anon;
