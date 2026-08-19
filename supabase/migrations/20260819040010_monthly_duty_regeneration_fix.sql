create or replace function public.generate_monthly_teacher_duties(p_month date, p_overwrite boolean default false)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_month date := date_trunc('month',p_month)::date;
  v_next_month date := (date_trunc('month',p_month)+interval '1 month')::date;
  v_day date;
  v_member record;
  v_locations text[];
  v_location_count integer;
  v_week_index integer;
  v_position integer;
  v_count integer:=0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if exists(select 1 from public.duty_month_locks where month_start=v_month and locked=true) then raise exception 'DUTY_MONTH_LOCKED'; end if;

  select array_agg(name order by critical desc,sort_order,name) into v_locations
  from public.duty_locations where active=true;
  v_location_count:=coalesce(array_length(v_locations,1),0);
  if v_location_count=0 then raise exception 'DUTY_LOCATION_REQUIRED'; end if;

  if p_overwrite then
    delete from public.teacher_duty_assignments
    where duty_date>=v_month and duty_date<v_next_month and assignment_source='monthly_cycle';
  end if;

  for v_day in
    select d::date from generate_series(v_month,(v_next_month-1),interval '1 day') d
    where extract(isodow from d) between 1 and 5 order by d
  loop
    v_week_index:=((extract(day from v_day)::integer-1)/7);
    v_position:=0;
    for v_member in
      select m.teacher_id,m.rotation_offset,p.full_name
      from public.teacher_duty_cycle_members m
      join public.profiles p on p.user_id=m.teacher_id
      where m.active=true and m.weekday=extract(isodow from v_day)::smallint
      order by p.full_name,m.teacher_id
    loop
      v_position:=v_position+1;
      insert into public.teacher_duty_assignments(duty_date,teacher_id,duty_location,assignment_source)
      values(v_day,v_member.teacher_id,v_locations[((v_position-1+v_week_index+v_member.rotation_offset)%v_location_count)+1],'monthly_cycle')
      on conflict(duty_date,teacher_id) do nothing;
      if found then v_count:=v_count+1; end if;
    end loop;
  end loop;
  return v_count;
end;
$$;
