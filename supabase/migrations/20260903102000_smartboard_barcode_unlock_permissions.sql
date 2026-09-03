-- SmartBoard barcode-based unlock authorization engine.
-- Canonical rules:
-- 1) Each board has a unique barcode/public scan id.
-- 2) Scheduled teacher may unlock only the board resolved for their current lesson.
-- 3) Principal / vice-principal may unlock any board in their institution at any time.
-- 4) Guidance counselor may unlock conditionally: if the lesson teacher already unlocked, no reason is required;
--    otherwise a non-empty reason is mandatory and the action is explicitly logged as GUIDANCE_OVERRIDE.
-- 5) A duty teacher may unlock only when the current lesson teacher is absent AND that duty teacher is the recorded substitute for that exact absence lesson.
-- 6) Every attempt, granted or denied, is auditable with server timestamp.
-- Runtime integration does not use Lovable tokens.

alter table public.smartboard_room_bindings
  add column if not exists barcode_public_id uuid not null default gen_random_uuid(),
  add column if not exists barcode_version integer not null default 1,
  add column if not exists barcode_enabled boolean not null default true;

create unique index if not exists uq_smartboard_barcode_public_id
  on public.smartboard_room_bindings(barcode_public_id);

create table if not exists public.smartboard_role_grants (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  role_code text not null check (role_code in ('PRINCIPAL','VICE_PRINCIPAL','GUIDANCE_COUNSELOR','DUTY_TEACHER')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until >= valid_from)
);

create index if not exists idx_smartboard_role_grants_lookup
  on public.smartboard_role_grants(institution_code,user_id,role_code,active,valid_from,valid_until);

