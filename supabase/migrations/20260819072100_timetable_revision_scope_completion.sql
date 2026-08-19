-- Complete the dependency set that invalidates generated timetable scenarios.
-- A scenario must be regenerated whenever any source that affects validity or ranking changes.

do $$
declare
  t text;
begin
  foreach t in array array[
    'schedule_generation_settings',
    'school_classes',
    'course_catalog',
    'class_subgroups',
    'quran_split_plans',
    'area_course_permissions',
    'teaching_areas'
  ] loop
    if to_regclass('public.'||t) is not null then
      execute format('drop trigger if exists trg_schedule_revision_%I on public.%I',t,t);
      execute format(
        'create trigger trg_schedule_revision_%I after insert or update or delete on public.%I for each statement execute function public.bump_schedule_engine_revision()',
        t,t
      );
    end if;
  end loop;
end;
$$;

-- Only the teacher area assignment affects timetable TTKB permission; name/profile edits should not stale scenarios.
drop trigger if exists trg_schedule_revision_profile_teaching_area on public.profiles;
create trigger trg_schedule_revision_profile_teaching_area
after update of teaching_area_id on public.profiles
for each statement execute function public.bump_schedule_engine_revision();
