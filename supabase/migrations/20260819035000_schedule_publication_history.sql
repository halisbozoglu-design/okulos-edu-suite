-- OkulOS published timetable history / evidence chain.
-- Working rows in teacher_schedule may change; every timetable that is put into use is frozen here.

create extension if not exists pgcrypto;

create table if not exists public.schedule_publications (
  id uuid primary key default gen_random_uuid(),
  effective_from date not null,
  academic_year text,
  title text not null default 'Haftalık Ders Programı',
  note text,
  schedule_hash text not null,
  row_count integer not null check (row_count >= 0),
  published_by uuid references public.profiles(user_id) on delete set null,
  published_at timestamptz not null default now()
);

create index if not exists idx_schedule_publications_effective
  on public.schedule_publications(effective_from desc, published_at desc);

create table if not exists public.schedule_publication_rows (
  id bigint generated always as identity primary key,
  publication_id uuid not null references public.schedule_publications(id) on delete restrict,
  source_schedule_id uuid,
  teacher_id uuid not null references public.profiles(user_id) on delete restrict,
  class_id uuid references public.school_classes(id) on delete restrict,
  weekday smallint not null check (weekday between 1 and 7),
  period smallint not null check (period between 1 and 12),
  class_name text not null,
  subject text not null,
  classroom text,
  classroom_id uuid references public.classrooms(id) on delete restrict,
  subgroup_id uuid references public.class_subgroups(id) on delete restrict,
  subgroup_key text,
  is_group_split boolean not null default false,
  snapshot jsonb not null,
  unique(publication_id, teacher_id, weekday, period, subgroup_key)
);

create index if not exists idx_schedule_publication_rows_teacher
  on public.schedule_publication_rows(teacher_id, publication_id, weekday, period);
create index if not exists idx_schedule_publication_rows_class
  on public.schedule_publication_rows(class_id, publication_id, weekday, period);

alter table public.schedule_publications enable row level security;
alter table public.schedule_publication_rows enable row level security;

grant select on public.schedule_publications, public.schedule_publication_rows to authenticated;

create policy "authenticated read timetable publication headers"
on public.schedule_publications for select to authenticated using (true);

create policy "users read relevant published timetable rows"
on public.schedule_publication_rows for select to authenticated
using (teacher_id = auth.uid() or public.is_manager_or_admin());

-- Snapshot tables are evidence records. No normal client may insert/update/delete them directly.
revoke insert, update, delete on public.schedule_publications from authenticated;
revoke insert, update, delete on public.schedule_publication_rows from authenticated;

create or replace function public.block_published_schedule_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'PUBLISHED_SCHEDULE_IS_IMMUTABLE';
end;
$$;

drop trigger if exists trg_block_schedule_publications_update on public.schedule_publications;
create trigger trg_block_schedule_publications_update
before update or delete on public.schedule_publications
for each row execute function public.block_published_schedule_mutation();

drop trigger if exists trg_block_schedule_publication_rows_update on public.schedule_publication_rows;
create trigger trg_block_schedule_publication_rows_update
before update or delete on public.schedule_publication_rows
for each row execute function public.block_published_schedule_mutation();

-- Effective end is derived, never written back to historical evidence.
create or replace view public.schedule_publication_periods
with (security_invoker = true)
as
select
  sp.*,
  (lead(sp.effective_from) over (order by sp.effective_from, sp.published_at, sp.id) - 1) as effective_to
from public.schedule_publications sp;

grant select on public.schedule_publication_periods to authenticated;

create or replace function public.publish_current_schedule(
  p_effective_from date,
  p_academic_year text default null,
  p_title text default 'Haftalık Ders Programı',
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_publication_id uuid;
  v_hash text;
  v_count integer;
  v_payload text;
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if p_effective_from is null then
    raise exception 'EFFECTIVE_DATE_REQUIRED';
  end if;

  select count(*)::integer into v_count
  from public.teacher_schedule
  where active = true;

  if v_count = 0 then
    raise exception 'EMPTY_SCHEDULE_CANNOT_BE_PUBLISHED';
  end if;

  select string_agg(
    concat_ws('|',
      ts.teacher_id::text,
      coalesce(ts.class_id::text,''),
      ts.weekday::text,
      ts.period::text,
      ts.class_name,
      ts.subject,
      coalesce(ts.classroom,''),
      coalesce(ts.classroom_id::text,''),
      coalesce(ts.subgroup_id::text,''),
      coalesce(ts.subgroup_key,''),
      ts.is_group_split::text
    ), E'\n' order by ts.teacher_id, ts.weekday, ts.period, coalesce(ts.subgroup_key,''), ts.id
  ) into v_payload
  from public.teacher_schedule ts
  where ts.active = true;

  v_hash := encode(digest(coalesce(v_payload,''), 'sha256'), 'hex');

  insert into public.schedule_publications(
    effective_from, academic_year, title, note, schedule_hash, row_count, published_by
  ) values (
    p_effective_from,
    nullif(trim(p_academic_year),''),
    coalesce(nullif(trim(p_title),''),'Haftalık Ders Programı'),
    nullif(trim(p_note),''),
    v_hash,
    v_count,
    auth.uid()
  ) returning id into v_publication_id;

  insert into public.schedule_publication_rows(
    publication_id, source_schedule_id, teacher_id, class_id, weekday, period,
    class_name, subject, classroom, classroom_id, subgroup_id, subgroup_key,
    is_group_split, snapshot
  )
  select
    v_publication_id,
    ts.id,
    ts.teacher_id,
    ts.class_id,
    ts.weekday,
    ts.period,
    ts.class_name,
    ts.subject,
    ts.classroom,
    ts.classroom_id,
    ts.subgroup_id,
    ts.subgroup_key,
    ts.is_group_split,
    to_jsonb(ts)
  from public.teacher_schedule ts
  where ts.active = true
  order by ts.teacher_id, ts.weekday, ts.period, coalesce(ts.subgroup_key,''), ts.id;

  return v_publication_id;
end;
$$;

revoke all on function public.publish_current_schedule(date,text,text,text) from public;
grant execute on function public.publish_current_schedule(date,text,text,text) to authenticated;

-- Returns the exact version that was valid on a requested date.
create or replace function public.get_schedule_publication_for_date(p_date date)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select sp.id
  from public.schedule_publications sp
  where sp.effective_from <= p_date
  order by sp.effective_from desc, sp.published_at desc
  limit 1;
$$;

revoke all on function public.get_schedule_publication_for_date(date) from public;
grant execute on function public.get_schedule_publication_for_date(date) to authenticated;
