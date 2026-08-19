-- ==== 20260819033000_monthly_duty_quran_split.sql ====
alter table public.teacher_duty_assignments
  add column if not exists duty_location text,
  add column if not exists assignment_source text not null default 'manual'
    check (assignment_source in ('manual','monthly_cycle')),
  add column if not exists created_at timestamptz not null default now();

alter table public.duty_rotation
  add column if not exists assignment_source text not null default 'manual'
    check (assignment_source in ('manual','monthly_cycle')),
  add column if not exists cycle_month date;

create table if not exists public.duty_month_locks (
  month_start date primary key check (month_start = date_trunc('month', month_start)::date),
  schedule_signature text,
  locked boolean not null default false,
  generated_at timestamptz not null default now(),
  generated_by uuid references public.profiles(user_id) on delete set null,
  note text
);

create table if not exists public.duty_day_notes (
  duty_date date primary key,
  start_time time,
  end_time time,
  teaching_mode text not null default 'normal' check (teaching_mode in ('normal','sabahci','oglenci')),
  general_note text,
  empty_lesson_resolution text,
  principal_approval_note text,
  closed_at timestamptz,
  closed_by uuid references public.profiles(user_id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.duty_month_locks enable row level security;
alter table public.duty_day_notes enable row level security;
grant select, insert, update, delete on public.duty_month_locks, public.duty_day_notes to authenticated;

create policy "managers manage duty month locks" on public.duty_month_locks
for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers manage duty day notes" on public.duty_day_notes
for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());

-- Quran optional group-splitting plan. The threshold is an eligibility trigger, never an automatic split.
create table if not exists public.quran_split_plans (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.school_classes(id) on delete cascade,
  academic_year text not null,
  enabled boolean not null default true,
  threshold smallint not null default 25 check (threshold=25),
  group_1_id uuid references public.class_subgroups(id) on delete set null,
  group_2_id uuid references public.class_subgroups(id) on delete set null,
  teacher_1_id uuid references public.profiles(user_id) on delete restrict,
  teacher_2_id uuid references public.profiles(user_id) on delete restrict,
  source_note text not null default 'TTKB haftalık ders çizelgesi açıklaması: mevcudu 25’i geçen sınıflar iki gruba ayrılabilir; gruplar dengeli dağıtılır ve her gruptan eğitim öğretim yılı boyunca farklı bir alan öğretmeni sorumlu olur.',
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(class_id,academic_year),
  check (teacher_1_id is null or teacher_2_id is null or teacher_1_id <> teacher_2_id)
);

alter table public.quran_split_plans enable row level security;
grant select, insert, update, delete on public.quran_split_plans to authenticated;
create policy "authenticated read quran split plans" on public.quran_split_plans for select to authenticated using (true);
create policy "managers manage quran split plans" on public.quran_split_plans for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());

create or replace function public.assign_quran_parallel_lesson(
  p_class_id uuid,
  p_academic_year text,
  p_weekday smallint,
  p_period smallint,
  p_subject text,
  p_classroom_1 uuid default null,
  p_classroom_2 uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan public.quran_split_plans;
  v_class_name text;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select * into v_plan from public.quran_split_plans where class_id=p_class_id and academic_year=p_academic_year and enabled=true;
  if not found or v_plan.teacher_1_id is null or v_plan.teacher_2_id is null then raise exception 'QURAN_SPLIT_PLAN_REQUIRED'; end if;
  if v_plan.teacher_1_id=v_plan.teacher_2_id then raise exception 'QURAN_GROUP_TEACHERS_MUST_DIFFER'; end if;
  select class_name into v_class_name from public.school_classes where id=p_class_id and active=true;
  if v_class_name is null then raise exception 'CLASS_NOT_FOUND'; end if;

  insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active)
  values
    (v_plan.teacher_1_id,p_class_id,p_weekday,p_period,v_class_name,p_subject,p_classroom_1,v_plan.group_1_id,'KURAN-G1',true,true),
    (v_plan.teacher_2_id,p_class_id,p_weekday,p_period,v_class_name,p_subject,p_classroom_2,v_plan.group_2_id,'KURAN-G2',true,true);
  return 2;
end;
$$;
revoke all on function public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) from public;
grant execute on function public.assign_quran_parallel_lesson(uuid,text,smallint,smallint,text,uuid,uuid) to authenticated;

-- ==== 20260819033500_teacher_monthly_duty_cycle.sql ====
create table if not exists public.duty_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order smallint not null default 0,
  critical boolean not null default false,
  active boolean not null default true
);

create table if not exists public.teacher_duty_cycle_members (
  teacher_id uuid primary key references public.profiles(user_id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 5),
  rotation_offset smallint not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.duty_locations enable row level security;
alter table public.teacher_duty_cycle_members enable row level security;
grant select,insert,update,delete on public.duty_locations, public.teacher_duty_cycle_members to authenticated;
create policy "authenticated read duty locations" on public.duty_locations for select to authenticated using (true);
create policy "managers manage duty locations" on public.duty_locations for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read teacher duty cycle" on public.teacher_duty_cycle_members for select to authenticated using (true);
create policy "managers manage teacher duty cycle" on public.teacher_duty_cycle_members for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());

