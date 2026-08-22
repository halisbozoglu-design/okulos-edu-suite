begin;

drop index if exists public.uq_school_classes_tenant_year_name_program;
create unique index if not exists uq_school_classes_full_context
on public.school_classes (
  institution_code, academic_year_id,
  coalesce(education_unit_id,'00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(school_type,''), coalesce(school_subtype,''), coalesce(program_type,''),
  coalesce(field_id,'00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(branch_id,'00000000-0000-0000-0000-000000000000'::uuid),
  grade_level, section
) where academic_year_id is not null and grade_level is not null and section is not null;

alter table public.classrooms add column if not exists field_id uuid references public.institution_fields(id) on delete set null;
alter table public.classrooms add column if not exists branch_id uuid references public.institution_branches(id) on delete set null;
alter table public.classrooms add column if not exists is_vocational_workshop boolean not null default false;
create index if not exists idx_classrooms_field_branch on public.classrooms(institution_code,field_id,branch_id) where is_vocational_workshop;

create table if not exists public.vocational_course_group_plans (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  requirement_id uuid not null references public.class_course_requirements(id) on delete cascade,
  student_count smallint not null check(student_count>=0),
  special_needs_student_count smallint not null default 0 check(special_needs_student_count>=0),
  suggested_group_count smallint not null check(suggested_group_count between 0 and 5),
  applied_group_count smallint not null check(applied_group_count between 0 and 5),
  groupable boolean not null default true,
  override_reason text,
  source_rule text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique(requirement_id),
  check(applied_group_count=suggested_group_count or nullif(btrim(override_reason),'') is not null)
);
create index if not exists idx_voc_group_plan_tenant on public.vocational_course_group_plans(institution_code);
alter table public.vocational_course_group_plans enable row level security;
drop policy if exists tenant_boundary_voc_group_plans on public.vocational_course_group_plans;
create policy tenant_boundary_voc_group_plans on public.vocational_course_group_plans for all using(public.tenant_row_allowed(institution_code)) with check(public.tenant_row_allowed(institution_code));
drop policy if exists managers_manage_voc_group_plans on public.vocational_course_group_plans;
create policy managers_manage_voc_group_plans on public.vocational_course_group_plans for all using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.vocational_suggest_group_count(p_grade smallint,p_students integer,p_special integer default 0)
returns smallint language plpgsql immutable as $$
declare b int:=0; q int; r int; split_n int:=0;
begin
  if p_grade=9 then
    b:=case when p_students<10 then 0 when p_students<=21 then 1 when p_students<=31 then 2 else 3 end;
  elsif p_grade between 10 and 12 then
    b:=case when p_students<8 then 0 when p_students<=17 then 1 when p_students<=25 then 2 when p_students<33 then 3 else 4 end;
  else return 0; end if;
  if b=0 or coalesce(p_special,0)<2 then return b::smallint; end if;
  q:=p_special/b; r:=p_special%b;
  if q>=2 then split_n:=b; elsif q=1 then split_n:=r; end if;
  return least(5,b+split_n)::smallint;
end $$;

create table if not exists public.vocational_lead_assignments (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  field_id uuid not null references public.institution_fields(id) on delete cascade,
  duty_type text not null check(duty_type in ('FIELD_LEAD','WORKSHOP_LEAD')),
  workshop_id uuid references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  weekly_hours smallint not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  check((duty_type='FIELD_LEAD' and workshop_id is null and weekly_hours=10) or (duty_type='WORKSHOP_LEAD' and workshop_id is not null and weekly_hours=6))
);
create unique index if not exists uq_one_field_lead on public.vocational_lead_assignments(institution_code,field_id) where active and duty_type='FIELD_LEAD';
create unique index if not exists uq_one_workshop_lead on public.vocational_lead_assignments(institution_code,workshop_id) where active and duty_type='WORKSHOP_LEAD';
create index if not exists idx_voc_leads_teacher on public.vocational_lead_assignments(institution_code,teacher_id) where active;
alter table public.vocational_lead_assignments enable row level security;
drop policy if exists tenant_boundary_voc_leads on public.vocational_lead_assignments;
create policy tenant_boundary_voc_leads on public.vocational_lead_assignments for all using(public.tenant_row_allowed(institution_code)) with check(public.tenant_row_allowed(institution_code));
drop policy if exists managers_manage_voc_leads on public.vocational_lead_assignments;
create policy managers_manage_voc_leads on public.vocational_lead_assignments for all using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.validate_vocational_lead_assignment()
returns trigger language plpgsql as $$
declare isw boolean;
begin
 if new.duty_type='WORKSHOP_LEAD' then
   select is_vocational_workshop into isw from public.classrooms where id=new.workshop_id and institution_code=new.institution_code;
   if not coalesce(isw,false) then raise exception 'WORKSHOP_LEAD_REQUIRES_VOCATIONAL_WORKSHOP'; end if;
 end if;
 if exists(select 1 from public.vocational_lead_assignments x where x.institution_code=new.institution_code and x.teacher_id=new.teacher_id and x.active and x.id<>new.id and x.duty_type<>new.duty_type) then
   raise exception 'FIELD_AND_WORKSHOP_LEAD_CANNOT_BE_SAME_TEACHER';
 end if;
 return new;
end $$;
drop trigger if exists trg_validate_vocational_lead on public.vocational_lead_assignments;
create trigger trg_validate_vocational_lead before insert or update on public.vocational_lead_assignments for each row execute function public.validate_vocational_lead_assignment();

create table if not exists public.teacher_flexible_schedule_duties (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  duty_type text not null check(duty_type in ('COORDINATION','FIELD_LEAD','WORKSHOP_LEAD')),
  source_id uuid,
  total_hours smallint not null check(total_hours>0),
  min_block_hours smallint not null default 1 check(min_block_hours>=1),
  movable boolean not null default true,
  placement_phase text not null check(placement_phase in ('EARLY_INTEGRATED','AFTER_FACE_TO_FACE_FILL_GAPS')),
  placement_strategy text not null default 'MINIMIZE_TEACHER_WINDOWS',
  locked boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists idx_flex_duty_teacher on public.teacher_flexible_schedule_duties(institution_code,teacher_id) where active;
alter table public.teacher_flexible_schedule_duties enable row level security;
drop policy if exists tenant_boundary_flex_duties on public.teacher_flexible_schedule_duties;
create policy tenant_boundary_flex_duties on public.teacher_flexible_schedule_duties for all using(public.tenant_row_allowed(institution_code)) with check(public.tenant_row_allowed(institution_code));
drop policy if exists managers_manage_flex_duties on public.teacher_flexible_schedule_duties;
create policy managers_manage_flex_duties on public.teacher_flexible_schedule_duties for all using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create table if not exists public.vocational_coordination_plans (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  field_id uuid not null references public.institution_fields(id) on delete cascade,
  academic_year_id uuid,
  total_hours integer not null check(total_hours>=0),
  eligible_teacher_count smallint not null check(eligible_teacher_count>0),
  low_target smallint generated always as ((total_hours/eligible_teacher_count)::smallint) stored,
  high_target smallint generated always as (((total_hours+eligible_teacher_count-1)/eligible_teacher_count)::smallint) stored,
  high_target_teacher_count smallint generated always as ((total_hours%eligible_teacher_count)::smallint) stored,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists idx_coord_plan_tenant on public.vocational_coordination_plans(institution_code,field_id) where active;
alter table public.vocational_coordination_plans enable row level security;
drop policy if exists tenant_boundary_coord_plans on public.vocational_coordination_plans;
create policy tenant_boundary_coord_plans on public.vocational_coordination_plans for all using(public.tenant_row_allowed(institution_code)) with check(public.tenant_row_allowed(institution_code));
drop policy if exists managers_manage_coord_plans on public.vocational_coordination_plans;
create policy managers_manage_coord_plans on public.vocational_coordination_plans for all using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

commit;
