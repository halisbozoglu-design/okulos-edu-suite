-- Preserve same-day timetable revisions without producing invalid validity periods.
-- The exact order of evidence is effective date + publish timestamp + immutable hash.

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

-- Audit helper: returns every immutable version in the exact order it was put into use.
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
