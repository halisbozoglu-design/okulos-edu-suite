-- Immutable working timetable restore points.
-- Scenario application automatically stores the previous working schedule.

create table if not exists public.schedule_restore_points (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  reason text not null default 'manual',
  row_count integer not null default 0,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_restore_point_rows (
  id bigint generated always as identity primary key,
  restore_point_id uuid not null references public.schedule_restore_points(id) on delete cascade,
  snapshot jsonb not null
);

create index if not exists idx_schedule_restore_points_created on public.schedule_restore_points(created_at desc);
create index if not exists idx_schedule_restore_rows_point on public.schedule_restore_point_rows(restore_point_id);

alter table public.schedule_restore_points enable row level security;
alter table public.schedule_restore_point_rows enable row level security;
grant select on public.schedule_restore_points,public.schedule_restore_point_rows to authenticated;
create policy "managers read restore points" on public.schedule_restore_points for select to authenticated using(public.is_manager_or_admin());
create policy "managers read restore point rows" on public.schedule_restore_point_rows for select to authenticated using(public.is_manager_or_admin());
revoke insert,update,delete on public.schedule_restore_points,public.schedule_restore_point_rows from authenticated;

create or replace function public.create_schedule_restore_point(p_label text default 'Çalışma programı',p_reason text default 'manual')
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;v_count integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  select count(*)::integer into v_count from public.teacher_schedule where active=true;
  insert into public.schedule_restore_points(label,reason,row_count,created_by)
  values(coalesce(nullif(trim(p_label),''),'Çalışma programı'),coalesce(nullif(trim(p_reason),''),'manual'),v_count,auth.uid()) returning id into v_id;
  insert into public.schedule_restore_point_rows(restore_point_id,snapshot)
  select v_id,to_jsonb(ts) from public.teacher_schedule ts where ts.active=true order by ts.weekday,ts.period,ts.class_name,ts.teacher_id;
  return v_id;
end;
$$;
revoke all on function public.create_schedule_restore_point(text,text) from public;
grant execute on function public.create_schedule_restore_point(text,text) to authenticated;

create or replace function public.restore_schedule_restore_point(p_restore_point_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare v_count integer:=0;v_snapshot jsonb;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if not exists(select 1 from public.schedule_restore_points where id=p_restore_point_id) then raise exception 'RESTORE_POINT_NOT_FOUND'; end if;

  -- Store current state first, so every restore operation is itself reversible (redo by restoring this new point).
  perform public.create_schedule_restore_point('Geri yükleme öncesi otomatik kopya','before_restore');

  delete from public.teacher_schedule where active=true;
  for v_snapshot in select snapshot from public.schedule_restore_point_rows where restore_point_id=p_restore_point_id order by id loop
    insert into public.teacher_schedule(
      id,teacher_id,weekday,period,class_name,subject,class_id,classroom,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked,updated_at
    ) values(
      coalesce((v_snapshot->>'id')::uuid,gen_random_uuid()),
      (v_snapshot->>'teacher_id')::uuid,
      (v_snapshot->>'weekday')::smallint,
      (v_snapshot->>'period')::smallint,
      v_snapshot->>'class_name',
      v_snapshot->>'subject',
      nullif(v_snapshot->>'class_id','')::uuid,
      nullif(v_snapshot->>'classroom',''),
      nullif(v_snapshot->>'classroom_id','')::uuid,
      nullif(v_snapshot->>'subgroup_id','')::uuid,
      nullif(v_snapshot->>'subgroup_key',''),
      coalesce((v_snapshot->>'is_group_split')::boolean,false),
      true,
      coalesce((v_snapshot->>'locked')::boolean,false),
      now()
    );
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.restore_schedule_restore_point(uuid) from public;
grant execute on function public.restore_schedule_restore_point(uuid) to authenticated;

-- Replace scenario apply function so the current draft can always be restored.
create or replace function public.apply_schedule_scenario(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare v_count integer;v_restore uuid;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if exists(select 1 from public.schedule_unplaced_items where scenario_id=p_scenario_id) then raise exception 'SCENARIO_HAS_UNPLACED_LESSONS'; end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND'; end if;
  if exists(select 1 from public.classrooms where active=true)
     and exists(select 1 from public.schedule_scenario_rows where scenario_id=p_scenario_id and classroom_id is null) then
    raise exception 'SCENARIO_HAS_UNASSIGNED_CLASSROOMS';
  end if;

  v_restore:=public.create_schedule_restore_point('Senaryo uygulama öncesi','before_scenario_apply');

  delete from public.teacher_schedule where active=true and locked=false;
  insert into public.teacher_schedule(teacher_id,class_id,weekday,period,class_name,subject,classroom_id,subgroup_id,subgroup_key,is_group_split,active,locked)
  select r.teacher_id,r.class_id,r.weekday,r.period,r.class_name,r.subject,r.classroom_id,r.subgroup_id,r.subgroup_key,r.is_group_split,true,false
  from public.schedule_scenario_rows r where r.scenario_id=p_scenario_id and r.locked=false
  order by r.weekday,r.period,r.class_name;
  get diagnostics v_count=row_count;
  update public.schedule_scenarios set status=case when id=p_scenario_id then 'applied' else status end where generation_group=(select generation_group from public.schedule_scenarios where id=p_scenario_id);
  return v_count;
end;
$$;
revoke all on function public.apply_schedule_scenario(uuid) from public;
grant execute on function public.apply_schedule_scenario(uuid) to authenticated;
