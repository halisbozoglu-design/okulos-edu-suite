-- Date-scoped bell clocks keep canonical period identity stable while allowing
-- odd/even week, term or bounded-date clock changes. No solver slot is duplicated.
create table if not exists public.schedule_period_clock_variants(
 id uuid primary key default gen_random_uuid(),
 institution_code text not null default public.current_tenant_code() references public.institutions(institution_code) on delete restrict,
 period_definition_id uuid not null references public.schedule_period_definitions(id) on delete cascade,
 week_pattern text not null default 'ALL' check(week_pattern in('ALL','ODD','EVEN')),
 term_no smallint check(term_no is null or term_no in(1,2)),
 valid_from date,
 valid_to date,
 starts_at time not null,
 ends_at time not null,
 teaching_minutes smallint,
 priority smallint not null default 0,
 active boolean not null default true,
 created_by uuid references public.profiles(user_id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(valid_from is null or valid_to is null or valid_from<=valid_to),
 check(ends_at>starts_at),
 check(teaching_minutes is null or teaching_minutes between 1 and 180)
);
create index if not exists idx_schedule_period_clock_variants_resolve on public.schedule_period_clock_variants(institution_code,period_definition_id,active,priority desc);
create unique index if not exists uq_schedule_period_clock_variant_exact_scope on public.schedule_period_clock_variants(institution_code,period_definition_id,week_pattern,coalesce(term_no,0),coalesce(valid_from,'0001-01-01'::date),coalesce(valid_to,'9999-12-31'::date),priority) where active;
alter table public.schedule_period_clock_variants enable row level security;
drop policy if exists schedule_period_clock_variants_read on public.schedule_period_clock_variants;
create policy schedule_period_clock_variants_read on public.schedule_period_clock_variants for select to authenticated using(public.tenant_row_allowed(institution_code));
drop policy if exists schedule_period_clock_variants_manage on public.schedule_period_clock_variants;
create policy schedule_period_clock_variants_manage on public.schedule_period_clock_variants for all to authenticated using((public.has_permission('schedule.rules') or public.has_permission('schedule.edit') or public.is_manager_or_admin()) and public.tenant_row_allowed(institution_code)) with check((public.has_permission('schedule.rules') or public.has_permission('schedule.edit') or public.is_manager_or_admin()) and public.tenant_row_allowed(institution_code));

create or replace function public.schedule_term_applies_on_date_v1(p_term_no smallint,p_date date) returns boolean language sql stable security definer set search_path=public as $$
 select case when p_term_no is null then true when p_term_no=1 then exists(select 1 from public.academic_years y where y.active and public.tenant_row_allowed(y.institution_code) and y.teaching_starts_on is not null and y.first_term_ends_on is not null and p_date between y.teaching_starts_on and y.first_term_ends_on) when p_term_no=2 then exists(select 1 from public.academic_years y where y.active and public.tenant_row_allowed(y.institution_code) and y.second_term_starts_on is not null and y.teaching_ends_on is not null and p_date between y.second_term_starts_on and y.teaching_ends_on) else false end
$$;

create or replace function public.schedule_clock_variant_scopes_overlap_v1(p_a uuid,p_b uuid) returns boolean language plpgsql stable security definer set search_path=public as $$
declare a public.schedule_period_clock_variants%rowtype;b public.schedule_period_clock_variants%rowtype;y public.academic_years%rowtype;af date;at date;bf date;bt date;
begin
 select * into a from public.schedule_period_clock_variants where id=p_a and public.tenant_row_allowed(institution_code);
 select * into b from public.schedule_period_clock_variants where id=p_b and public.tenant_row_allowed(institution_code);
 if a.id is null or b.id is null then return true;end if;
 select * into y from public.academic_years where active and public.tenant_row_allowed(institution_code) order by updated_at desc limit 1;
 af:=coalesce(a.valid_from,y.teaching_starts_on,y.starts_on);at:=coalesce(a.valid_to,y.teaching_ends_on,y.ends_on);bf:=coalesce(b.valid_from,y.teaching_starts_on,y.starts_on);bt:=coalesce(b.valid_to,y.teaching_ends_on,y.ends_on);
 if af is not null and bt is not null and af>bt then return false;end if;if bf is not null and at is not null and bf>at then return false;end if;
 if a.term_no is not null and b.term_no is not null and a.term_no<>b.term_no then return false;end if;
 if(a.week_pattern='ODD' and b.week_pattern='EVEN')or(a.week_pattern='EVEN' and b.week_pattern='ODD')then return false;end if;
 return true;
end$$;

create or replace function public.guard_schedule_period_clock_variant_v1() returns trigger language plpgsql security definer set search_path=public as $$
declare x uuid;
begin
 if not public.tenant_row_allowed(new.institution_code) then raise exception 'TENANT_MISMATCH';end if;
 if not exists(select 1 from public.schedule_period_definitions d where d.id=new.period_definition_id and d.institution_code=new.institution_code and public.tenant_row_allowed(d.institution_code))then raise exception 'PERIOD_DEFINITION_NOT_FOUND_IN_TENANT';end if;
 if new.teaching_minutes is null then new.teaching_minutes:=round(extract(epoch from(new.ends_at-new.starts_at))/60)::smallint;end if;
 if new.active then select v.id into x from public.schedule_period_clock_variants v where v.active and v.period_definition_id=new.period_definition_id and v.institution_code=new.institution_code and v.priority=new.priority and v.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid) and public.schedule_clock_variant_scopes_overlap_v1(v.id,new.id) limit 1;end if;
 -- NEW is not query-visible in a BEFORE INSERT. Re-check overlap directly when needed.
 if new.active and x is null then select v.id into x from public.schedule_period_clock_variants v where v.active and v.period_definition_id=new.period_definition_id and v.institution_code=new.institution_code and v.priority=new.priority and v.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid) and not(coalesce(v.valid_to,'9999-12-31'::date)<coalesce(new.valid_from,'0001-01-01'::date) or coalesce(new.valid_to,'9999-12-31'::date)<coalesce(v.valid_from,'0001-01-01'::date)) and not(v.term_no is not null and new.term_no is not null and v.term_no<>new.term_no) and not((v.week_pattern='ODD' and new.week_pattern='EVEN')or(v.week_pattern='EVEN' and new.week_pattern='ODD')) limit 1;end if;
 if x is not null then raise exception 'AMBIGUOUS_BELL_CLOCK_SCOPE';end if;
 new.updated_at:=now();return new;