create or replace function public.generate_monthly_teacher_duties(p_month date, p_overwrite boolean default false)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_month date := date_trunc('month',p_month)::date;
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

  select array_agg(name order by critical desc,sort_order,name) into v_locations from public.duty_locations where active=true;
  v_location_count:=coalesce(array_length(v_locations,1),0);
  if v_location_count=0 then raise exception 'DUTY_LOCATION_REQUIRED'; end if;

  for v_day in
    select d::date from generate_series(v_month,(v_month+interval '1 month - 1 day')::date,interval '1 day') d
    where extract(isodow from d) between 1 and 5 order by d
  loop
    v_week_index:=((extract(day from v_day)::integer-1)/7);
    v_position:=0;
    for v_member in
      select m.teacher_id,m.rotation_offset,p.full_name
      from public.teacher_duty_cycle_members m join public.profiles p on p.user_id=m.teacher_id
      where m.active=true and m.weekday=extract(isodow from v_day)::smallint
      order by p.full_name,m.teacher_id
    loop
      v_position:=v_position+1;
      if p_overwrite then
        delete from public.teacher_duty_assignments where duty_date=v_day and teacher_id=v_member.teacher_id;
      end if;
      insert into public.teacher_duty_assignments(duty_date,teacher_id,duty_location,assignment_source)
      values(v_day,v_member.teacher_id,v_locations[((v_position-1+v_week_index+v_member.rotation_offset)%v_location_count)+1],'monthly_cycle')
      on conflict(duty_date,teacher_id) do nothing;
      if found then v_count:=v_count+1; end if;
    end loop;
  end loop;

  insert into public.duty_month_locks(month_start,generated_by)
  values(v_month,auth.uid())
  on conflict(month_start) do update set generated_at=now(),generated_by=auth.uid();
  return v_count;
end;
$$;
revoke all on function public.generate_monthly_teacher_duties(date,boolean) from public;
grant execute on function public.generate_monthly_teacher_duties(date,boolean) to authenticated;

-- ==== 20260819034000_quran_split_student_order_fix.sql ====
create or replace function public.prepare_quran_split(
  p_class_id uuid,
  p_academic_year text,
  p_teacher_1 uuid,
  p_teacher_2 uuid
)
returns public.quran_split_plans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_g1 uuid;
  v_g2 uuid;
  v_plan public.quran_split_plans;
  v_student record;
  v_index integer := 0;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_teacher_1 = p_teacher_2 then raise exception 'QURAN_GROUP_TEACHERS_MUST_DIFFER'; end if;
  select count(*)::integer into v_count from public.students where class_id=p_class_id and active=true;
  if v_count <= 25 then raise exception 'QURAN_SPLIT_REQUIRES_OVER_25_STUDENTS'; end if;

  insert into public.class_subgroups(class_id,subgroup_key,label) values(p_class_id,'KURAN-G1','Kur’an-ı Kerim Grup 1')
  on conflict(class_id,subgroup_key) do update set active=true,label=excluded.label returning id into v_g1;
  insert into public.class_subgroups(class_id,subgroup_key,label) values(p_class_id,'KURAN-G2','Kur’an-ı Kerim Grup 2')
  on conflict(class_id,subgroup_key) do update set active=true,label=excluded.label returning id into v_g2;

  delete from public.class_subgroup_students where subgroup_id in (v_g1,v_g2);
  for v_student in
    select id from public.students
    where class_id=p_class_id and active=true
    order by school_number nulls last, full_name, id
  loop
    v_index := v_index + 1;
    insert into public.class_subgroup_students(subgroup_id,student_id)
    values(case when v_index % 2=1 then v_g1 else v_g2 end, v_student.id);
  end loop;

  insert into public.quran_split_plans(class_id,academic_year,enabled,group_1_id,group_2_id,teacher_1_id,teacher_2_id,created_by,updated_at)
  values(p_class_id,p_academic_year,true,v_g1,v_g2,p_teacher_1,p_teacher_2,auth.uid(),now())
  on conflict(class_id,academic_year) do update set enabled=true,group_1_id=v_g1,group_2_id=v_g2,
    teacher_1_id=p_teacher_1,teacher_2_id=p_teacher_2,updated_at=now()
  returning * into v_plan;
  return v_plan;
end;
$$;

revoke all on function public.prepare_quran_split(uuid,text,uuid,uuid) from public;
grant execute on function public.prepare_quran_split(uuid,text,uuid,uuid) to authenticated;

