-- Norm mapping integrity: exactly one current course->area and one current area->rule mapping is required.

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
    (select count(*) from public.norm_course_area_rules n
      where n.course_id=uc.course_id and n.active=true
        and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)) map_count
  from used_courses uc
), unique_areas as (
  select distinct n.teaching_area_id
  from course_map cm
  join public.norm_course_area_rules n on n.course_id=cm.course_id
    and n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
  where cm.map_count=1
), area_map as (
  select ua.teaching_area_id,
    (select count(*) from public.norm_area_rule_assignments a
      where a.teaching_area_id=ua.teaching_area_id and a.active=true
        and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)) map_count
  from unique_areas ua
)
select
  coalesce((select count(*) from course_map where map_count<>1),0)::integer,
  coalesce((select count(*) from area_map where map_count<>1),0)::integer,
  coalesce((select count(*) from course_map where map_count=1),0)::integer,
  coalesce((select count(*) from area_map where map_count=1),0)::integer,
  not exists(select 1 from course_map where map_count<>1)
    and not exists(select 1 from area_map where map_count<>1);
$$;

create or replace function public.get_norm_missing_mappings(p_on_date date default current_date)
returns table(item_type text,item_id uuid,item_name text,detail text)
language sql
stable
security definer
set search_path=public
as $$
with used_courses as (
  select distinct r.course_id,cc.name
  from public.class_course_requirements r
  join public.school_classes c on c.id=r.class_id and c.active=true
  join public.course_catalog cc on cc.id=r.course_id
), course_counts as (
  select uc.course_id,uc.name,
    (select count(*) from public.norm_course_area_rules n
      where n.course_id=uc.course_id and n.active=true
        and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)) map_count
  from used_courses uc
), bad_courses as (
  select 'COURSE_AREA'::text item_type,course_id item_id,name item_name,
    case when map_count=0 then 'Dersin hangi norm alanına sayılacağı tanımlanmamış'
         else 'Ders için aynı tarihte birden fazla norm alanı tanımlı; tek eşleşmeye düşürülmeli' end::text detail
  from course_counts where map_count<>1
), unique_areas as (
  select distinct n.teaching_area_id,ta.name
  from course_counts cc
  join public.norm_course_area_rules n on n.course_id=cc.course_id and cc.map_count=1
    and n.active=true and n.effective_from<=p_on_date and (n.effective_to is null or n.effective_to>=p_on_date)
  join public.teaching_areas ta on ta.id=n.teaching_area_id
), area_counts as (
  select ua.teaching_area_id,ua.name,
    (select count(*) from public.norm_area_rule_assignments a
      where a.teaching_area_id=ua.teaching_area_id and a.active=true
        and a.effective_from<=p_on_date and (a.effective_to is null or a.effective_to>=p_on_date)) map_count
  from unique_areas ua
), bad_areas as (
  select 'AREA_RULE'::text item_type,teaching_area_id item_id,name item_name,
    case when map_count=0 then 'Alan için yürürlükte norm kural seti tanımlanmamış'
         else 'Alan için aynı tarihte birden fazla norm kural seti tanımlı; tek eşleşmeye düşürülmeli' end::text detail
  from area_counts where map_count<>1
)
select * from bad_courses
union all select * from bad_areas
order by item_type,item_name;
$$;
