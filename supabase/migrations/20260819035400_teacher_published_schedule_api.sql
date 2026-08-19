-- Canonical teacher-facing timetable API.
-- Teacher clients must read published evidence snapshots, never mutable teacher_schedule drafts.

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
