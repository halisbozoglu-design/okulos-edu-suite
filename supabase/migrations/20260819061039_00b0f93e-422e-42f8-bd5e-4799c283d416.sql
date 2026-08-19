-- ==== 20260819020500_payroll_engine.sql ====
create table if not exists public.teacher_payroll_config (
  teacher_id uuid primary key references public.profiles(user_id) on delete cascade,
  weekly_salary_obligation smallint not null default 15 check (weekly_salary_obligation between 0 and 40),
  has_class_guidance boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_calendar (
  calendar_date date primary key,
  day_type text not null check (day_type in ('workday','official_holiday','administrative_leave','school_closed')),
  title text not null,
  deemed_regular_performed boolean not null default false,
  deemed_guidance_performed boolean not null default false,
  duty_payable boolean not null default true,
  source_note text,
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz
);

create table if not exists public.payroll_day_entries (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  work_date date not null,
  category text not null check (category in ('gunduz','nobet','rehberlik')),
  hours numeric(5,2) not null default 0 check (hours >= 0),
  source_type text not null check (source_type in ('schedule','substitute','duty','guidance','holiday_rule','admin_leave','manual_adjustment')),
  source_id uuid,
  kbs_data_type text not null default '101',
  explanation text,
  calculated boolean not null default true,
  approved boolean not null default false,
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (teacher_id, work_date, category, source_type, source_id)
);

create table if not exists public.payroll_calculation_runs (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  calculated_by uuid not null references public.profiles(user_id) on delete restrict,
  status text not null default 'calculated' check (status in ('calculated','approved','exported')),
  rule_version text not null default '2026-8th-collective-contract',
  created_at timestamptz not null default now()
);

create index if not exists idx_payroll_day_entries_month on public.payroll_day_entries(work_date, teacher_id);
create index if not exists idx_payroll_day_entries_approved on public.payroll_day_entries(teacher_id, work_date, approved);

alter table public.teacher_payroll_config enable row level security;
alter table public.payroll_calendar enable row level security;
alter table public.payroll_day_entries enable row level security;
alter table public.payroll_calculation_runs enable row level security;

grant select on public.teacher_payroll_config, public.payroll_calendar, public.payroll_day_entries, public.payroll_calculation_runs to authenticated;
grant insert, update, delete on public.teacher_payroll_config, public.payroll_calendar to authenticated;
grant update on public.payroll_day_entries to authenticated;

create policy "managers read payroll config" on public.teacher_payroll_config for select to authenticated using (public.is_manager_or_admin());
create policy "managers manage payroll config" on public.teacher_payroll_config for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read payroll calendar" on public.payroll_calendar for select to authenticated using (true);
create policy "managers manage payroll calendar" on public.payroll_calendar for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "users read relevant payroll" on public.payroll_day_entries for select to authenticated using (teacher_id = auth.uid() or public.is_manager_or_admin());
create policy "managers approve payroll" on public.payroll_day_entries for update to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers read payroll runs" on public.payroll_calculation_runs for select to authenticated using (public.is_manager_or_admin());

-- ==== 20260819020800_payroll_security_approval.sql ====
alter table public.absences
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected')),
  add column if not exists approved_by uuid references public.profiles(user_id) on delete set null,
  add column if not exists approved_at timestamptz;

create or replace function public.payroll_month_matrix(p_year int, p_month int)
returns table (
  teacher_id uuid,
  full_name text,
  role public.app_role,
  work_date date,
  category text,
  hours numeric,
  kbs_data_type text,
  approved boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  return query
  select e.teacher_id, p.full_name, p.role, e.work_date, e.category, sum(e.hours), e.kbs_data_type, bool_and(e.approved)
  from public.payroll_day_entries e
  join public.profiles p on p.user_id = e.teacher_id
  where e.work_date >= make_date(p_year,p_month,1)
    and e.work_date < make_date(p_year,p_month,1) + interval '1 month'
  group by e.teacher_id,p.full_name,p.role,e.work_date,e.category,e.kbs_data_type
  order by p.full_name,e.work_date,e.category;
end;
$$;

revoke all on function public.payroll_month_matrix(int,int) from public;
grant execute on function public.payroll_month_matrix(int,int) to authenticated;

create or replace function public.kbs_payroll_export(p_year int, p_month int)
returns table (
  tckn text,
  full_name text,
  data_type text,
  hours numeric,
  explanation text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  return query
  select p.tckn, coalesce(p.full_name,''), e.kbs_data_type, sum(e.hours),
         string_agg(distinct coalesce(e.explanation,''), ' / ')
  from public.payroll_day_entries e
  join public.profiles p on p.user_id = e.teacher_id
  where e.work_date >= make_date(p_year,p_month,1)
    and e.work_date < make_date(p_year,p_month,1) + interval '1 month'
    and e.approved = true
  group by p.tckn,p.full_name,e.kbs_data_type
  order by p.full_name,e.kbs_data_type;
end;
$$;

revoke all on function public.kbs_payroll_export(int,int) from public;
grant execute on function public.kbs_payroll_export(int,int) to authenticated;

create or replace function public.approve_payroll_month(p_year int, p_month int)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  update public.payroll_day_entries
     set approved = true, approved_by = auth.uid(), approved_at = now()
   where work_date >= make_date(p_year,p_month,1)
     and work_date < make_date(p_year,p_month,1) + interval '1 month';
  get diagnostics v_count = row_count;
  update public.payroll_calculation_runs
     set status = 'approved'
   where period_start = make_date(p_year,p_month,1)
     and period_end = (make_date(p_year,p_month,1) + interval '1 month - 1 day')::date;
  return v_count;
end;
$$;

revoke all on function public.approve_payroll_month(int,int) from public;
grant execute on function public.approve_payroll_month(int,int) to authenticated;

-- ==== 20260819021000_payroll_kbs_codes.sql ====
alter table public.teacher_payroll_config
  add column if not exists gunduz_kbs_data_type text not null default '101',
  add column if not exists nobet_kbs_data_type text not null default '110',
  add column if not exists rehberlik_kbs_data_type text not null default '110';

create or replace function public.recalculate_payroll_month(p_year int, p_month int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start date := make_date(p_year, p_month, 1);
  v_end date := (make_date(p_year, p_month, 1) + interval '1 month - 1 day')::date;
  v_run uuid;
  v_teacher record;
  v_week date;
  v_week_end date;
  v_regular_total numeric;
  v_obligation numeric;
  v_extra_remaining numeric;
  v_day record;
  v_day_regular numeric;
  v_substitute numeric;
  v_calendar record;
  v_duty_count int;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;

  insert into public.payroll_calculation_runs(period_start, period_end, calculated_by)
  values (v_start, v_end, auth.uid()) returning id into v_run;

  delete from public.payroll_day_entries
  where work_date between v_start and v_end and calculated = true and approved = false;

  for v_teacher in
    select p.user_id,
           coalesce(c.weekly_salary_obligation, 15) as obligation,
           coalesce(c.has_class_guidance, false) as has_guidance,
           coalesce(c.gunduz_kbs_data_type, '101') as gunduz_code,
           coalesce(c.nobet_kbs_data_type, '110') as nobet_code,
           coalesce(c.rehberlik_kbs_data_type, '110') as rehberlik_code
    from public.profiles p
    left join public.teacher_payroll_config c on c.teacher_id = p.user_id
    where p.role = 'teacher' and coalesce(c.active, true)
  loop
    v_week := date_trunc('week', v_start::timestamp)::date;
    while v_week <= v_end loop
      v_week_end := v_week + 6;

      select coalesce(sum(case
        when pc.day_type is null or pc.day_type = 'workday' or pc.deemed_regular_performed then 1
        else 0 end), 0)
      into v_regular_total
      from generate_series(greatest(v_week, v_start), least(v_week_end, v_end), interval '1 day') g(d)
      join public.teacher_schedule ts
        on ts.teacher_id = v_teacher.user_id
       and ts.weekday = extract(isodow from g.d)::smallint
      left join public.payroll_calendar pc on pc.calendar_date = g.d::date
      left join public.absences a
        on a.teacher_id = v_teacher.user_id and a.absence_date = g.d::date
       and a.status <> 'resolved' and a.approval_status = 'approved'
      where a.id is null or pc.deemed_regular_performed = true;

      select coalesce(count(*),0) into v_substitute
      from public.substitute_assignments sa
      join public.absence_lessons al on al.id = sa.absence_lesson_id
      where sa.substitute_user_id = v_teacher.user_id
        and al.lesson_date between greatest(v_week, v_start) and least(v_week_end, v_end)
        and sa.approval_status = 'approved';

      v_regular_total := v_regular_total + v_substitute;
      v_obligation := least(v_teacher.obligation, v_regular_total);
      v_extra_remaining := greatest(v_regular_total - v_obligation, 0);

      for v_day in
        select g.d::date as work_date
        from generate_series(greatest(v_week, v_start), least(v_week_end, v_end), interval '1 day') g(d)
        order by g.d
      loop
        exit when v_extra_remaining <= 0;
        select * into v_calendar from public.payroll_calendar where calendar_date = v_day.work_date;

        select coalesce(count(*),0) into v_day_regular
        from public.teacher_schedule ts
        left join public.absences a on a.teacher_id = ts.teacher_id and a.absence_date = v_day.work_date
          and a.status <> 'resolved' and a.approval_status = 'approved'
        where ts.teacher_id = v_teacher.user_id
          and ts.weekday = extract(isodow from v_day.work_date)::smallint
          and (a.id is null or coalesce(v_calendar.deemed_regular_performed,false));

        select coalesce(count(*),0) into v_substitute
        from public.substitute_assignments sa
        join public.absence_lessons al on al.id = sa.absence_lesson_id
        where sa.substitute_user_id = v_teacher.user_id
          and al.lesson_date = v_day.work_date
          and sa.approval_status = 'approved';

        if v_day_regular + v_substitute > 0 then
          insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
          values (
            v_teacher.user_id, v_day.work_date, 'gunduz', least(v_extra_remaining, v_day_regular + v_substitute),
            case when v_substitute > 0 then 'substitute' else case when v_calendar.day_type = 'administrative_leave' then 'admin_leave' when v_calendar.day_type = 'official_holiday' then 'holiday_rule' else 'schedule' end end,
            v_run, v_teacher.gunduz_code, 'Haftalık ders yükü, onaylı devamsızlık ve onaylı vekaletlere göre hesaplandı'
          );
          v_extra_remaining := v_extra_remaining - least(v_extra_remaining, v_day_regular + v_substitute);
        end if;
      end loop;

      select count(*) into v_duty_count
      from public.teacher_duty_assignments tda
      left join public.payroll_calendar pc on pc.calendar_date = tda.duty_date
      left join public.absences a on a.teacher_id = tda.teacher_id and a.absence_date = tda.duty_date
        and a.status <> 'resolved' and a.approval_status = 'approved'
      where tda.teacher_id = v_teacher.user_id
        and tda.duty_date between greatest(v_week, v_start) and least(v_week_end, v_end)
        and a.id is null and coalesce(pc.duty_payable, true) = true;

      if v_duty_count > 0 then
        insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
        values (v_teacher.user_id, greatest(v_week, v_start), 'nobet', 3, 'duty', v_run, v_teacher.nobet_code, 'Fiilen yerine getirilen nöbet görevi; haftalık en fazla 3 saat');
      end if;

      if v_teacher.has_guidance then
        select g.d::date into v_day.work_date
        from generate_series(greatest(v_week, v_start), least(v_week_end, v_end), interval '1 day') g(d)
        left join public.payroll_calendar pc on pc.calendar_date = g.d::date
        left join public.absences a on a.teacher_id = v_teacher.user_id and a.absence_date = g.d::date
          and a.status <> 'resolved' and a.approval_status = 'approved'
        where (pc.day_type is null or pc.day_type = 'workday' or pc.deemed_guidance_performed)
          and (a.id is null or coalesce(pc.deemed_guidance_performed,false))
        order by g.d limit 1;
        if found then
          insert into public.payroll_day_entries(teacher_id, work_date, category, hours, source_type, source_id, kbs_data_type, explanation)
          values (v_teacher.user_id, v_day.work_date, 'rehberlik', 2, 'guidance', v_run, v_teacher.rehberlik_code, 'Sınıf/şube rehberliği öğrenci sosyal ve kişilik hizmetleri; haftalık 2 saat');
        end if;
      end if;

      v_week := v_week + 7;
    end loop;
  end loop;
  return v_run;
end;
$$;

revoke all on function public.recalculate_payroll_month(int,int) from public;
grant execute on function public.recalculate_payroll_month(int,int) to authenticated;

-- ==== 20260819021200_payroll_lock.sql ====
create or replace function public.payroll_month_is_locked(p_year int, p_month int)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.payroll_day_entries
    where work_date >= make_date(p_year,p_month,1)
      and work_date < make_date(p_year,p_month,1) + interval '1 month'
      and approved = true
  );
$$;

revoke all on function public.payroll_month_is_locked(int,int) from public;
grant execute on function public.payroll_month_is_locked(int,int) to authenticated;

-- Once a month has approved rows, recalculation must be explicitly unlocked by a later controlled workflow.
-- This guard prevents accidental duplicate or changed official payroll after approval.
create or replace function public.prevent_approved_payroll_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.approved then
    raise exception 'APPROVED_PAYROLL_LOCKED';
  end if;
  return old;
end;
$$;

drop trigger if exists trg_prevent_approved_payroll_delete on public.payroll_day_entries;
create trigger trg_prevent_approved_payroll_delete
before delete on public.payroll_day_entries
for each row execute function public.prevent_approved_payroll_delete();

-- ==== 20260819022000_eokul_import.sql ====
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