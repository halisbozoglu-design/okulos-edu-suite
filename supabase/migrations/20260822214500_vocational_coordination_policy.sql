begin;

alter table public.institutions
  add column if not exists is_metropolitan_district boolean;

create table if not exists public.vocational_program_schedule_policies (
  program_type text primary key check (program_type in ('AMP','ATP','MESEM')),
  regular_year_enterprise_mode text not null check (regular_year_enterprise_mode in ('SOURCE_DRIVEN','NONE','MESEM_MODEL')),
  default_school_days smallint check (default_school_days between 0 and 5),
  default_enterprise_days smallint check (default_enterprise_days between 0 and 5),
  eligible_grades smallint[] not null,
  weekly_hours_from_official_schedule boolean not null default true,
  source_rule text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.vocational_program_schedule_policies
(program_type,regular_year_enterprise_mode,default_school_days,default_enterprise_days,eligible_grades,weekly_hours_from_official_schedule,source_rule)
values
('AMP','SOURCE_DRIVEN',null,null,array[11,12]::smallint[],true,'MEB OOKY Md.121 + applicable MTEGM frame programme: enterprise education is normally grade 12; grade 11 only for approved school/field/branch. Days are derived from official weekly hours.'),
('ATP','NONE',null,0,array[]::smallint[],true,'No regular-year enterprise block is created unless an applicable official programme/protocol explicitly supplies one; summer internship/intensive practice is outside the normal weekly timetable.'),
('MESEM','MESEM_MODEL',1,4,array[9,10,11,12]::smallint[],true,'MEB current MESEM model: 1 day school + 4 days enterprise; enterprise education starts from grade 9 after contract.')
on conflict(program_type) do update set
 regular_year_enterprise_mode=excluded.regular_year_enterprise_mode,
 default_school_days=excluded.default_school_days,
 default_enterprise_days=excluded.default_enterprise_days,
 eligible_grades=excluded.eligible_grades,
 weekly_hours_from_official_schedule=excluded.weekly_hours_from_official_schedule,
 source_rule=excluded.source_rule,
 active=true,
 updated_at=now();

alter table public.vocational_coordination_plans
  add column if not exists education_unit_id uuid references public.institution_education_units(id) on delete cascade,
  add column if not exists program_type text,
  add column if not exists grade_level smallint,
  add column if not exists source_requirement_id uuid references public.class_course_requirements(id) on delete set null,
  add column if not exists enterprise_weekly_hours smallint check (enterprise_weekly_hours is null or enterprise_weekly_hours>=0),
  add column if not exists enterprise_days_per_week smallint generated always as (
    case when enterprise_weekly_hours is null then null else ((enterprise_weekly_hours + 7) / 8)::smallint end
  ) stored,
  add column if not exists is_metropolitan_district boolean,
  add column if not exists daily_coordination_max_hours smallint not null default 8 check (daily_coordination_max_hours between 1 and 8),
  add column if not exists source_rule text;

alter table public.vocational_coordination_plans
  drop constraint if exists vocational_coordination_plans_program_type_check;
alter table public.vocational_coordination_plans
  add constraint vocational_coordination_plans_program_type_check
  check (program_type is null or program_type in ('AMP','ATP','MESEM'));

create or replace function public.vocational_coordination_weekly_cap(p_program_type text,p_is_metropolitan boolean)
returns smallint language sql immutable as $$
  select case
    when p_program_type is null or p_is_metropolitan is null then null::smallint
    when upper(p_program_type)='MESEM' and p_is_metropolitan then 24::smallint
    when upper(p_program_type)='MESEM' then 18::smallint
    when p_is_metropolitan then 20::smallint
    else 16::smallint
  end
$$;

create or replace function public.vocational_enterprise_days_from_hours(p_weekly_hours integer)
returns smallint language sql immutable as $$
  select case when p_weekly_hours is null then null::smallint when p_weekly_hours<=0 then 0::smallint else ((p_weekly_hours+7)/8)::smallint end
$$;

create or replace function public.vocational_coordination_program_applicable(
  p_program_type text,
  p_grade smallint,
  p_has_official_enterprise_course boolean,
  p_grade11_approved boolean default false
) returns boolean language sql immutable as $$
  select case upper(coalesce(p_program_type,''))
    when 'MESEM' then p_grade between 9 and 12 and coalesce(p_has_official_enterprise_course,true)
    when 'AMP' then coalesce(p_has_official_enterprise_course,false) and (p_grade=12 or (p_grade=11 and coalesce(p_grade11_approved,false)))
    when 'ATP' then coalesce(p_has_official_enterprise_course,false)
    else false
  end
$$;

create index if not exists idx_coord_plan_context
on public.vocational_coordination_plans(institution_code,education_unit_id,program_type,grade_level,field_id)
where active;

commit;
