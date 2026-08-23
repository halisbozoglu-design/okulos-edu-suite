-- OkulOS official course pool: school/program/grade/year-aware offerings,
-- hour options, repeat-across-years guard and block preference foundation.

alter table public.school_classes add column if not exists academic_year_id uuid references public.academic_years(id) on delete set null;
alter table public.school_classes add column if not exists predecessor_class_id uuid references public.school_classes(id) on delete set null;
update public.school_classes c set academic_year_id=y.id from public.academic_years y where c.academic_year_id is null and y.active=true and y.institution_code=c.institution_code;
create index if not exists idx_school_classes_year on public.school_classes(institution_code,academic_year_id,grade_level);

create table if not exists public.course_offering_rules(
 id uuid primary key default gen_random_uuid(), institution_code text not null default public.current_tenant_code() references public.institutions(institution_code) on delete restrict,
 academic_year text not null, school_level text, program_type text, grade_level smallint not null,
 course_id uuid not null references public.course_catalog(id) on delete cascade,
 category text not null check(category in('zorunlu','secmeli','rehberlik','uygulama','diger')),
 hour_options smallint[] not null default '{1}', max_selections smallint not null default 1,
 repeat_across_years boolean not null default true, elective_group_key text, source_note text, source_file_name text,
 active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(institution_code,academic_year,program_type,grade_level,course_id)
);
alter table public.course_offering_rules enable row level security;
drop policy if exists "course_offering_rules_read" on public.course_offering_rules;
create policy "course_offering_rules_read" on public.course_offering_rules for select to authenticated using(public.tenant_row_allowed(institution_code));
drop policy if exists "course_offering_rules_manage" on public.course_offering_rules;
create policy "course_offering_rules_manage" on public.course_offering_rules for all to authenticated using(public.tenant_row_allowed(institution_code) and public.has_any_module_permission('curriculum')) with check(public.tenant_row_allowed(institution_code) and public.has_any_module_permission('curriculum'));

alter table public.class_course_requirements add column if not exists academic_year_id uuid references public.academic_years(id) on delete set null;
alter table public.class_course_requirements add column if not exists offering_rule_id uuid references public.course_offering_rules(id) on delete set null;
alter table public.class_course_requirements add column if not exists source_kind text not null default 'official' check(source_kind in('official','local','override'));
update public.class_course_requirements r set academic_year_id=c.academic_year_id from public.school_classes c where r.class_id=c.id and r.academic_year_id is null;

create table if not exists public.course_block_preferences(
 id uuid primary key default gen_random_uuid(), institution_code text not null default public.current_tenant_code() references public.institutions(institution_code) on delete restrict,
 class_course_requirement_id uuid not null references public.class_course_requirements(id) on delete cascade,
 priority smallint not null check(priority between 1 and 20), block_pattern smallint[] not null,
 active boolean not null default true, created_at timestamptz not null default now(),
 unique(class_course_requirement_id,priority)
);
alter table public.course_block_preferences enable row level security;
drop policy if exists "course_block_preferences_read" on public.course_block_preferences;
create policy "course_block_preferences_read" on public.course_block_preferences for select to authenticated using(public.tenant_row_allowed(institution_code));
drop policy if exists "course_block_preferences_manage" on public.course_block_preferences;
create policy "course_block_preferences_manage" on public.course_block_preferences for all to authenticated using(public.tenant_row_allowed(institution_code) and public.has_any_module_permission('schedule')) with check(public.tenant_row_allowed(institution_code) and public.has_any_module_permission('schedule'));

