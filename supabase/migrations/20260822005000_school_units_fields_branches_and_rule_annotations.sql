-- Multi-school-unit + field/branch + parsed official-rule layer.
create table if not exists public.institution_education_units(
 id uuid primary key default gen_random_uuid(),
 institution_code text not null,
 academic_year_id uuid references public.academic_years(id) on delete cascade,
 school_type text not null,
 program_type text,
 education_mode text not null default 'single' check(education_mode in('single','double')),
 session_scope text not null default 'full_day' check(session_scope in('full_day','morning','afternoon')),
 active boolean not null default true,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(institution_code,academic_year_id,school_type,program_type,education_mode,session_scope)
);
create table if not exists public.institution_fields(
 id uuid primary key default gen_random_uuid(),unit_id uuid not null references public.institution_education_units(id) on delete cascade,
 code text,name text not null,active boolean not null default true,created_at timestamptz not null default now(),
 unique(unit_id,name)
);
create table if not exists public.institution_branches(
 id uuid primary key default gen_random_uuid(),field_id uuid not null references public.institution_fields(id) on delete cascade,
 code text,name text not null,active boolean not null default true,created_at timestamptz not null default now(),
 unique(field_id,name)
);
alter table public.school_classes add column if not exists education_unit_id uuid references public.institution_education_units(id) on delete set null;
alter table public.school_classes add column if not exists field_id uuid references public.institution_fields(id) on delete set null;
alter table public.school_classes add column if not exists branch_id uuid references public.institution_branches(id) on delete set null;
alter table public.schedule_time_profiles add column if not exists education_mode text not null default 'single' check(education_mode in('single','double'));
alter table public.schedule_time_profiles add column if not exists session_scope text not null default 'full_day' check(session_scope in('full_day','morning','afternoon'));
alter table public.official_course_schedule_catalog add column if not exists field_name text;
alter table public.official_course_schedule_catalog add column if not exists branch_name text;
alter table public.official_course_schedule_catalog add column if not exists parsed_constraints jsonb not null default '[]'::jsonb;
alter table public.course_offering_rules add column if not exists field_name text;
alter table public.course_offering_rules add column if not exists branch_name text;
alter table public.course_offering_rules add column if not exists parsed_constraints jsonb not null default '[]'::jsonb;
create table if not exists public.official_course_rule_annotations(
 id uuid primary key default gen_random_uuid(),catalog_id uuid references public.official_course_schedule_catalog(id) on delete cascade,
 rule_code text not null,rule_type text not null,severity text not null default 'hard' check(severity in('hard','soft','info')),
 parameters jsonb not null default '{}'::jsonb,source_text text not null,source_ref text,active boolean not null default true,
 created_at timestamptz not null default now(),unique(catalog_id,rule_code,source_text)
);
create index if not exists idx_education_units_tenant_year on public.institution_education_units(institution_code,academic_year_id) where active;
create index if not exists idx_official_rule_annotations_catalog on public.official_course_rule_annotations(catalog_id) where active;
alter table public.institution_education_units enable row level security;
alter table public.institution_fields enable row level security;
alter table public.institution_branches enable row level security;
alter table public.official_course_rule_annotations enable row level security;
drop policy if exists institution_education_units_tenant on public.institution_education_units;create policy institution_education_units_tenant on public.institution_education_units for all to authenticated using(public.tenant_row_allowed(institution_code) or public.is_super_admin()) with check(public.tenant_row_allowed(institution_code) or public.is_super_admin());
drop policy if exists institution_fields_tenant on public.institution_fields;create policy institution_fields_tenant on public.institution_fields for all to authenticated using(exists(select 1 from public.institution_education_units u where u.id=unit_id and (public.tenant_row_allowed(u.institution_code) or public.is_super_admin()))) with check(exists(select 1 from public.institution_education_units u where u.id=unit_id and (public.tenant_row_allowed(u.institution_code) or public.is_super_admin())));
drop policy if exists institution_branches_tenant on public.institution_branches;create policy institution_branches_tenant on public.institution_branches for all to authenticated using(exists(select 1 from public.institution_fields f join public.institution_education_units u on u.id=f.unit_id where f.id=field_id and (public.tenant_row_allowed(u.institution_code) or public.is_super_admin()))) with check(exists(select 1 from public.institution_fields f join public.institution_education_units u on u.id=f.unit_id where f.id=field_id and (public.tenant_row_allowed(u.institution_code) or public.is_super_admin())));
drop policy if exists official_course_rule_annotations_read on public.official_course_rule_annotations;create policy official_course_rule_annotations_read on public.official_course_rule_annotations for select to authenticated using(true);
drop policy if exists official_course_rule_annotations_super on public.official_course_rule_annotations;create policy official_course_rule_annotations_super on public.official_course_rule_annotations for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());