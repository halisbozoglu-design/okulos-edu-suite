-- OkulOS formal Norm Kadro analysis engine.
-- Formal norm is kept separate from operational teacher capacity.
-- Course -> norm area and area -> norm rule mappings are explicit/effective-dated; no legal mapping is guessed in code.

create table if not exists public.norm_course_area_rules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.course_catalog(id) on delete cascade,
  teaching_area_id uuid not null references public.teaching_areas(id) on delete cascade,
  source_id uuid references public.legal_rule_sources(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  unique(course_id, teaching_area_id, effective_from)
);

create table if not exists public.norm_area_rule_assignments (
  id uuid primary key default gen_random_uuid(),
  teaching_area_id uuid not null references public.teaching_areas(id) on delete cascade,
  rule_set_id uuid not null references public.norm_rule_sets(id) on delete cascade,
  source_id uuid references public.legal_rule_sources(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  unique(teaching_area_id, rule_set_id, effective_from)
);

create index if not exists idx_norm_course_area_current
  on public.norm_course_area_rules(course_id, teaching_area_id, effective_from, effective_to)
  where active=true;
create index if not exists idx_norm_area_rule_current
  on public.norm_area_rule_assignments(teaching_area_id, effective_from, effective_to)
  where active=true;

alter table public.norm_course_area_rules enable row level security;
alter table public.norm_area_rule_assignments enable row level security;

grant select on public.norm_course_area_rules, public.norm_area_rule_assignments to authenticated;
grant insert,update,delete on public.norm_course_area_rules, public.norm_area_rule_assignments to authenticated;

create policy "authenticated read norm course area rules"
on public.norm_course_area_rules for select to authenticated using(true);
create policy "authenticated read norm area rule assignments"
on public.norm_area_rule_assignments for select to authenticated using(true);
create policy "super admin manages norm course area rules"
on public.norm_course_area_rules for all to authenticated
using(public.is_super_admin()) with check(public.is_super_admin());
create policy "super admin manages norm area rule assignments"
on public.norm_area_rule_assignments for all to authenticated
using(public.is_super_admin()) with check(public.is_super_admin());

create or replace function public.get_norm_readiness(p_on_date date default current_date)
returns table(
  missing_course_area_count integer,
  missing_area_rule_count integer,
  mapped_course_count integer,
  mapped_area_count integer,
  ready boolean
)
language sql
stable
security definer
set search_path=public
as $$
with used_courses as (
  select distinct r.course_id
  from public.class_course_requirements r
  join public.school_classes c on c.id=r.class_id and c.active=true
), course_map as (
  select uc.course_id,
         exists(
           select 1 from public.norm_course_area_rules n
           where n.course_id=uc.course_id and n.active=true
             and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
         ) mapped
  from used_courses uc
), used_areas as (
  select distinct n.teaching_area_id
  from public.norm_course_area_rules n
  join used_courses uc on uc.course_id=n.course_id
  where n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
), area_map as (
  select ua.teaching_area_id,
         exists(
           select 1 from public.norm_area_rule_assignments a
           where a.teaching_area_id=ua.teaching_area_id and a.active=true
             and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)
         ) mapped
  from used_areas ua
)
select
  coalesce((select count(*) from course_map where not mapped),0)::integer,
  coalesce((select count(*) from area_map where not mapped),0)::integer,
  coalesce((select count(*) from course_map where mapped),0)::integer,
  coalesce((select count(*) from area_map where mapped),0)::integer,
  not exists(select 1 from course_map where not mapped)
    and not exists(select 1 from area_map where not mapped);
$$;

