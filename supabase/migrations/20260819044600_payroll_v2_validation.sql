-- Payroll v2 hardening: rule/date/category/cap validation and correct weekend calendar sync.

create or replace function public.validate_payroll_activity_entry()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_rule public.payroll_rule_registry%rowtype;v_week_start date;v_week_hours numeric;v_month_hours numeric;
begin
  if new.rule_id is null then raise exception 'PAYROLL_RULE_REQUIRED'; end if;
  select * into v_rule from public.payroll_rule_registry where id=new.rule_id and active=true;
  if not found then raise exception 'PAYROLL_RULE_NOT_FOUND'; end if;
  if v_rule.category<>new.category then raise exception 'PAYROLL_RULE_CATEGORY_MISMATCH'; end if;
  if new.activity_date<v_rule.effective_from or (v_rule.effective_to is not null and new.activity_date>v_rule.effective_to) then raise exception 'PAYROLL_RULE_NOT_EFFECTIVE'; end if;
  if new.status='approved' then
    v_week_start:=date_trunc('week',new.activity_date::timestamp)::date;
    if v_rule.weekly_cap_hours is not null then
      select coalesce(sum(hours),0) into v_week_hours from public.payroll_activity_entries
      where teacher_id=new.teacher_id and category=new.category and status='approved'
        and activity_date between v_week_start and v_week_start+6 and id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
      if v_week_hours+new.hours>v_rule.weekly_cap_hours then raise exception 'PAYROLL_WEEKLY_CAP_EXCEEDED'; end if;
    end if;
    if v_rule.monthly_cap_hours is not null then
      select coalesce(sum(hours),0) into v_month_hours from public.payroll_activity_entries
      where teacher_id=new.teacher_id and category=new.category and status='approved'
        and date_trunc('month',activity_date)=date_trunc('month',new.activity_date)
        and id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
      if v_month_hours+new.hours>v_rule.monthly_cap_hours then raise exception 'PAYROLL_MONTHLY_CAP_EXCEEDED'; end if;
    end if;
  end if;
  new.updated_at:=now();return new;
end;$$;
drop trigger if exists trg_validate_payroll_activity_entry on public.payroll_activity_entries;
create trigger trg_validate_payroll_activity_entry before insert or update on public.payroll_activity_entries
for each row execute function public.validate_payroll_activity_entry();

create or replace function public.sync_payroll_calendar_from_academic_year(p_year int,p_month int)
returns integer language plpgsql security definer set search_path=public as $$
declare
  v_start date:=make_date(p_year,p_month,1);v_end date:=(make_date(p_year,p_month,1)+interval '1 month - 1 day')::date;
  v_ay public.academic_years%rowtype;v_day date;v_type text;v_title text;v_count integer:=0;v_explicit_work boolean;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select * into v_ay from public.academic_years where active=true limit 1;
  if not found then raise exception 'ACTIVE_ACADEMIC_YEAR_REQUIRED'; end if;
  for v_day in select generate_series(v_start::timestamp,v_end::timestamp,interval '1 day')::date loop
    if v_day<v_ay.starts_on or v_day>v_ay.ends_on then continue; end if;
    select exists(select 1 from public.school_calendar_events e where e.academic_year_id=v_ay.id and e.counts_as_workday=true and v_day between e.starts_on and e.ends_on) into v_explicit_work;
    if exists(select 1 from public.school_calendar_events e where e.academic_year_id=v_ay.id and e.event_type='holiday' and v_day between e.starts_on and e.ends_on) then v_type:='official_holiday';
    elsif exists(select 1 from public.school_calendar_events e where e.academic_year_id=v_ay.id and e.event_type='break' and e.blocks_teaching=true and v_day between e.starts_on and e.ends_on) then v_type:='school_closed';
    elsif extract(isodow from v_day)::int in (6,7) and not v_explicit_work then v_type:='school_closed';
    else v_type:='workday'; end if;
    select string_agg(e.title,' / ' order by e.title) into v_title from public.school_calendar_events e where e.academic_year_id=v_ay.id and v_day between e.starts_on and e.ends_on;
    insert into public.payroll_calendar(calendar_date,day_type,title,deemed_regular_performed,deemed_guidance_performed,duty_payable,source_note)
    values(v_day,v_type,coalesce(v_title,case when v_type='school_closed' then 'Hafta sonu / okul kapalı' else 'Merkezi çalışma takvimi' end),false,false,v_type='workday','Akademik takvim motorundan üretildi')
    on conflict(calendar_date) do update set
      day_type=case when public.payroll_calendar.approved_at is null then excluded.day_type else public.payroll_calendar.day_type end,
      title=case when public.payroll_calendar.approved_at is null then excluded.title else public.payroll_calendar.title end,
      duty_payable=case when public.payroll_calendar.approved_at is null then excluded.duty_payable else public.payroll_calendar.duty_payable end,
      source_note=case when public.payroll_calendar.approved_at is null then excluded.source_note else public.payroll_calendar.source_note end;
    v_count:=v_count+1;
  end loop;return v_count;
end;$$;
