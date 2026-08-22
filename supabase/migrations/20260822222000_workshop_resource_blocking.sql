begin;

alter table public.class_course_requirements
  add column if not exists delivery_mode text,
  add column if not exists workshop_required boolean not null default false;

create table if not exists public.class_course_workshop_options (
  requirement_id uuid not null references public.class_course_requirements(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  priority smallint not null default 1,
  active boolean not null default true,
  primary key(requirement_id,classroom_id)
);
create index if not exists idx_ccwo_tenant on public.class_course_workshop_options(institution_code,requirement_id) where active;
alter table public.class_course_workshop_options enable row level security;
drop policy if exists tenant_boundary_ccwo on public.class_course_workshop_options;
create policy tenant_boundary_ccwo on public.class_course_workshop_options for all using(public.tenant_row_allowed(institution_code)) with check(public.tenant_row_allowed(institution_code));
drop policy if exists managers_manage_ccwo on public.class_course_workshop_options;
create policy managers_manage_ccwo on public.class_course_workshop_options for all using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

alter table public.schedule_workshop_policies
  add column if not exists minimize_fragmentation boolean not null default true,
  add column if not exists forbid_all_small_blocks boolean not null default true,
  add column if not exists setup_cleanup_weight integer not null default 100,
  add column if not exists resource_balance_weight integer not null default 50;

create or replace function public.workshop_block_patterns(p_total smallint,p_daily_capacity smallint)
returns table(pattern smallint[],part_count smallint)
language sql immutable as $$
with recursive x(rem, arr, last_part) as (
  select p_total::int, array[]::smallint[], least(p_total,p_daily_capacity)::int
  union all
  select x.rem-v, x.arr||v::smallint, v
  from x
  cross join lateral generate_series(least(x.last_part,p_daily_capacity::int,x.rem),1,-1) v
  where x.rem>0
    and (v>=3 or (array_length(x.arr,1) is null and v=x.rem))
    and x.rem-v>=0
), ok as (
  select arr
  from x
  where rem=0
    and array_length(arr,1) is not null
    and not (array_length(arr,1)>1 and (select bool_and(z<=2) from unnest(arr) z))
)
select arr, array_length(arr,1)::smallint
from ok
order by array_length(arr,1), arr desc;
$$;

create table if not exists public.class_enterprise_week_patterns (
  class_id uuid primary key references public.school_classes(id) on delete cascade,
  institution_code text not null references public.institutions(institution_code) on delete cascade,
  enterprise_weekly_hours smallint not null check(enterprise_weekly_hours>=0),
  enterprise_hours_per_day smallint not null default 8 check(enterprise_hours_per_day>0),
  enterprise_day_count smallint generated always as (case when enterprise_weekly_hours=0 then 0 else ((enterprise_weekly_hours + enterprise_hours_per_day - 1)/enterprise_hours_per_day)::smallint end) stored,
  movable_days boolean not null default true,
  consecutive_days_required boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists idx_class_enterprise_pattern_tenant on public.class_enterprise_week_patterns(institution_code) where active;
alter table public.class_enterprise_week_patterns enable row level security;
drop policy if exists tenant_boundary_class_enterprise_patterns on public.class_enterprise_week_patterns;
create policy tenant_boundary_class_enterprise_patterns on public.class_enterprise_week_patterns for all using(public.tenant_row_allowed(institution_code)) with check(public.tenant_row_allowed(institution_code));
drop policy if exists managers_manage_class_enterprise_patterns on public.class_enterprise_week_patterns;
create policy managers_manage_class_enterprise_patterns on public.class_enterprise_week_patterns for all using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

commit;
