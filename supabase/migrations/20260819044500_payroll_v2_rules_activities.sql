-- Ek Ders 2.0: versioned rule registry + approved activity inputs + central calendar sync.
-- Monetary/rate rules are data, not hard-coded law assumptions.

alter table public.payroll_day_entries drop constraint if exists payroll_day_entries_category_check;
alter table public.payroll_day_entries add constraint payroll_day_entries_category_check check (category in (
  'gunduz','nobet','rehberlik','hazirlik_planlama','dyk','destek_egitim','seminer','kurs','egzersiz','gece_haftasonu','yonetim','diger'
));

alter table public.payroll_day_entries drop constraint if exists payroll_day_entries_source_type_check;
alter table public.payroll_day_entries add constraint payroll_day_entries_source_type_check check (source_type in (
  'schedule','substitute','duty','guidance','holiday_rule','admin_leave','manual_adjustment','activity','calendar_rule'
));

alter table public.payroll_day_entries
  add column if not exists rule_code text,
  add column if not exists rate_multiplier numeric(6,3) not null default 1.000 check(rate_multiplier > 0),
  add column if not exists evidence_note text;

create table if not exists public.payroll_rule_registry (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  category text not null check (category in (
    'gunduz','nobet','rehberlik','hazirlik_planlama','dyk','destek_egitim','seminer','kurs','egzersiz','gece_haftasonu','yonetim','diger'
  )),
  kbs_data_type text not null,
  rate_multiplier numeric(6,3) not null default 1.000 check(rate_multiplier > 0),
  weekly_cap_hours numeric(5,2),
  monthly_cap_hours numeric(6,2),
  requires_actual_performance boolean not null default true,
  source_id uuid references public.legal_rule_sources(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  condition_note text,
  active boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  check(effective_to is null or effective_to >= effective_from),
  unique(code,effective_from)
);

create table if not exists public.payroll_activity_entries (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  activity_date date not null,
  category text not null check (category in (
    'hazirlik_planlama','dyk','destek_egitim','seminer','kurs','egzersiz','gece_haftasonu','yonetim','diger'
  )),
  hours numeric(5,2) not null check(hours > 0 and hours <= 24),
  rule_id uuid references public.payroll_rule_registry(id) on delete restrict,
  explanation text,
  evidence_reference text,
  status text not null default 'draft' check(status in ('draft','submitted','approved','rejected')),
  entered_by uuid references public.profiles(user_id) on delete set null,
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payroll_rule_registry_effective on public.payroll_rule_registry(category,effective_from,effective_to);
create index if not exists idx_payroll_activity_month on public.payroll_activity_entries(activity_date,teacher_id,status);

alter table public.payroll_rule_registry enable row level security;
alter table public.payroll_activity_entries enable row level security;

grant select on public.payroll_rule_registry,public.payroll_activity_entries to authenticated;
grant insert,update,delete on public.payroll_rule_registry,public.payroll_activity_entries to authenticated;

create policy "authenticated read payroll rules" on public.payroll_rule_registry for select to authenticated using(true);
create policy "managers manage payroll rules" on public.payroll_rule_registry for all to authenticated
using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "users read relevant payroll activities" on public.payroll_activity_entries for select to authenticated
using(teacher_id=auth.uid() or public.is_manager_or_admin());
create policy "managers manage payroll activities" on public.payroll_activity_entries for all to authenticated
using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());

create or replace function public.approve_payroll_activity(p_activity_id uuid,p_approve boolean default true)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  update public.payroll_activity_entries
  set status=case when p_approve then 'approved' else 'rejected' end,
      approved_by=auth.uid(),approved_at=now(),updated_at=now()
  where id=p_activity_id;
  return found;
end;
$$;
revoke all on function public.approve_payroll_activity(uuid,boolean) from public;
grant execute on function public.approve_payroll_activity(uuid,boolean) to authenticated;

create or replace function public.sync_payroll_calendar_from_academic_year(p_year int,p_month int)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_start date:=make_date(p_year,p_month,1);
  v_end date:=(make_date(p_year,p_month,1)+interval '1 month - 1 day')::date;
  v_ay public.academic_years%rowtype;
  v_day date;
  v_type text;
  v_title text;
  v_count integer:=0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select * into v_ay from public.academic_years where active=true limit 1;
  if not found then raise exception 'ACTIVE_ACADEMIC_YEAR_REQUIRED'; end if;

  for v_day in select generate_series(v_start::timestamp,v_end::timestamp,interval '1 day')::date loop
    if v_day < v_ay.starts_on or v_day > v_ay.ends_on then continue; end if;

    if exists(select 1 from public.school_calendar_events e where e.academic_year_id=v_ay.id and e.event_type='holiday' and v_day between e.starts_on and e.ends_on) then
      v_type:='official_holiday';
    elsif exists(select 1 from public.school_calendar_events e where e.academic_year_id=v_ay.id and e.event_type='break' and e.blocks_teaching=true and v_day between e.starts_on and e.ends_on) then
      v_type:='school_closed';
    else
      v_type:='workday';
    end if;

    select string_agg(e.title,' / ' order by e.title) into v_title
    from public.school_calendar_events e where e.academic_year_id=v_ay.id and v_day between e.starts_on and e.ends_on;

    insert into public.payroll_calendar(calendar_date,day_type,title,deemed_regular_performed,deemed_guidance_performed,duty_payable,source_note)
    values(v_day,v_type,coalesce(v_title,'Merkezi çalışma takvimi'),false,false,v_type='workday','Akademik takvim motorundan üretildi')
    on conflict(calendar_date) do update set
      day_type=case when public.payroll_calendar.approved_at is null then excluded.day_type else public.payroll_calendar.day_type end,
      title=case when public.payroll_calendar.approved_at is null then excluded.title else public.payroll_calendar.title end,
      duty_payable=case when public.payroll_calendar.approved_at is null then excluded.duty_payable else public.payroll_calendar.duty_payable end,
      source_note=case when public.payroll_calendar.approved_at is null then excluded.source_note else public.payroll_calendar.source_note end;
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.sync_payroll_calendar_from_academic_year(int,int) from public;
grant execute on function public.sync_payroll_calendar_from_academic_year(int,int) to authenticated;

create or replace function public.apply_approved_payroll_activities(p_year int,p_month int,p_run_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_start date:=make_date(p_year,p_month,1);
  v_end date:=(make_date(p_year,p_month,1)+interval '1 month - 1 day')::date;
  v_rec record;
  v_rule public.payroll_rule_registry%rowtype;
  v_count integer:=0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  for v_rec in
    select a.* from public.payroll_activity_entries a
    where a.activity_date between v_start and v_end and a.status='approved'
    order by a.activity_date,a.teacher_id
  loop
    if v_rec.rule_id is not null then
      select * into v_rule from public.payroll_rule_registry r
      where r.id=v_rec.rule_id and r.active=true and r.effective_from<=v_rec.activity_date and (r.effective_to is null or r.effective_to>=v_rec.activity_date);
      if not found then raise exception 'PAYROLL_RULE_NOT_EFFECTIVE: %',v_rec.id; end if;
    else
      select * into v_rule from public.payroll_rule_registry r
      where r.category=v_rec.category and r.active=true and r.effective_from<=v_rec.activity_date and (r.effective_to is null or r.effective_to>=v_rec.activity_date)
      order by r.effective_from desc limit 1;
      if not found then raise exception 'PAYROLL_RULE_MISSING_FOR_CATEGORY: %',v_rec.category; end if;
    end if;

    insert into public.payroll_day_entries(teacher_id,work_date,category,hours,source_type,source_id,kbs_data_type,explanation,calculated,rule_code,rate_multiplier,evidence_note)
    values(v_rec.teacher_id,v_rec.activity_date,v_rec.category,v_rec.hours,'activity',v_rec.id,v_rule.kbs_data_type,
      coalesce(v_rec.explanation,v_rule.name),true,v_rule.code,v_rule.rate_multiplier,v_rec.evidence_reference)
    on conflict(teacher_id,work_date,category,source_type,source_id) do update set
      hours=excluded.hours,kbs_data_type=excluded.kbs_data_type,explanation=excluded.explanation,rule_code=excluded.rule_code,
      rate_multiplier=excluded.rate_multiplier,evidence_note=excluded.evidence_note,calculated=true;
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.apply_approved_payroll_activities(int,int,uuid) from public;
grant execute on function public.apply_approved_payroll_activities(int,int,uuid) to authenticated;

create or replace function public.recalculate_payroll_month_v2(p_year int,p_month int)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_run uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  perform public.sync_payroll_calendar_from_academic_year(p_year,p_month);
  v_run:=public.recalculate_payroll_month(p_year,p_month);
  perform public.apply_approved_payroll_activities(p_year,p_month,v_run);
  return v_run;
end;
$$;
revoke all on function public.recalculate_payroll_month_v2(int,int) from public;
grant execute on function public.recalculate_payroll_month_v2(int,int) to authenticated;
