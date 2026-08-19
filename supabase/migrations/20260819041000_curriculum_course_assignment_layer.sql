-- OkulOS curriculum -> class course load -> teacher assignment layer.
-- This is intentionally separate from teacher_schedule: WHAT/WHO comes before WHEN/WHERE.

create table if not exists public.course_catalog (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  short_name text,
  category text not null default 'zorunlu' check (category in ('zorunlu','secmeli','rehberlik','uygulama','diger')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name)
);

alter table public.school_classes
  add column if not exists expected_weekly_hours smallint,
  add column if not exists curriculum_status text not null default 'draft'
    check (curriculum_status in ('draft','complete','overflow'));

create table if not exists public.curriculum_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_level text,
  grade_level smallint,
  program_type text,
  academic_year text,
  expected_weekly_hours smallint,
  source_note text,
  active boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.curriculum_template_courses (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.curriculum_templates(id) on delete cascade,
  course_id uuid not null references public.course_catalog(id) on delete restrict,
  weekly_hours smallint not null check (weekly_hours > 0 and weekly_hours <= 20),
  category text not null default 'zorunlu' check (category in ('zorunlu','secmeli','rehberlik','uygulama','diger')),
  sort_order smallint not null default 0,
  unique(template_id, course_id)
);

create table if not exists public.class_course_requirements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.school_classes(id) on delete cascade,
  course_id uuid not null references public.course_catalog(id) on delete restrict,
  weekly_hours smallint not null check (weekly_hours > 0 and weekly_hours <= 20),
  category text not null default 'zorunlu' check (category in ('zorunlu','secmeli','rehberlik','uygulama','diger')),
  source_template_id uuid references public.curriculum_templates(id) on delete set null,
  locked boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(class_id, course_id)
);

create table if not exists public.teacher_course_assignments (
  id uuid primary key default gen_random_uuid(),
  class_course_requirement_id uuid not null references public.class_course_requirements(id) on delete cascade,
  teacher_id uuid not null references public.profiles(user_id) on delete restrict,
  assigned_hours smallint not null check (assigned_hours > 0 and assigned_hours <= 20),
  assignment_group text not null default 'main',
  note text,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(class_course_requirement_id, teacher_id, assignment_group)
);

create index if not exists idx_class_course_requirements_class on public.class_course_requirements(class_id);
create index if not exists idx_teacher_course_assignments_teacher on public.teacher_course_assignments(teacher_id);

alter table public.course_catalog enable row level security;
alter table public.curriculum_templates enable row level security;
alter table public.curriculum_template_courses enable row level security;
alter table public.class_course_requirements enable row level security;
alter table public.teacher_course_assignments enable row level security;

grant select on public.course_catalog, public.curriculum_templates, public.curriculum_template_courses,
  public.class_course_requirements, public.teacher_course_assignments to authenticated;

grant insert, update, delete on public.course_catalog, public.curriculum_templates, public.curriculum_template_courses,
  public.class_course_requirements, public.teacher_course_assignments to authenticated;

create policy "authenticated read course catalog" on public.course_catalog for select to authenticated using (true);
create policy "authenticated read curriculum templates" on public.curriculum_templates for select to authenticated using (true);
create policy "authenticated read curriculum template courses" on public.curriculum_template_courses for select to authenticated using (true);
create policy "authenticated read class course requirements" on public.class_course_requirements for select to authenticated using (true);
create policy "authenticated read teacher course assignments" on public.teacher_course_assignments for select to authenticated using (true);

create policy "managers manage course catalog" on public.course_catalog for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers manage curriculum templates" on public.curriculum_templates for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers manage curriculum template courses" on public.curriculum_template_courses for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers manage class course requirements" on public.class_course_requirements for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers manage teacher course assignments" on public.teacher_course_assignments for all to authenticated
using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());