create or replace function public.get_norm_missing_mappings(p_on_date date default current_date)
returns table(item_type text,item_id uuid,item_name text,detail text)
language sql
stable
security definer
set search_path=public
as $$
with used_courses as (
  select distinct r.course_id, cc.name
  from public.class_course_requirements r
  join public.school_classes c on c.id=r.class_id and c.active=true
  join public.course_catalog cc on cc.id=r.course_id
), missing_courses as (
  select 'COURSE_AREA'::text item_type, uc.course_id item_id, uc.name item_name,
         'Dersin hangi norm alanına sayılacağı tanımlanmamış'::text detail
  from used_courses uc
  where not exists(
    select 1 from public.norm_course_area_rules n
    where n.course_id=uc.course_id and n.active=true
      and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
  )
), used_areas as (
  select distinct n.teaching_area_id, ta.name
  from public.norm_course_area_rules n
  join used_courses uc on uc.course_id=n.course_id
  join public.teaching_areas ta on ta.id=n.teaching_area_id
  where n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
), missing_rules as (
  select 'AREA_RULE'::text item_type, ua.teaching_area_id item_id, ua.name item_name,
         'Alan için yürürlükte norm kural seti tanımlanmamış'::text detail
  from used_areas ua
  where not exists(
    select 1 from public.norm_area_rule_assignments a
    where a.teaching_area_id=ua.teaching_area_id and a.active=true
      and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)
  )
)
select * from missing_courses
union all
select * from missing_rules
order by item_type,item_name;
$$;

create or replace function public.get_formal_norm_analysis(p_on_date date default current_date)
returns table(
  teaching_area_id uuid,
  teaching_area_name text,
  total_weekly_hours integer,
  rule_set_id uuid,
  rule_set_name text,
  formal_norm integer,
  active_teacher_count integer,
  operational_difference integer,
  status text
)
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_ready record;
begin
  select * into v_ready from public.get_norm_readiness(p_on_date);
  if not coalesce(v_ready.ready,false) then
    raise exception 'NORM_MAPPING_INCOMPLETE';
  end if;

  return query
  with area_load as (
    select n.teaching_area_id, sum(r.weekly_hours)::integer total_hours
    from public.class_course_requirements r
    join public.school_classes c on c.id=r.class_id and c.active=true
    join public.norm_course_area_rules n on n.course_id=r.course_id
      and n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
    group by n.teaching_area_id
  ), area_rule as (
    select distinct on (a.teaching_area_id)
      a.teaching_area_id,a.rule_set_id
    from public.norm_area_rule_assignments a
    where a.active=true and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)
    order by a.teaching_area_id,a.effective_from desc,a.created_at desc
  ), teacher_counts as (
    select p.teaching_area_id,count(*)::integer cnt
    from public.profiles p
    where p.role='teacher' and p.teaching_area_id is not null
    group by p.teaching_area_id
  )
  select
    al.teaching_area_id,
    ta.name,
    al.total_hours,
    ar.rule_set_id,
    rs.name,
    public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) formal_norm,
    coalesce(tc.cnt,0) active_teacher_count,
    coalesce(tc.cnt,0)-public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) operational_difference,
    case
      when coalesce(tc.cnt,0) < public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) then 'TEACHER_DEFICIT'
      when coalesce(tc.cnt,0) > public.calculate_norm_from_rule(ar.rule_set_id,al.total_hours) then 'TEACHER_SURPLUS'
      else 'BALANCED'
    end status
  from area_load al
  join public.teaching_areas ta on ta.id=al.teaching_area_id
  join area_rule ar on ar.teaching_area_id=al.teaching_area_id
  join public.norm_rule_sets rs on rs.id=ar.rule_set_id
  left join teacher_counts tc on tc.teaching_area_id=al.teaching_area_id
  order by ta.name;
end;
$$;

revoke all on function public.get_norm_readiness(date) from public;
revoke all on function public.get_norm_missing_mappings(date) from public;
revoke all on function public.get_formal_norm_analysis(date) from public;
grant execute on function public.get_norm_readiness(date) to authenticated;
grant execute on function public.get_norm_missing_mappings(date) to authenticated;
grant execute on function public.get_formal_norm_analysis(date) to authenticated;
