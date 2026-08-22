begin;
alter table public.official_course_schedule_catalog add column if not exists schedule_variant text not null default 'STANDARD';
alter table public.official_course_schedule_catalog drop constraint if exists official_course_schedule_cata_effective_academic_year_schoo_key;
create unique index if not exists uq_official_course_schedule_full_context on public.official_course_schedule_catalog(
 effective_academic_year,school_type,coalesce(school_subtype,''),coalesce(program_type,''),coalesce(field_name,''),coalesce(branch_name,''),grade_level,course_id,coalesce(schedule_variant,'STANDARD')
);
drop view if exists public.official_course_schedule_effective;
create view public.official_course_schedule_effective as
select c.id,c.effective_academic_year,c.school_type,coalesce(o.school_subtype,c.school_subtype) school_subtype,
coalesce(o.program_type,c.program_type) program_type,coalesce(o.field_name,c.field_name) field_name,coalesce(o.branch_name,c.branch_name) branch_name,
coalesce(o.grade_level,c.grade_level) grade_level,c.course_id,coalesce(o.category,c.category) category,coalesce(o.hour_options,c.hour_options) hour_options,
coalesce(o.max_selections,c.max_selections) max_selections,coalesce(o.repeat_across_years,c.repeat_across_years) repeat_across_years,
coalesce(o.elective_group_key,c.elective_group_key) elective_group_key,c.source_file_name,coalesce(o.source_note,c.source_note) source_note,
coalesce(o.parsed_constraints,c.parsed_constraints) parsed_constraints,c.source_decision_no,c.source_decision_date,c.source_page,c.source_section,
c.parser_confidence,c.needs_review,c.schedule_variant,(o.id is not null and o.active) manually_overridden,c.active
from public.official_course_schedule_catalog c left join public.official_course_schedule_overrides o on o.catalog_id=c.id and o.active where c.active;
commit;
