-- Guidance calendar -> reminder -> SmartBoard barcode access integration.
-- Also separates principal/vice-principal instructional barcode scans from their unrestricted device-management access.

create table if not exists public.guidance_class_activities (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  counselor_user_id uuid not null references public.profiles(user_id) on delete cascade,
  section_instance_id uuid not null references public.section_instances(id) on delete cascade,
  physical_room_id uuid not null references public.physical_rooms(id) on delete restrict,
  activity_date date not null,
  starts_at time not null,
  ends_at time not null,
  title text not null,
  description text,
  reminder_minutes integer not null default 30 check (reminder_minutes between 0 and 10080),
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_guidance_activity_counselor_time
  on public.guidance_class_activities(institution_code,counselor_user_id,activity_date,starts_at)
  where active=true;
create index if not exists idx_guidance_activity_room_time
  on public.guidance_class_activities(institution_code,physical_room_id,activity_date,starts_at)
  where active=true;

create table if not exists public.guidance_activity_reminders (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.guidance_class_activities(id) on delete cascade,
  institution_code text not null,
  counselor_user_id uuid not null references public.profiles(user_id) on delete cascade,
  remind_at timestamptz not null,
  status text not null default 'PENDING' check (status in ('PENDING','SENT','CANCELLED','FAILED')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(activity_id)
);

create index if not exists idx_guidance_reminder_due
  on public.guidance_activity_reminders(status,remind_at)
  where status='PENDING';

create or replace function public.enforce_guidance_activity_scope()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  v_inst text;
begin
  select institution_code into v_inst from public.academic_years where id=new.academic_year_id;
  if v_inst is distinct from new.institution_code then raise exception 'ACADEMIC_YEAR_TENANT_MISMATCH'; end if;
  select institution_code into v_inst from public.section_instances where id=new.section_instance_id;
  if v_inst is distinct from new.institution_code then raise exception 'SECTION_TENANT_MISMATCH'; end if;
  select institution_code into v_inst from public.physical_rooms where id=new.physical_room_id;
  if v_inst is distinct from new.institution_code then raise exception 'ROOM_TENANT_MISMATCH'; end if;
  return new;
end $$;

drop trigger if exists trg_guidance_activity_scope on public.guidance_class_activities;
create trigger trg_guidance_activity_scope
before insert or update on public.guidance_class_activities
for each row execute function public.enforce_guidance_activity_scope();

-- A counselor can create/edit only their own planned class-guidance activities.
-- Managers may manage all activities for the institution.
alter table public.guidance_class_activities enable row level security;
alter table public.guidance_activity_reminders enable row level security;

do $$ begin
  create policy "counselor reads own guidance activities" on public.guidance_class_activities
    for select to authenticated
    using(public.has_institution_access(institution_code) and (counselor_user_id=auth.uid() or public.is_manager_or_admin()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "counselor creates own guidance activities" on public.guidance_class_activities
    for insert to authenticated
    with check(
      public.has_institution_access(institution_code)
      and counselor_user_id=auth.uid()
      and created_by=auth.uid()
      and public.smartboard_has_role(institution_code,auth.uid(),'GUIDANCE_COUNSELOR',now())
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "counselor updates own guidance activities" on public.guidance_class_activities
    for update to authenticated
    using(public.has_institution_access(institution_code) and (counselor_user_id=auth.uid() or public.is_manager_or_admin()))
    with check(public.has_institution_access(institution_code) and (counselor_user_id=auth.uid() or public.is_manager_or_admin()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "counselor reads own guidance reminders" on public.guidance_activity_reminders
    for select to authenticated
    using(public.has_institution_access(institution_code) and (counselor_user_id=auth.uid() or public.is_manager_or_admin()));
exception when duplicate_object then null; end $$;

grant select,insert,update on public.guidance_class_activities to authenticated;
grant select on public.guidance_activity_reminders to authenticated;
grant all on public.guidance_class_activities,public.guidance_activity_reminders to service_role;

-- Keep one reminder row aligned with each active guidance activity.
create or replace function public.sync_guidance_activity_reminder()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  v_start timestamptz;
begin
  v_start := (new.activity_date + new.starts_at) at time zone 'Europe/Istanbul';
  insert into public.guidance_activity_reminders(activity_id,institution_code,counselor_user_id,remind_at,status)
  values(new.id,new.institution_code,new.counselor_user_id,v_start-make_interval(mins=>new.reminder_minutes),case when new.active then 'PENDING' else 'CANCELLED' end)
  on conflict(activity_id) do update set
    institution_code=excluded.institution_code,
    counselor_user_id=excluded.counselor_user_id,
    remind_at=excluded.remind_at,
    status=case when new.active then 'PENDING' else 'CANCELLED' end,
    sent_at=null;
  return new;
end $$;

drop trigger if exists trg_sync_guidance_activity_reminder on public.guidance_class_activities;
create trigger trg_sync_guidance_activity_reminder
after insert or update of activity_date,starts_at,reminder_minutes,active,counselor_user_id
on public.guidance_class_activities
for each row execute function public.sync_guidance_activity_reminder();

-- Annual-flow/calendar projection for the counselor UI.
create or replace view public.guidance_calendar_v
with (security_invoker=true)
as
select
  g.id,g.institution_code,g.academic_year_id,g.counselor_user_id,
  g.section_instance_id,si.display_name as section_name,
  g.physical_room_id,r.room_code,r.name as room_name,
  g.activity_date,g.starts_at,g.ends_at,g.title,g.description,
  g.reminder_minutes,g.active,
  gr.remind_at,gr.status as reminder_status,gr.sent_at,
  b.barcode_public_id as smartboard_barcode_public_id,
  b.smartboard_device_key
from public.guidance_class_activities g
join public.section_instances si on si.id=g.section_instance_id and si.institution_code=g.institution_code
join public.physical_rooms r on r.id=g.physical_room_id and r.institution_code=g.institution_code
left join public.guidance_activity_reminders gr on gr.activity_id=g.id
left join lateral (
  select sb.barcode_public_id,sb.smartboard_device_key
  from public.smartboard_room_bindings sb
  where sb.institution_code=g.institution_code
    and sb.physical_room_id=g.physical_room_id
    and sb.active=true
    and sb.barcode_enabled=true
    and sb.valid_until is null
  order by sb.valid_from desc limit 1
) b on true;

grant select on public.guidance_calendar_v to authenticated,service_role;

-- Add classification fields to unlock audit. Device/admin actions never count as lesson openings.
alter table public.smartboard_unlock_events
  add column if not exists access_purpose text not null default 'DEVICE_ACCESS'
    check (access_purpose in ('INSTRUCTIONAL','DEVICE_ACCESS','GUIDANCE')),
  add column if not exists administrative_role text
    check (administrative_role is null or administrative_role in ('PRINCIPAL','VICE_PRINCIPAL')),
  add column if not exists counts_as_lesson_open boolean not null default false,
  add column if not exists guidance_activity_id uuid references public.guidance_class_activities(id) on delete set null;

-- Main barcode authorization, with calendar-linked counselor access and accurate admin lesson logging.
create or replace function public.request_smartboard_barcode_unlock(
  p_barcode_public_id uuid,
  p_reason text default null,
  p_client_context jsonb default '{}'::jsonb,
  p_at timestamptz default now()
)
returns table(granted boolean,decision_code text,smartboard_device_key text,actor_kind text,event_id uuid)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_board record;
  v_lesson record;
  v_guidance record;
  v_actor text := 'UNKNOWN';
  v_code text := 'NOT_AUTHORIZED';
  v_granted boolean := false;
  v_event uuid;
  v_teacher_opened boolean := false;
  v_is_absent boolean := false;
  v_is_exact_substitute boolean := false;
  v_is_principal boolean := false;
  v_is_vice_principal boolean := false;
  v_admin_role text := null;
  v_access_purpose text := 'DEVICE_ACCESS';
  v_counts_as_lesson_open boolean := false;
  v_effective_reason text := nullif(btrim(coalesce(p_reason,'')),'');
begin
  if v_user is null then raise exception 'UNAUTHENTICATED'; end if;

  select b.id,b.institution_code,b.smartboard_device_key,b.physical_room_id,b.barcode_public_id
  into v_board from public.smartboard_room_bindings b
  where b.barcode_public_id=p_barcode_public_id and b.barcode_enabled=true and b.active=true
    and b.valid_from<=p_at and (b.valid_until is null or b.valid_until>=p_at)
  order by b.valid_from desc limit 1;
  if v_board.id is null then raise exception 'BOARD_BARCODE_NOT_FOUND'; end if;
  if not public.has_institution_access(v_board.institution_code) then raise exception 'TENANT_ACCESS_DENIED'; end if;

  select * into v_lesson from public.smartboard_current_room_lesson(v_board.institution_code,v_board.physical_room_id,p_at) limit 1;

  v_is_principal := public.smartboard_has_role(v_board.institution_code,v_user,'PRINCIPAL',p_at);
  v_is_vice_principal := public.smartboard_has_role(v_board.institution_code,v_user,'VICE_PRINCIPAL',p_at);
  if v_is_principal then v_admin_role:='PRINCIPAL'; elsif v_is_vice_principal then v_admin_role:='VICE_PRINCIPAL'; end if;

  if v_lesson.schedule_id is not null then
    select exists(select 1 from public.absence_lessons al where al.teacher_id=v_lesson.teacher_id and al.lesson_date=v_lesson.lesson_date and al.period=v_lesson.period and al.class_name=v_lesson.class_name) into v_is_absent;
    select exists(
      select 1 from public.absence_lessons al join public.substitute_assignments sa on sa.absence_lesson_id=al.id
      where al.teacher_id=v_lesson.teacher_id and al.lesson_date=v_lesson.lesson_date and al.period=v_lesson.period
        and al.class_name=v_lesson.class_name and sa.substitute_user_id=v_user
    ) into v_is_exact_substitute;
  end if;

  -- If an administrator is actually teaching this slot, barcode scan is a lesson log, not an admin-control log.
  if v_lesson.schedule_id is not null and v_lesson.teacher_id=v_user then
    v_actor:='SCHEDULED_TEACHER'; v_granted:=true; v_access_purpose:='INSTRUCTIONAL'; v_counts_as_lesson_open:=true;
    v_code:=case when v_is_principal then 'PRINCIPAL_SCHEDULED_TEACHING' when v_is_vice_principal then 'VICE_PRINCIPAL_SCHEDULED_TEACHING' else 'SCHEDULED_TEACHER_CURRENT_LESSON' end;
  elsif v_lesson.schedule_id is not null and v_is_absent and v_is_exact_substitute then
    v_actor:='DUTY_SUBSTITUTE'; v_granted:=true; v_access_purpose:='INSTRUCTIONAL'; v_counts_as_lesson_open:=true;
    v_code:=case when v_is_principal then 'PRINCIPAL_RECORDED_LESSON_SUBSTITUTE' when v_is_vice_principal then 'VICE_PRINCIPAL_RECORDED_LESSON_SUBSTITUTE' else 'DUTY_TEACHER_RECORDED_SUBSTITUTE' end;
  elsif v_is_principal then
    v_actor:='PRINCIPAL'; v_granted:=true; v_code:='PRINCIPAL_ANYTIME_DEVICE_ACCESS'; v_access_purpose:='DEVICE_ACCESS';
  elsif v_is_vice_principal then
    v_actor:='VICE_PRINCIPAL'; v_granted:=true; v_code:='VICE_PRINCIPAL_ANYTIME_DEVICE_ACCESS'; v_access_purpose:='DEVICE_ACCESS';
  elsif public.smartboard_has_role(v_board.institution_code,v_user,'GUIDANCE_COUNSELOR',p_at) then
    v_actor:='GUIDANCE_COUNSELOR'; v_access_purpose:='GUIDANCE';

    -- Planned calendar activity for this counselor + exact room + current time automatically supplies the reason.
    select g.id,g.title,si.display_name as section_name
    into v_guidance
    from public.guidance_class_activities g
    join public.section_instances si on si.id=g.section_instance_id and si.institution_code=g.institution_code
    where g.institution_code=v_board.institution_code
      and g.counselor_user_id=v_user
      and g.physical_room_id=v_board.physical_room_id
      and g.activity_date=(p_at at time zone 'Europe/Istanbul')::date
      and (p_at at time zone 'Europe/Istanbul')::time between g.starts_at and g.ends_at
      and g.active=true
    order by g.starts_at limit 1;

    if v_guidance.id is not null then
      v_granted:=true;
      v_code:='GUIDANCE_CALENDAR_ACTIVITY';
      v_effective_reason:=format('Takvim: %s — %s',v_guidance.section_name,v_guidance.title);
    else
      select exists(
        select 1 from public.smartboard_unlock_events e
        where e.institution_code=v_board.institution_code and e.smartboard_device_key=v_board.smartboard_device_key
          and e.decision='GRANTED' and e.counts_as_lesson_open=true
          and (v_lesson.schedule_id is null or e.schedule_id=v_lesson.schedule_id)
          and e.occurred_at>=date_trunc('day',p_at at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
          and e.occurred_at<=p_at
      ) into v_teacher_opened;
      if v_teacher_opened then v_granted:=true; v_code:='GUIDANCE_AFTER_TEACHER_OPEN';
      elsif v_effective_reason is not null then v_granted:=true; v_code:='GUIDANCE_OVERRIDE_WITH_REASON';
      else v_granted:=false; v_code:='GUIDANCE_REASON_REQUIRED'; end if;
    end if;
  elsif public.smartboard_has_role(v_board.institution_code,v_user,'DUTY_TEACHER',p_at) and v_lesson.schedule_id is not null then
    v_actor:='DUTY_SUBSTITUTE'; v_access_purpose:='INSTRUCTIONAL';
    if not v_is_absent then v_granted:=false; v_code:='DUTY_TEACHER_NO_RECORDED_ABSENCE';
    else v_granted:=false; v_code:='DUTY_TEACHER_NOT_ASSIGNED_SUBSTITUTE'; end if;
  else
    v_granted:=false; v_code:=case when v_lesson.schedule_id is null then 'NO_CURRENT_LESSON_AND_NO_ADMIN_ROLE' else 'NOT_AUTHORIZED_FOR_CURRENT_LESSON' end;
  end if;

  insert into public.smartboard_unlock_events(
    institution_code,smartboard_binding_id,smartboard_device_key,physical_room_id,barcode_public_id,
    actor_user_id,actor_kind,decision,decision_code,reason,schedule_id,lesson_date,period,class_name,subject,
    source,client_context,access_purpose,administrative_role,counts_as_lesson_open,guidance_activity_id
  ) values (
    v_board.institution_code,v_board.id,v_board.smartboard_device_key,v_board.physical_room_id,v_board.barcode_public_id,
    v_user,v_actor,case when v_granted then 'GRANTED' else 'DENIED' end,v_code,v_effective_reason,
    v_lesson.schedule_id,v_lesson.lesson_date,v_lesson.period,v_lesson.class_name,v_lesson.subject,
    'BARCODE_SCAN',coalesce(p_client_context,'{}'::jsonb),v_access_purpose,v_admin_role,v_counts_as_lesson_open,v_guidance.id
  ) returning id into v_event;

  return query select v_granted,v_code,v_board.smartboard_device_key,v_actor,v_event;
end;
$$;

-- Remote/local management operations by principal/vice-principal are unrestricted but audited as device access,
-- never as lesson attendance/opening.
create or replace function public.log_smartboard_admin_device_access(
  p_institution_code text,p_device_key text,p_action text,p_source text default 'ADMIN_CONSOLE',p_client_context jsonb default '{}'::jsonb
)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare v_user uuid:=auth.uid(); v_role text; v_board record; v_event uuid;
begin
  if v_user is null then raise exception 'UNAUTHENTICATED'; end if;
  if not public.has_institution_access(p_institution_code) then raise exception 'TENANT_ACCESS_DENIED'; end if;
  if public.smartboard_has_role(p_institution_code,v_user,'PRINCIPAL',now()) then v_role:='PRINCIPAL';
  elsif public.smartboard_has_role(p_institution_code,v_user,'VICE_PRINCIPAL',now()) then v_role:='VICE_PRINCIPAL';
  else raise exception 'ADMIN_DEVICE_ACCESS_DENIED'; end if;
  select id,physical_room_id,barcode_public_id into v_board from public.smartboard_room_bindings
  where institution_code=p_institution_code and smartboard_device_key=p_device_key and active=true
  order by valid_from desc limit 1;
  if v_board.id is null then raise exception 'SMARTBOARD_NOT_FOUND'; end if;
  insert into public.smartboard_unlock_events(
    institution_code,smartboard_binding_id,smartboard_device_key,physical_room_id,barcode_public_id,
    actor_user_id,actor_kind,decision,decision_code,reason,source,client_context,access_purpose,administrative_role,counts_as_lesson_open
  ) values(
    p_institution_code,v_board.id,p_device_key,v_board.physical_room_id,v_board.barcode_public_id,
    v_user,v_role,'GRANTED','ADMIN_DEVICE_'||upper(regexp_replace(coalesce(p_action,'ACCESS'),'[^A-Za-z0-9]+','_','g')),
    null,p_source,coalesce(p_client_context,'{}'::jsonb),'DEVICE_ACCESS',v_role,false
  ) returning id into v_event;
  return v_event;
end $$;

revoke all on function public.log_smartboard_admin_device_access(text,text,text,text,jsonb) from public;
grant execute on function public.log_smartboard_admin_device_access(text,text,text,text,jsonb) to authenticated;
