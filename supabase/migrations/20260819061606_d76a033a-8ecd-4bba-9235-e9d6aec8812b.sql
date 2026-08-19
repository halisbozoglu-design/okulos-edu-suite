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

revoke insert, update, delete on public.schedule_publications from authenticated;
revoke insert, update, delete on public.schedule_publication_rows from authenticated;

create or replace function public.block_published_schedule_mutation()
returns trigger
language plpgsql
set search_path = public
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

-- Same-day revisions keep valid periods correct.
create or replace view public.schedule_publication_periods
with (security_invoker = true)
as
with dated as (
  select
    sp.*,
    (
      select min(n.effective_from)
      from public.schedule_publications n
      where n.effective_from > sp.effective_from
    ) as next_effective_date
  from public.schedule_publications sp
)
select
  d.*,
  case when d.next_effective_date is null then null else d.next_effective_date - 1 end as effective_to
from dated d;

grant select on public.schedule_publication_periods to authenticated;

create or replace function public.get_schedule_publication_history()
returns table(
  publication_id uuid,
  effective_from date,
  effective_to date,
  academic_year text,
  title text,
  note text,
  schedule_hash text,
  row_count integer,
  published_by uuid,
  published_at timestamptz,
  same_day_revision_no bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.effective_from,
    p.effective_to,
    p.academic_year,
    p.title,
    p.note,
    p.schedule_hash,
    p.row_count,
    p.published_by,
    p.published_at,
    row_number() over (partition by p.effective_from order by p.published_at, p.id) as same_day_revision_no
  from public.schedule_publication_periods p
  order by p.effective_from desc, p.published_at desc, p.id desc;
$$;

revoke all on function public.get_schedule_publication_history() from public;
grant execute on function public.get_schedule_publication_history() to authenticated;

create or replace function public.get_my_published_schedule(p_date date default current_date)
returns table(
  publication_id uuid,
  effective_from date,
  academic_year text,
  title text,
  schedule_hash text,
  weekday smallint,
  period smallint,
  class_id uuid,
  class_name text,
  subject text,
  classroom text,
  classroom_id uuid,
  subgroup_id uuid,
  subgroup_key text,
  is_group_split boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with selected as (
    select public.get_schedule_publication_for_date(p_date) as id
  )
  select
    sp.id,
    sp.effective_from,
    sp.academic_year,
    sp.title,
    sp.schedule_hash,
    r.weekday,
    r.period,
    r.class_id,
    r.class_name,
    r.subject,
    r.classroom,
    r.classroom_id,
    r.subgroup_id,
    r.subgroup_key,
    r.is_group_split
  from selected s
  join public.schedule_publications sp on sp.id=s.id
  join public.schedule_publication_rows r on r.publication_id=sp.id
  where r.teacher_id=auth.uid()
  order by r.weekday, r.period, r.class_name;
$$;

revoke all on function public.get_my_published_schedule(date) from public;
grant execute on function public.get_my_published_schedule(date) to authenticated;

create or replace function public.get_published_schedule_rows(
  p_publication_id uuid,
  p_teacher_id uuid default null,
  p_class_id uuid default null
)
returns setof public.schedule_publication_rows
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.schedule_publication_rows r
  where r.publication_id=p_publication_id
    and (p_teacher_id is null or r.teacher_id=p_teacher_id)
    and (p_class_id is null or r.class_id=p_class_id)
    and (public.is_manager_or_admin() or r.teacher_id=auth.uid())
  order by r.weekday, r.period, r.teacher_id;
$$;

revoke all on function public.get_published_schedule_rows(uuid,uuid,uuid) from public;
grant execute on function public.get_published_schedule_rows(uuid,uuid,uuid) to authenticated;

-- Duty management write access for managers/admins.
grant insert, update, delete on public.vice_principals to authenticated;
grant insert, update, delete on public.duty_rotation to authenticated;
grant insert, update, delete on public.teacher_duty_assignments to authenticated;

create policy "managers manage vice principals"
on public.vice_principals for all to authenticated
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

create policy "managers manage duty rotation"
on public.duty_rotation for all to authenticated
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

create policy "managers manage teacher duty assignments"
on public.teacher_duty_assignments for all to authenticated
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

create or replace function public.generate_monthly_teacher_duties(p_month date, p_overwrite boolean default false)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_month date := date_trunc('month',p_month)::date;
  v_next_month date := (date_trunc('month',p_month)+interval '1 month')::date;
  v_day date;
  v_member record;
  v_locations text[];
  v_location_count integer;
  v_week_index integer;
  v_position integer;
  v_count integer:=0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if exists(select 1 from public.duty_month_locks where month_start=v_month and locked=true) then raise exception 'DUTY_MONTH_LOCKED'; end if;

  select array_agg(name order by critical desc,sort_order,name) into v_locations
  from public.duty_locations where active=true;
  v_location_count:=coalesce(array_length(v_locations,1),0);
  if v_location_count=0 then raise exception 'DUTY_LOCATION_REQUIRED'; end if;

  if p_overwrite then
    delete from public.teacher_duty_assignments
    where duty_date>=v_month and duty_date<v_next_month and assignment_source='monthly_cycle';
  end if;

  for v_day in
    select d::date from generate_series(v_month,(v_next_month-1),interval '1 day') d
    where extract(isodow from d) between 1 and 5 order by d
  loop
    v_week_index:=((extract(day from v_day)::integer-1)/7);
    v_position:=0;
    for v_member in
      select m.teacher_id,m.rotation_offset,p.full_name
      from public.teacher_duty_cycle_members m
      join public.profiles p on p.user_id=m.teacher_id
      where m.active=true and m.weekday=extract(isodow from v_day)::smallint
      order by p.full_name,m.teacher_id
    loop
      v_position:=v_position+1;
      insert into public.teacher_duty_assignments(duty_date,teacher_id,duty_location,assignment_source)
      values(v_day,v_member.teacher_id,v_locations[((v_position-1+v_week_index+v_member.rotation_offset)%v_location_count)+1],'monthly_cycle')
      on conflict(duty_date,teacher_id) do nothing;
      if found then v_count:=v_count+1; end if;
    end loop;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.generate_monthly_teacher_duties(date,boolean) from public;
grant execute on function public.generate_monthly_teacher_duties(date,boolean) to authenticated;