create or replace function public.get_class_course_pool_v1(p_class_id uuid)
returns table(course_id uuid,course_name text,short_name text,category text,hour_options smallint[],repeat_across_years boolean,elective_group_key text,eligible boolean,reason text,already_assigned boolean,current_hours smallint,planned_hours integer,expected_hours smallint)
language sql stable security definer set search_path=public as $$
with cls as (
 select c.*,y.code academic_year_code from school_classes c left join academic_years y on y.id=c.academic_year_id where c.id=p_class_id and tenant_row_allowed(c.institution_code)
), planned as (select coalesce(sum(r.weekly_hours),0)::int h from class_course_requirements r join cls c on c.id=r.class_id), prev as (
 with recursive chain as (select predecessor_class_id id from cls union all select c.predecessor_class_id from school_classes c join chain x on c.id=x.id where x.id is not null)
 select distinct r.course_id from chain x join class_course_requirements r on r.class_id=x.id
)
select o.course_id,cc.name,cc.short_name,o.category,o.hour_options,o.repeat_across_years,o.elective_group_key,
 case when r.id is not null then false when not o.repeat_across_years and p.course_id is not null then false else true end,
 case when r.id is not null then 'Bu sınıfa zaten atanmış.' when not o.repeat_across_years and p.course_id is not null then 'Önceki eğitim-öğretim yılında okutuldu; tekrar alınamaz.' else null end,
 r.id is not null,r.weekly_hours,pl.h,c.expected_weekly_hours
from cls c join course_offering_rules o on o.institution_code=c.institution_code and o.active=true and o.grade_level=c.grade_level and (o.program_type is null or o.program_type=c.program_type) and o.academic_year=c.academic_year_code
join course_catalog cc on cc.id=o.course_id and cc.active=true
left join class_course_requirements r on r.class_id=c.id and r.course_id=o.course_id
left join prev p on p.course_id=o.course_id cross join planned pl
order by case o.category when 'zorunlu' then 0 else 1 end,cc.name;
$$;
grant execute on function public.get_class_course_pool_v1(uuid) to authenticated;

create or replace function public.assign_class_course_from_pool_v1(p_class_id uuid,p_course_id uuid,p_hours smallint)
returns uuid language plpgsql security definer set search_path=public as $$
declare v record; v_rule course_offering_rules%rowtype; v_id uuid; v_planned int;
begin
 if not has_any_module_permission('curriculum') then raise exception 'NOT_AUTHORIZED'; end if;
 select c.*,y.code academic_year_code into v from school_classes c join academic_years y on y.id=c.academic_year_id where c.id=p_class_id and tenant_row_allowed(c.institution_code);
 if not found then raise exception 'CLASS_NOT_FOUND_OR_YEAR_MISSING'; end if;
 select * into v_rule from course_offering_rules where institution_code=v.institution_code and academic_year=v.academic_year_code and grade_level=v.grade_level and course_id=p_course_id and active=true and (program_type is null or program_type=v.program_type) order by program_type nulls last limit 1;
 if not found then raise exception 'COURSE_NOT_ALLOWED_FOR_CLASS'; end if;
 if not (p_hours=any(v_rule.hour_options)) then raise exception 'INVALID_HOUR_OPTION'; end if;
 if not v_rule.repeat_across_years and exists(with recursive chain as (select v.predecessor_class_id id union all select c.predecessor_class_id from school_classes c join chain x on c.id=x.id where x.id is not null) select 1 from chain x join class_course_requirements r on r.class_id=x.id where r.course_id=p_course_id) then raise exception 'COURSE_ALREADY_TAKEN_PREVIOUS_YEAR'; end if;
 select coalesce(sum(weekly_hours),0) into v_planned from class_course_requirements where class_id=p_class_id and course_id<>p_course_id;
 if v.expected_weekly_hours is not null and v_planned+p_hours>v.expected_weekly_hours then raise exception 'CLASS_MAX_WEEKLY_HOURS_EXCEEDED'; end if;
 insert into class_course_requirements(class_id,course_id,weekly_hours,category,academic_year_id,offering_rule_id,source_kind,institution_code)
 values(p_class_id,p_course_id,p_hours,v_rule.category,v.academic_year_id,v_rule.id,'official',v.institution_code)
 on conflict(class_id,course_id) do update set weekly_hours=excluded.weekly_hours,category=excluded.category,academic_year_id=excluded.academic_year_id,offering_rule_id=excluded.offering_rule_id,source_kind='official',updated_at=now()
 returning id into v_id;
 perform refresh_class_curriculum_status(p_class_id); return v_id;
end $$;
grant execute on function public.assign_class_course_from_pool_v1(uuid,uuid,smallint) to authenticated;
