-- Central data-management additions for MEB imports, scoped calendar work and multi-role personnel responsibilities.

create table if not exists public.personnel_registry (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text,
  duty_title text,
  teaching_area_raw text,
  teaching_area_id uuid references public.teaching_areas(id) on delete set null,
  employment_status text,
  system_role text,
  linked_user_id uuid references auth.users(id) on delete set null,
  active boolean not null default true,
  source_file_name text,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(full_name, teaching_area_raw, duty_title)
);

create table if not exists public.responsibility_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  parent_title text,
  applicable_school_types text[] not null default '{}',
  legal_basis text,
  active boolean not null default true,
  sort_order integer not null default 100
);

create table if not exists public.personnel_responsibilities (
  id uuid primary key default gen_random_uuid(),
  personnel_id uuid references public.personnel_registry(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  responsibility_id uuid not null references public.responsibility_catalog(id) on delete restrict,
  starts_on date,
  ends_on date,
  legal_basis text,
  assignment_document_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint personnel_responsibility_owner check (personnel_id is not null or user_id is not null)
);
create unique index if not exists personnel_responsibilities_personnel_unique
  on public.personnel_responsibilities(personnel_id, responsibility_id)
  where personnel_id is not null and active;
create unique index if not exists personnel_responsibilities_user_unique
  on public.personnel_responsibilities(user_id, responsibility_id)
  where user_id is not null and active;

insert into public.responsibility_catalog(code,name,parent_title,applicable_school_types,sort_order) values
  ('vice_principal_coordinator','Koordinatör Müdür Yardımcısı','Müdür Yardımcısı',array['Mesleki ve Teknik Anadolu Lisesi','Mesleki Eğitim Merkezi'],10),
  ('vice_principal_technical','Teknik Müdür Yardımcısı','Müdür Yardımcısı',array['Mesleki ve Teknik Anadolu Lisesi','Mesleki Eğitim Merkezi'],20),
  ('vice_principal_boarding','Pansiyondan Sorumlu Müdür Yardımcısı','Müdür Yardımcısı',array['Pansiyonlu Okul'],30),
  ('vice_principal_exams','Sınavlardan Sorumlu Müdür Yardımcısı','Müdür Yardımcısı',array[]::text[],40),
  ('vice_principal_student_affairs','Öğrenci İşlerinden Sorumlu Müdür Yardımcısı','Müdür Yardımcısı',array[]::text[],50),
  ('vice_principal_transport','Taşımalı Eğitimden Sorumlu Müdür Yardımcısı','Müdür Yardımcısı',array['Taşımalı Eğitim'],60)
on conflict (code) do update set
  name=excluded.name,
  parent_title=excluded.parent_title,
  applicable_school_types=excluded.applicable_school_types,
  sort_order=excluded.sort_order;

alter table public.school_classes add column if not exists advisor_teacher_id uuid references auth.users(id) on delete set null;
alter table public.school_classes add column if not exists source_file_name text;
alter table public.school_classes add column if not exists imported_student_count integer;

alter table public.school_calendar_events add column if not exists school_levels text[] not null default '{}';
alter table public.school_calendar_events add column if not exists school_types text[] not null default '{}';
alter table public.school_calendar_events add column if not exists grade_levels text[] not null default '{}';
alter table public.school_calendar_events add column if not exists audiences text[] not null default '{}';
alter table public.school_calendar_events add column if not exists conditional boolean not null default false;
alter table public.school_calendar_events add column if not exists source_file_name text;
alter table public.school_calendar_events add column if not exists parsed_from_source boolean not null default false;

create table if not exists public.calendar_event_tasks (
  id uuid primary key default gen_random_uuid(),
  calendar_event_id uuid not null references public.school_calendar_events(id) on delete cascade,
  assigned_user_id uuid references auth.users(id) on delete set null,
  assigned_personnel_id uuid references public.personnel_registry(id) on delete set null,
  assigned_responsibility_id uuid references public.responsibility_catalog(id) on delete set null,
  starts_on date,
  due_on date,
  recurrence text not null default 'none',
  report_required boolean not null default false,
  report_frequency text,
  file_required boolean not null default false,
  status text not null default 'planned',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.calendar_event_tasks(id) on delete cascade,
  file_url text not null,
  file_name text,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

-- Import summarized MEB/e-Okul branch reports without requiring student-level rows.
create or replace function public.import_class_summaries(p_file_name text, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb;
  v_id uuid;
  v_count integer := 0;
begin
  if not public.has_permission(auth.uid(),'classes.manage') then
    raise exception 'FORBIDDEN';
  end if;
  for r in select * from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    insert into public.school_classes(class_name, program_type, composite_key, active, source_file_name, imported_student_count)
    values(
      nullif(r->>'className',''),
      nullif(r->>'programType',''),
      coalesce(nullif(r->>'compositeKey',''), concat_ws(' - ', nullif(r->>'className',''), nullif(r->>'programType',''))),
      true,
      p_file_name,
      coalesce((r->>'studentCount')::integer,0)
    )
    on conflict (composite_key) do update set
      program_type=excluded.program_type,
      active=true,
      source_file_name=excluded.source_file_name,
      imported_student_count=excluded.imported_student_count,
      updated_at=now()
    returning id into v_id;
    v_count := v_count + 1;
  end loop;
  return jsonb_build_object('affected_classes',v_count);
end $$;

create or replace function public.import_personnel_registry(p_file_name text, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb;
  v_count integer := 0;
begin
  if not public.has_permission(auth.uid(),'personnel.manage') then
    raise exception 'FORBIDDEN';
  end if;
  for r in select * from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    insert into public.personnel_registry(full_name,title,duty_title,teaching_area_raw,employment_status,system_role,source_file_name)
    values(
      nullif(r->>'fullName',''),
      nullif(r->>'title',''),
      nullif(r->>'dutyTitle',''),
      nullif(r->>'teachingArea',''),
      nullif(r->>'employmentStatus',''),
      nullif(r->>'systemRole',''),
      p_file_name
    )
    on conflict (full_name, teaching_area_raw, duty_title) do update set
      title=excluded.title,
      employment_status=excluded.employment_status,
      system_role=excluded.system_role,
      source_file_name=excluded.source_file_name,
      active=true,
      updated_at=now();
    v_count := v_count + 1;
  end loop;
  return jsonb_build_object('affected_personnel',v_count);
end $$;

alter table public.personnel_registry enable row level security;
alter table public.responsibility_catalog enable row level security;
alter table public.personnel_responsibilities enable row level security;
alter table public.calendar_event_tasks enable row level security;
alter table public.calendar_task_files enable row level security;

drop policy if exists personnel_registry_read on public.personnel_registry;
create policy personnel_registry_read on public.personnel_registry for select to authenticated using (public.has_permission(auth.uid(),'personnel.view') or public.has_permission(auth.uid(),'personnel.manage'));
drop policy if exists personnel_registry_manage on public.personnel_registry;
create policy personnel_registry_manage on public.personnel_registry for all to authenticated using (public.has_permission(auth.uid(),'personnel.manage')) with check (public.has_permission(auth.uid(),'personnel.manage'));

drop policy if exists responsibility_catalog_read on public.responsibility_catalog;
create policy responsibility_catalog_read on public.responsibility_catalog for select to authenticated using (true);
drop policy if exists responsibility_catalog_manage on public.responsibility_catalog;
create policy responsibility_catalog_manage on public.responsibility_catalog for all to authenticated using (public.has_permission(auth.uid(),'settings.manage')) with check (public.has_permission(auth.uid(),'settings.manage'));

drop policy if exists personnel_responsibilities_read on public.personnel_responsibilities;
create policy personnel_responsibilities_read on public.personnel_responsibilities for select to authenticated using (true);
drop policy if exists personnel_responsibilities_manage on public.personnel_responsibilities;
create policy personnel_responsibilities_manage on public.personnel_responsibilities for all to authenticated using (public.has_permission(auth.uid(),'personnel.manage')) with check (public.has_permission(auth.uid(),'personnel.manage'));

drop policy if exists calendar_event_tasks_read on public.calendar_event_tasks;
create policy calendar_event_tasks_read on public.calendar_event_tasks for select to authenticated using (assigned_user_id = auth.uid() or public.has_permission(auth.uid(),'settings.manage'));
drop policy if exists calendar_event_tasks_manage on public.calendar_event_tasks;
create policy calendar_event_tasks_manage on public.calendar_event_tasks for all to authenticated using (public.has_permission(auth.uid(),'settings.manage')) with check (public.has_permission(auth.uid(),'settings.manage'));

drop policy if exists calendar_task_files_read on public.calendar_task_files;
create policy calendar_task_files_read on public.calendar_task_files for select to authenticated using (exists(select 1 from public.calendar_event_tasks t where t.id=task_id and (t.assigned_user_id=auth.uid() or public.has_permission(auth.uid(),'settings.manage'))));
drop policy if exists calendar_task_files_manage on public.calendar_task_files;
create policy calendar_task_files_manage on public.calendar_task_files for all to authenticated using (true) with check (true);
