create table if not exists public.eokul_import_batches (
  id uuid primary key default gen_random_uuid(),
  imported_by uuid not null references public.profiles(user_id) on delete restrict,
  file_name text not null,
  file_type text not null check (file_type in ('pdf','xlsx','xls')),
  row_count integer not null default 0,
  imported_at timestamptz not null default now()
);

alter table public.school_classes
  add column if not exists grade_level smallint,
  add column if not exists section text,
  add column if not exists composite_key text,
  add column if not exists split_threshold integer not null default 25,
  add column if not exists source text not null default 'manual',
  add column if not exists updated_at timestamptz not null default now();

update public.school_classes
set composite_key = upper(trim(class_name)) || case when coalesce(trim(program_type), '') <> '' then ' - ' || upper(trim(program_type)) else '' end
where composite_key is null;

create unique index if not exists uq_school_classes_composite_key
  on public.school_classes(composite_key)
  where composite_key is not null;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_number text not null,
  full_name text not null,
  class_id uuid not null references public.school_classes(id) on delete restrict,
  active boolean not null default true,
  source text not null default 'eokul',
  import_batch_id uuid references public.eokul_import_batches(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_number)
);

create index if not exists idx_students_class on public.students(class_id, active);

alter table public.eokul_import_batches enable row level security;
alter table public.students enable row level security;

grant select on public.students, public.eokul_import_batches to authenticated;

create policy "authenticated can read students"
on public.students for select to authenticated using (true);

create policy "managers can read import batches"
on public.eokul_import_batches for select to authenticated
using (public.is_manager_or_admin());

create or replace function public.normalize_class_key(p_class_name text, p_program_type text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(trim(coalesce(p_class_name,'')), '\s+', '', 'g'))
    || case
      when coalesce(trim(p_program_type),'') = '' then ''
      else ' - ' || upper(regexp_replace(trim(p_program_type), '\s+', ' ', 'g'))
    end;
$$;

create or replace function public.import_eokul_roster(
  p_file_name text,
  p_file_type text,
  p_rows jsonb
)
returns table(import_batch_id uuid, imported_students integer, affected_classes integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch uuid;
  v_row jsonb;
  v_class_id uuid;
  v_key text;
  v_class_name text;
  v_program text;
  v_grade smallint;
  v_section text;
  v_students integer := 0;
  v_classes text[] := '{}';
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if p_file_type not in ('pdf','xlsx','xls') then
    raise exception 'UNSUPPORTED_FILE_TYPE';
  end if;

  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'INVALID_ROWS';
  end if;

  insert into public.eokul_import_batches(imported_by, file_name, file_type, row_count)
  values (auth.uid(), p_file_name, p_file_type, jsonb_array_length(p_rows))
  returning id into v_batch;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    v_class_name := trim(v_row->>'className');
    v_program := nullif(trim(v_row->>'programType'), '');
    v_grade := nullif(v_row->>'gradeLevel','')::smallint;
    v_section := nullif(trim(v_row->>'section'), '');
    v_key := public.normalize_class_key(v_class_name, v_program);

    if v_class_name is null or v_class_name = '' or coalesce(trim(v_row->>'schoolNumber'),'') = '' or coalesce(trim(v_row->>'fullName'),'') = '' then
      raise exception 'INVALID_STUDENT_ROW';
    end if;

    insert into public.school_classes(class_name, program_type, grade_level, section, composite_key, source, updated_at)
    values (v_class_name, v_program, v_grade, v_section, v_key, 'eokul', now())
    on conflict (composite_key) where composite_key is not null
    do update set
      class_name = excluded.class_name,
      program_type = excluded.program_type,
      grade_level = coalesce(excluded.grade_level, public.school_classes.grade_level),
      section = coalesce(excluded.section, public.school_classes.section),
      source = 'eokul',
      updated_at = now()
    returning id into v_class_id;

    insert into public.students(school_number, full_name, class_id, active, source, import_batch_id, updated_at)
    values (trim(v_row->>'schoolNumber'), trim(v_row->>'fullName'), v_class_id, true, 'eokul', v_batch, now())
    on conflict (school_number)
    do update set
      full_name = excluded.full_name,
      class_id = excluded.class_id,
      active = true,
      source = 'eokul',
      import_batch_id = excluded.import_batch_id,
      updated_at = now();

    v_students := v_students + 1;
    if not (v_key = any(v_classes)) then
      v_classes := array_append(v_classes, v_key);
    end if;
  end loop;

  return query select v_batch, v_students, coalesce(array_length(v_classes,1),0);
end;
$$;

revoke all on function public.import_eokul_roster(text,text,jsonb) from public;
grant execute on function public.import_eokul_roster(text,text,jsonb) to authenticated;

create or replace view public.class_roster_summary
with (security_invoker = true)
as
select
  c.id,
  c.class_name,
  c.program_type,
  c.grade_level,
  c.section,
  c.composite_key,
  c.split_threshold,
  count(s.id) filter (where s.active) as student_count,
  (count(s.id) filter (where s.active) > c.split_threshold) as needs_split,
  greatest(1, ceil((count(s.id) filter (where s.active))::numeric / nullif(c.split_threshold,0))::integer) as suggested_group_count
from public.school_classes c
left join public.students s on s.class_id = c.id
group by c.id;

grant select on public.class_roster_summary to authenticated;