end$$;
drop trigger if exists trg_schedule_period_clock_variant_v1 on public.schedule_period_clock_variants;
create trigger trg_schedule_period_clock_variant_v1 before insert or update on public.schedule_period_clock_variants for each row execute function public.guard_schedule_period_clock_variant_v1();

create or replace function public.get_schedule_period_clock_for_date_v1(p_session uuid,p_period smallint,p_date date default current_date)
returns table(period_definition_id uuid,starts_at time,ends_at time,teaching_minutes smallint,clock_source text,week_pattern text,term_no smallint) language sql stable security definer set search_path=public as $$
 with d as(select * from public.schedule_period_definitions where session_id=p_session and period=p_period and active and public.tenant_row_allowed(institution_code) limit 1),v as(select x.* from public.schedule_period_clock_variants x join d on d.id=x.period_definition_id where x.active and public.tenant_row_allowed(x.institution_code) and(x.valid_from is null or p_date>=x.valid_from)and(x.valid_to is null or p_date<=x.valid_to)and public.schedule_week_pattern_applies_v1(x.week_pattern,p_date)and public.schedule_term_applies_on_date_v1(x.term_no,p_date) order by x.priority desc,(case when x.valid_from is not null then 1 else 0 end+case when x.valid_to is not null then 1 else 0 end+case when x.term_no is not null then 1 else 0 end+case when x.week_pattern<>'ALL' then 1 else 0 end)desc,x.updated_at desc,x.id limit 1)
 select d.id,coalesce(v.starts_at,d.starts_at),coalesce(v.ends_at,d.ends_at),coalesce(v.teaching_minutes,d.teaching_minutes),case when v.id is null then 'BASE' else 'VARIANT' end,coalesce(v.week_pattern,'ALL'),v.term_no from d left join v on true
$$;

create or replace function public.schedule_slots_overlap_on_date_v1(p_session_a uuid,p_period_a smallint,p_session_b uuid,p_period_b smallint,p_date date default current_date) returns text language plpgsql stable security definer set search_path=public as $$
declare a record;b record;
begin
 select * into a from public.get_schedule_period_clock_for_date_v1(p_session_a,p_period_a,p_date);select * into b from public.get_schedule_period_clock_for_date_v1(p_session_b,p_period_b,p_date);
 if a.period_definition_id is null or b.period_definition_id is null or a.starts_at is null or a.ends_at is null or b.starts_at is null or b.ends_at is null then if p_session_a=p_session_b then return case when p_period_a=p_period_b then 'OVERLAP' else 'NO_OVERLAP'end;else return 'UNKNOWN';end if;end if;
 return case when a.starts_at<b.ends_at and b.starts_at<a.ends_at then 'OVERLAP' else 'NO_OVERLAP'end;
end$$;

create or replace function public.get_teacher_schedule_for_date_v2(p_teacher uuid,p_date date default current_date)
returns table(source_schedule_id uuid,teacher_assignment_id uuid,period smallint,class_id uuid,class_name text,subject text,course_id uuid,classroom_id uuid,subgroup_id uuid,schedule_session_id uuid,starts_at time,ends_at time,teaching_minutes smallint,clock_source text) language sql stable security definer set search_path=public as $$
 select s.source_schedule_id,s.teacher_assignment_id,s.period,s.class_id,s.class_name,s.subject,s.course_id,s.classroom_id,s.subgroup_id,s.schedule_session_id,c.starts_at,c.ends_at,c.teaching_minutes,c.clock_source from public.get_teacher_schedule_for_date_v1(p_teacher,p_date)s left join lateral public.get_schedule_period_clock_for_date_v1(s.schedule_session_id,s.period,p_date)c on true order by s.period
$$;

revoke all on table public.schedule_period_clock_variants from anon;grant select,insert,update,delete on table public.schedule_period_clock_variants to authenticated;
revoke all on function public.schedule_term_applies_on_date_v1(smallint,date),public.schedule_clock_variant_scopes_overlap_v1(uuid,uuid),public.guard_schedule_period_clock_variant_v1(),public.get_schedule_period_clock_for_date_v1(uuid,smallint,date),public.schedule_slots_overlap_on_date_v1(uuid,smallint,uuid,smallint,date),public.get_teacher_schedule_for_date_v2(uuid,date) from public,anon;
grant execute on function public.get_schedule_period_clock_for_date_v1(uuid,smallint,date),public.schedule_slots_overlap_on_date_v1(uuid,smallint,uuid,smallint,date),public.get_teacher_schedule_for_date_v2(uuid,date) to authenticated;