create table if not exists public.smartboard_unlock_events (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  smartboard_binding_id uuid references public.smartboard_room_bindings(id) on delete set null,
  smartboard_device_key text not null,
  physical_room_id uuid references public.physical_rooms(id) on delete set null,
  barcode_public_id uuid,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  actor_kind text not null check (actor_kind in ('SCHEDULED_TEACHER','PRINCIPAL','VICE_PRINCIPAL','GUIDANCE_COUNSELOR','DUTY_SUBSTITUTE','UNKNOWN')),
  decision text not null check (decision in ('GRANTED','DENIED')),
  decision_code text not null,
  reason text,
  schedule_id uuid references public.teacher_schedule(id) on delete set null,
  lesson_date date,
  period smallint,
  class_name text,
  subject text,
  source text not null default 'BARCODE_SCAN',
  client_context jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_smartboard_unlock_events_board_time
  on public.smartboard_unlock_events(institution_code,smartboard_device_key,occurred_at desc);
create index if not exists idx_smartboard_unlock_events_actor_time
  on public.smartboard_unlock_events(institution_code,actor_user_id,occurred_at desc);

alter table public.smartboard_role_grants enable row level security;
alter table public.smartboard_unlock_events enable row level security;

do $$ begin
  create policy "tenant read smartboard role grants" on public.smartboard_role_grants
    for select to authenticated using(public.has_institution_access(institution_code));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "managers manage smartboard role grants" on public.smartboard_role_grants
    for all to authenticated
    using(public.has_institution_access(institution_code) and public.is_manager_or_admin())
    with check(public.has_institution_access(institution_code) and public.is_manager_or_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "tenant read smartboard unlock audit" on public.smartboard_unlock_events
    for select to authenticated using(public.has_institution_access(institution_code));
exception when duplicate_object then null; end $$;

grant select on public.smartboard_role_grants,public.smartboard_unlock_events to authenticated;
grant all on public.smartboard_role_grants,public.smartboard_unlock_events to service_role;

create or replace function public.smartboard_has_role(
  p_institution_code text,
  p_user_id uuid,
  p_role_code text,
  p_at timestamptz default now()
)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1
    from public.smartboard_role_grants g
    where g.institution_code=p_institution_code
      and g.user_id=p_user_id
      and g.role_code=p_role_code
      and g.active=true
      and g.valid_from<=p_at
      and (g.valid_until is null or g.valid_until>=p_at)
  );
$$;

revoke all on function public.smartboard_has_role(text,uuid,text,timestamptz) from public;
grant execute on function public.smartboard_has_role(text,uuid,text,timestamptz) to authenticated,service_role;

-- Resolve the current scheduled lesson for a room by institution period definitions.
create or replace function public.smartboard_current_room_lesson(
  p_institution_code text,
  p_room_id uuid,
  p_at timestamptz default now()
)
returns table(
  schedule_id uuid,
  teacher_id uuid,
  lesson_date date,
  period smallint,
  class_name text,
  subject text
)
language sql
stable
security definer
set search_path=public
as $$
  with local_time as (
    select (p_at at time zone 'Europe/Istanbul') as lt
  ), ctx as (
    select lt::date as d,
           extract(isodow from lt)::smallint as dow,
           lt::time as tod
    from local_time
  )
  select ts.id,ts.teacher_id,c.d,ts.period,ts.class_name,ts.subject
  from public.teacher_schedule ts
  join ctx c on ts.weekday=c.dow
  join public.institution_period_times ipt
    on ipt.institution_code=ts.institution_code
   and ipt.period=ts.period
   and c.tod between ipt.starts_at and ipt.ends_at
  where ts.institution_code=p_institution_code
    and public.resolve_lesson_room(ts.id,c.d)=p_room_id
  order by ts.period
  limit 1;
$$;

revoke all on function public.smartboard_current_room_lesson(text,uuid,timestamptz) from public;
grant execute on function public.smartboard_current_room_lesson(text,uuid,timestamptz) to authenticated,service_role;

-- Main authorization function called after scanning the board barcode.
-- Returns GRANTED only after applying role-specific rules and writes an immutable audit row.
create or replace function public.request_smartboard_barcode_unlock(
  p_barcode_public_id uuid,
  p_reason text default null,
  p_client_context jsonb default '{}'::jsonb,
  p_at timestamptz default now()
)
returns table(
  granted boolean,
  decision_code text,
  smartboard_device_key text,
  actor_kind text,
  event_id uuid
)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_board record;
  v_lesson record;
  v_actor text := 'UNKNOWN';
  v_code text := 'NOT_AUTHORIZED';
  v_granted boolean := false;
  v_event uuid;
  v_teacher_opened boolean := false;
  v_is_absent boolean := false;
  v_is_exact_substitute boolean := false;
begin
  if v_user is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  select b.id,b.institution_code,b.smartboard_device_key,b.physical_room_id,b.barcode_public_id
  into v_board
  from public.smartboard_room_bindings b
  where b.barcode_public_id=p_barcode_public_id
    and b.barcode_enabled=true
    and b.active=true
    and b.valid_from<=p_at
    and (b.valid_until is null or b.valid_until>=p_at)
  order by b.valid_from desc
  limit 1;

  if v_board.id is null then
    raise exception 'BOARD_BARCODE_NOT_FOUND';
  end if;

  if not public.has_institution_access(v_board.institution_code) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;

  select * into v_lesson
  from public.smartboard_current_room_lesson(v_board.institution_code,v_board.physical_room_id,p_at)
  limit 1;

  -- Principal / vice principal: institution-wide, anytime.
  if public.smartboard_has_role(v_board.institution_code,v_user,'PRINCIPAL',p_at) then
    v_actor := 'PRINCIPAL'; v_granted := true; v_code := 'PRINCIPAL_ANYTIME';
  elsif public.smartboard_has_role(v_board.institution_code,v_user,'VICE_PRINCIPAL',p_at) then
    v_actor := 'VICE_PRINCIPAL'; v_granted := true; v_code := 'VICE_PRINCIPAL_ANYTIME';

  -- Scheduled teacher: only their current lesson / resolved room.
  elsif v_lesson.schedule_id is not null and v_lesson.teacher_id=v_user then
    v_actor := 'SCHEDULED_TEACHER'; v_granted := true; v_code := 'SCHEDULED_TEACHER_CURRENT_LESSON';

  -- Guidance counselor: if lesson teacher already opened, reason optional.
  -- If not, counselor may open only with a mandatory explicit reason.
  elsif public.smartboard_has_role(v_board.institution_code,v_user,'GUIDANCE_COUNSELOR',p_at) then
    v_actor := 'GUIDANCE_COUNSELOR';
    select exists(
      select 1 from public.smartboard_unlock_events e
      where e.institution_code=v_board.institution_code
        and e.smartboard_device_key=v_board.smartboard_device_key
        and e.decision='GRANTED'
        and e.actor_kind in ('SCHEDULED_TEACHER','DUTY_SUBSTITUTE')
        and (v_lesson.schedule_id is null or e.schedule_id=v_lesson.schedule_id)
        and e.occurred_at>=date_trunc('day',p_at at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
        and e.occurred_at<=p_at
    ) into v_teacher_opened;

    if v_teacher_opened then
      v_granted := true; v_code := 'GUIDANCE_AFTER_TEACHER_OPEN';
    elsif nullif(btrim(coalesce(p_reason,'')),'') is not null then
      v_granted := true; v_code := 'GUIDANCE_OVERRIDE_WITH_REASON';
    else
      v_granted := false; v_code := 'GUIDANCE_REASON_REQUIRED';
    end if;

  -- Duty teacher: NOT a blanket override. Only exact recorded substitute for absent lesson.
  elsif public.smartboard_has_role(v_board.institution_code,v_user,'DUTY_TEACHER',p_at)
        and v_lesson.schedule_id is not null then
    v_actor := 'DUTY_SUBSTITUTE';

    select exists(
      select 1
      from public.absence_lessons al
      where al.teacher_id=v_lesson.teacher_id
        and al.lesson_date=v_lesson.lesson_date
        and al.period=v_lesson.period
        and al.class_name=v_lesson.class_name
    ) into v_is_absent;

    select exists(
      select 1
      from public.absence_lessons al
      join public.substitute_assignments sa on sa.absence_lesson_id=al.id
      where al.teacher_id=v_lesson.teacher_id
        and al.lesson_date=v_lesson.lesson_date
        and al.period=v_lesson.period
        and al.class_name=v_lesson.class_name
        and sa.substitute_user_id=v_user
    ) into v_is_exact_substitute;

    if v_is_absent and v_is_exact_substitute then
      v_granted := true; v_code := 'DUTY_TEACHER_RECORDED_SUBSTITUTE';
    elsif not v_is_absent then
      v_granted := false; v_code := 'DUTY_TEACHER_NO_RECORDED_ABSENCE';
    else
      v_granted := false; v_code := 'DUTY_TEACHER_NOT_ASSIGNED_SUBSTITUTE';
    end if;
  else
    v_granted := false; v_code := case when v_lesson.schedule_id is null then 'NO_CURRENT_LESSON_AND_NO_ADMIN_ROLE' else 'NOT_AUTHORIZED_FOR_CURRENT_LESSON' end;
  end if;

  insert into public.smartboard_unlock_events(
    institution_code,smartboard_binding_id,smartboard_device_key,physical_room_id,barcode_public_id,
    actor_user_id,actor_kind,decision,decision_code,reason,schedule_id,lesson_date,period,class_name,subject,client_context
  ) values (
    v_board.institution_code,v_board.id,v_board.smartboard_device_key,v_board.physical_room_id,v_board.barcode_public_id,
    v_user,v_actor,case when v_granted then 'GRANTED' else 'DENIED' end,v_code,nullif(btrim(coalesce(p_reason,'')),''),
    v_lesson.schedule_id,v_lesson.lesson_date,v_lesson.period,v_lesson.class_name,v_lesson.subject,coalesce(p_client_context,'{}'::jsonb)
  ) returning id into v_event;

  return query select v_granted,v_code,v_board.smartboard_device_key,v_actor,v_event;
end;
$$;

revoke all on function public.request_smartboard_barcode_unlock(uuid,text,jsonb,timestamptz) from public;
grant execute on function public.request_smartboard_barcode_unlock(uuid,text,jsonb,timestamptz) to authenticated;