create or replace function public.refresh_class_curriculum_status(p_class_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected integer;
  v_total integer;
  v_status text;
begin
  select expected_weekly_hours into v_expected from public.school_classes where id=p_class_id;
  select coalesce(sum(weekly_hours),0)::integer into v_total from public.class_course_requirements where class_id=p_class_id;
  v_status := case
    when v_expected is null then 'draft'
    when v_total < v_expected then 'draft'
    when v_total = v_expected then 'complete'
    else 'overflow'
  end;
  update public.school_classes set curriculum_status=v_status, updated_at=now() where id=p_class_id;
  return v_status;
end;
$$;

create or replace function public.apply_curriculum_template(p_template_id uuid, p_class_id uuid, p_replace boolean default false)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_expected smallint;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select expected_weekly_hours into v_expected from public.curriculum_templates where id=p_template_id and active=true;
  if not found then raise exception 'TEMPLATE_NOT_FOUND'; end if;
  if not exists(select 1 from public.school_classes where id=p_class_id and active=true) then raise exception 'CLASS_NOT_FOUND'; end if;

  if p_replace then
    delete from public.class_course_requirements where class_id=p_class_id and locked=false;
  end if;

  insert into public.class_course_requirements(class_id,course_id,weekly_hours,category,source_template_id,updated_at)
  select p_class_id,tc.course_id,tc.weekly_hours,tc.category,p_template_id,now()
  from public.curriculum_template_courses tc where tc.template_id=p_template_id
  on conflict(class_id,course_id) do update set
    weekly_hours=case when public.class_course_requirements.locked then public.class_course_requirements.weekly_hours else excluded.weekly_hours end,
    category=case when public.class_course_requirements.locked then public.class_course_requirements.category else excluded.category end,
    source_template_id=excluded.source_template_id,
    updated_at=now();
  get diagnostics v_count = row_count;

  update public.school_classes
  set expected_weekly_hours=coalesce(v_expected,expected_weekly_hours),updated_at=now()
  where id=p_class_id;
  perform public.refresh_class_curriculum_status(p_class_id);
  return v_count;
end;
$$;

create or replace function public.clone_class_curriculum(p_source_class_id uuid, p_target_class_id uuid, p_copy_teachers boolean default false)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_source_class_id=p_target_class_id then raise exception 'SOURCE_AND_TARGET_MUST_DIFFER'; end if;

  insert into public.class_course_requirements(class_id,course_id,weekly_hours,category,source_template_id,locked,note,updated_at)
  select p_target_class_id,course_id,weekly_hours,category,source_template_id,false,note,now()
  from public.class_course_requirements where class_id=p_source_class_id
  on conflict(class_id,course_id) do update set weekly_hours=excluded.weekly_hours,category=excluded.category,
    source_template_id=excluded.source_template_id,updated_at=now();
  get diagnostics v_count = row_count;

  update public.school_classes t set expected_weekly_hours=s.expected_weekly_hours,updated_at=now()
  from public.school_classes s where s.id=p_source_class_id and t.id=p_target_class_id;

  if p_copy_teachers then
    insert into public.teacher_course_assignments(class_course_requirement_id,teacher_id,assigned_hours,assignment_group,note,created_by,updated_at)
    select target.id,a.teacher_id,a.assigned_hours,a.assignment_group,a.note,auth.uid(),now()
    from public.teacher_course_assignments a
    join public.class_course_requirements source on source.id=a.class_course_requirement_id and source.class_id=p_source_class_id
    join public.class_course_requirements target on target.class_id=p_target_class_id and target.course_id=source.course_id
    on conflict(class_course_requirement_id,teacher_id,assignment_group) do update set assigned_hours=excluded.assigned_hours,updated_at=now();
  end if;

  perform public.refresh_class_curriculum_status(p_target_class_id);
  return v_count;
end;
$$;

create or replace function public.assign_teacher_to_class_course(p_requirement_id uuid,p_teacher_id uuid,p_hours smallint default null,p_group text default 'main')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_required smallint;
  v_existing integer;
  v_hours smallint;
  v_id uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select weekly_hours into v_required from public.class_course_requirements where id=p_requirement_id;
  if not found then raise exception 'COURSE_REQUIREMENT_NOT_FOUND'; end if;
  if not exists(select 1 from public.profiles where user_id=p_teacher_id and role='teacher') then raise exception 'TEACHER_NOT_FOUND'; end if;
  select coalesce(sum(assigned_hours),0)::integer into v_existing from public.teacher_course_assignments
    where class_course_requirement_id=p_requirement_id and assignment_group=coalesce(nullif(trim(p_group),''),'main') and teacher_id<>p_teacher_id;
  v_hours := coalesce(p_hours, v_required-v_existing);
  if v_hours <= 0 or v_existing+v_hours > v_required then raise exception 'ASSIGNED_HOURS_EXCEED_REQUIREMENT'; end if;

  insert into public.teacher_course_assignments(class_course_requirement_id,teacher_id,assigned_hours,assignment_group,created_by,updated_at)
  values(p_requirement_id,p_teacher_id,v_hours,coalesce(nullif(trim(p_group),''),'main'),auth.uid(),now())
  on conflict(class_course_requirement_id,teacher_id,assignment_group) do update set assigned_hours=excluded.assigned_hours,updated_at=now()
  returning id into v_id;
  return v_id;
end;
$$;

create or replace view public.class_curriculum_summary
with (security_invoker=true)
as
select c.id as class_id,c.class_name,c.composite_key,c.program_type,c.expected_weekly_hours,c.curriculum_status,
  coalesce(sum(r.weekly_hours),0)::integer as planned_weekly_hours,
  count(r.id)::integer as course_count,
  coalesce(sum((select coalesce(sum(a.assigned_hours),0) from public.teacher_course_assignments a where a.class_course_requirement_id=r.id)),0)::integer as assigned_teacher_hours
from public.school_classes c
left join public.class_course_requirements r on r.class_id=c.id
where c.active=true
group by c.id;

grant select on public.class_curriculum_summary to authenticated;

create or replace view public.teacher_course_load_summary
with (security_invoker=true)
as
select p.user_id as teacher_id,p.full_name,
  coalesce(sum(a.assigned_hours),0)::integer as assigned_weekly_hours,
  count(distinct r.class_id)::integer as class_count,
  count(distinct r.course_id)::integer as course_count
from public.profiles p
left join public.teacher_course_assignments a on a.teacher_id=p.user_id
left join public.class_course_requirements r on r.id=a.class_course_requirement_id
where p.role='teacher'
group by p.user_id,p.full_name;

grant select on public.teacher_course_load_summary to authenticated;

revoke all on function public.apply_curriculum_template(uuid,uuid,boolean) from public;
revoke all on function public.clone_class_curriculum(uuid,uuid,boolean) from public;
revoke all on function public.assign_teacher_to_class_course(uuid,uuid,smallint,text) from public;
grant execute on function public.apply_curriculum_template(uuid,uuid,boolean) to authenticated;
grant execute on function public.clone_class_curriculum(uuid,uuid,boolean) to authenticated;
grant execute on function public.assign_teacher_to_class_course(uuid,uuid,smallint,text) to authenticated;