-- ==== 20260819034500_duty_schedule_signature.sql ====
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
revoke all on function public.generate_monthly_vp_rotation(date,uuid[],boolean) from public;
grant execute on function public.current_schedule_signature() to authenticated;
grant execute on function public.get_duty_month_state(date) to authenticated;
grant execute on function public.set_duty_month_lock(date,boolean) to authenticated;
grant execute on function public.generate_monthly_vp_rotation(date,uuid[],boolean) to authenticated;

-- ==== 20260819035000_duty_operational_logs.sql ====
create table if not exists public.duty_tardiness_logs (
  id uuid primary key default gen_random_uuid(),
  duty_date date not null,
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  period smallint check (period between 1 and 12),
  class_name text,
  minutes_late smallint not null check (minutes_late between 1 and 240),
  note text,
  recorded_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.duty_incident_logs (
  id uuid primary key default gen_random_uuid(),
  duty_date date not null,
  reporter_id uuid references public.profiles(user_id) on delete set null,
  duty_location text,
  description text not null,
  action_taken text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_duty_tardiness_date on public.duty_tardiness_logs(duty_date,teacher_id);
create index if not exists idx_duty_incidents_date on public.duty_incident_logs(duty_date,occurred_at);

alter table public.duty_tardiness_logs enable row level security;
alter table public.duty_incident_logs enable row level security;
grant select,insert,update,delete on public.duty_tardiness_logs,public.duty_incident_logs to authenticated;

create policy "managers manage duty tardiness" on public.duty_tardiness_logs
for all to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "authenticated read duty incidents" on public.duty_incident_logs
for select to authenticated using (true);
create policy "authenticated create duty incidents" on public.duty_incident_logs
for insert to authenticated with check (reporter_id=auth.uid() or public.is_manager_or_admin());
create policy "managers manage duty incidents" on public.duty_incident_logs
for update to authenticated using (public.is_manager_or_admin()) with check (public.is_manager_or_admin());
create policy "managers delete duty incidents" on public.duty_incident_logs
for delete to authenticated using (public.is_manager_or_admin());

create or replace function public.get_daily_duty_book(p_date date)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'date', p_date,
    'manager', (
      select jsonb_build_object('user_id',p.user_id,'full_name',p.full_name,'phone',p.phone)
      from public.duty_rotation dr join public.profiles p on p.user_id=dr.vice_principal_id
      where dr.duty_date=p_date
    ),
    'duty_teachers', coalesce((
      select jsonb_agg(jsonb_build_object('user_id',p.user_id,'full_name',p.full_name,'location',tda.duty_location) order by p.full_name)
      from public.teacher_duty_assignments tda join public.profiles p on p.user_id=tda.teacher_id
      where tda.duty_date=p_date
    ),'[]'::jsonb),
    'absent_teachers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'teacher_id',a.teacher_id,'full_name',p.full_name,'medical_report',a.has_medical_report,'note',a.note,
        'lessons', coalesce((select jsonb_agg(jsonb_build_object('period',al.period,'class_name',al.class_name,'subject',al.subject) order by al.period)
          from public.absence_lessons al where al.teacher_id=a.teacher_id and al.lesson_date=p_date),'[]'::jsonb)
      ) order by p.full_name)
      from public.absences a join public.profiles p on p.user_id=a.teacher_id
      where a.absence_date=p_date and a.status <> 'resolved'
    ),'[]'::jsonb),
    'substitutions', coalesce((
      select jsonb_agg(jsonb_build_object('period',al.period,'class_name',al.class_name,'subject',al.subject,'substitute',p.full_name) order by al.period,al.class_name)
      from public.substitute_assignments sa
      join public.absence_lessons al on al.id=sa.absence_lesson_id
      join public.profiles p on p.user_id=sa.substitute_user_id
      where al.lesson_date=p_date
    ),'[]'::jsonb),
    'tardiness', coalesce((
      select jsonb_agg(jsonb_build_object('id',l.id,'teacher_id',l.teacher_id,'full_name',p.full_name,'period',l.period,'class_name',l.class_name,'minutes_late',l.minutes_late,'note',l.note) order by l.created_at)
      from public.duty_tardiness_logs l join public.profiles p on p.user_id=l.teacher_id
      where l.duty_date=p_date
    ),'[]'::jsonb),
    'incidents', coalesce((
      select jsonb_agg(jsonb_build_object('id',i.id,'reporter',p.full_name,'location',i.duty_location,'description',i.description,'action_taken',i.action_taken,'occurred_at',i.occurred_at) order by i.occurred_at)
      from public.duty_incident_logs i left join public.profiles p on p.user_id=i.reporter_id
      where i.duty_date=p_date
    ),'[]'::jsonb),
    'notes', (select to_jsonb(n) from public.duty_day_notes n where n.duty_date=p_date)
  );
$$;

revoke all on function public.get_daily_duty_book(date) from public;
grant execute on function public.get_daily_duty_book(date) to authenticated;