begin;
alter table public.official_curriculum_profiles
  add column if not exists schedule_variant text,
  add column if not exists common_hours smallint,
  add column if not exists vocational_hours smallint,
  add column if not exists elective_vocational_hours smallint,
  add column if not exists elective_hours smallint,
  add column if not exists guidance_hours smallint,
  add column if not exists enterprise_hours smallint,
  add column if not exists applicability_status text not null default 'CURRENTLY_VALID',
  add column if not exists source_page smallint,
  add column if not exists parsed_constraints jsonb not null default '{}'::jsonb;
create index if not exists idx_official_curriculum_profile_context
on public.official_curriculum_profiles(effective_academic_year,school_type,program_type,field_name,branch_name,grade_level,schedule_variant)
where active;
commit;
