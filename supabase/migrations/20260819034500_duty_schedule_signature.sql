create or replace function public.current_schedule_signature()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select md5(coalesce(string_agg(
    concat_ws('|',
      ts.teacher_id::text,
      coalesce(ts.class_id::text,''),
      ts.weekday::text,
      ts.period::text,
      coalesce(ts.subject,''),
      coalesce(ts.classroom_id::text,''),
      coalesce(ts.subgroup_id::text,''),
      ts.is_group_split::text
    ), ';;' order by ts.teacher_id, ts.weekday, ts.period, ts.id
  ),''))
  from public.teacher_schedule ts
  where ts.active=true;
$$;

create or replace function public.get_duty_month_state(p_month date)
returns table(
  month_start date,
  locked boolean,
  stored_schedule_signature text,
  current_schedule_signature text,
  schedule_changed boolean,
  generated_at timestamptz
)
language sql
stable
security definer
set search_path=public
as $$
  with m as (select date_trunc('month',p_month)::date as month_start),
  s as (select public.current_schedule_signature() as sig)
  select m.month_start,
    coalesce(l.locked,false),
    l.schedule_signature,
    s.sig,
    (l.schedule_signature is not null and l.schedule_signature <> s.sig),
    l.generated_at
  from m cross join s
  left join public.duty_month_locks l on l.month_start=m.month_start;
$$;

create or replace function public.set_duty_month_lock(p_month date, p_locked boolean)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_month date:=date_trunc('month',p_month)::date;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  insert into public.duty_month_locks(month_start,schedule_signature,locked,generated_by,generated_at)
  values(v_month,public.current_schedule_signature(),p_locked,auth.uid(),now())
  on conflict(month_start) do update set
    schedule_signature=case when p_locked then public.current_schedule_signature() else public.duty_month_locks.schedule_signature end,
    locked=p_locked,
    generated_by=auth.uid(),
    generated_at=case when p_locked then now() else public.duty_month_locks.generated_at end;
end;
$$;

-- Monthly generators always record the schedule version used for that plan.
create or replace function public.generate_monthly_vp_rotation(
  p_month date,
  p_vice_principal_ids uuid[],
  p_overwrite boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month date := date_trunc('month', p_month)::date;
  v_day date; v_i integer := 0; v_count integer := 0;
  v_len integer := coalesce(array_length(p_vice_principal_ids,1),0);
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if v_len = 0 then raise exception 'VICE_PRINCIPAL_LIST_REQUIRED'; end if;
  if exists(select 1 from public.duty_month_locks where month_start=v_month and locked=true) then raise exception 'DUTY_MONTH_LOCKED'; end if;

  for v_day in
    select d::date from generate_series(v_month,(v_month+interval '1 month - 1 day')::date,interval '1 day') d
    where extract(isodow from d) between 1 and 5 order by d
  loop
    v_i:=v_i+1;
    if p_overwrite then
      insert into public.duty_rotation(duty_date,vice_principal_id,assignment_source,cycle_month)
      values(v_day,p_vice_principal_ids[((v_i-1)%v_len)+1],'monthly_cycle',v_month)
      on conflict(duty_date) do update set vice_principal_id=excluded.vice_principal_id,assignment_source='monthly_cycle',cycle_month=v_month;
      v_count:=v_count+1;
    else
      insert into public.duty_rotation(duty_date,vice_principal_id,assignment_source,cycle_month)
      values(v_day,p_vice_principal_ids[((v_i-1)%v_len)+1],'monthly_cycle',v_month)
      on conflict(duty_date) do nothing;
      if found then v_count:=v_count+1; end if;
    end if;
  end loop;

  insert into public.duty_month_locks(month_start,schedule_signature,generated_by,generated_at)
  values(v_month,public.current_schedule_signature(),auth.uid(),now())
  on conflict(month_start) do update set schedule_signature=public.current_schedule_signature(),generated_by=auth.uid(),generated_at=now();
  return v_count;
end;
$$;

revoke all on function public.current_schedule_signature() from public;
revoke all on function public.get_duty_month_state(date) from public;
revoke all on function public.set_duty_month_lock(date,boolean) from public;
grant execute on function public.current_schedule_signature() to authenticated;
grant execute on function public.get_duty_month_state(date) to authenticated;
grant execute on function public.set_duty_month_lock(date,boolean) to authenticated;
