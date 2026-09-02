-- Scoped timetable overrides are controlled exceptions: they require a reason,
-- an explicit validity window, an approval record and an immutable retirement trail.

alter table public.schedule_rule_overrides
  add column if not exists exception_reason text,
  add column if not exists valid_from date,
  add column if not exists valid_until date,
  add column if not exists approved_by uuid references public.profiles(user_id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists created_by uuid references public.profiles(user_id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists retired_by uuid references public.profiles(user_id) on delete set null,
  add column if not exists retired_at timestamptz,
  add column if not exists retirement_reason text;

alter table public.schedule_rule_overrides
  drop constraint if exists schedule_rule_overrides_exception_lifecycle_complete;
alter table public.schedule_rule_overrides
  add constraint schedule_rule_overrides_exception_lifecycle_complete check (
    valid_from is null or valid_until is null or valid_until >= valid_from
  );

create table if not exists public.schedule_rule_override_events (
  id bigint generated always as identity primary key,
  institution_code text not null references public.institutions(institution_code) on delete restrict,
  schedule_rule_override_id uuid references public.schedule_rule_overrides(id) on delete set null,
  action text not null check (action in ('CREATED', 'UPDATED', 'RETIRED')),
  reason text,
  valid_from date,
  valid_until date,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_schedule_rule_override_events_tenant_created
  on public.schedule_rule_override_events(institution_code, created_at desc);

alter table public.schedule_rule_override_events enable row level security;
revoke all on table public.schedule_rule_override_events from anon, authenticated;
grant select on table public.schedule_rule_override_events to authenticated;
drop policy if exists "schedule rules managers read override events" on public.schedule_rule_override_events;
create policy "schedule rules managers read override events"
on public.schedule_rule_override_events for select to authenticated
using (public.tenant_row_allowed(institution_code) and public.has_permission('schedule.rules'));

-- Existing permissive policies were combined with OR by PostgreSQL and could bypass
-- tenant filtering. Replace them with tenant-scoped policies before using the new RPC.
drop policy if exists "authenticated read schedule rule overrides" on public.schedule_rule_overrides;
drop policy if exists "delegated schedule rules manage scoped overrides" on public.schedule_rule_overrides;
drop policy if exists "managers manage schedule rule overrides" on public.schedule_rule_overrides;
drop policy if exists "tenant_boundary_schedule_rule_overrides" on public.schedule_rule_overrides;
create policy "schedule rules read scoped overrides"
on public.schedule_rule_overrides for select to authenticated
using (public.tenant_row_allowed(institution_code) and public.has_permission('schedule.rules'));

-- Only the audited functions below mutate or retire an exception.
revoke insert, update, delete on table public.schedule_rule_overrides from authenticated, anon;

create or replace function public.save_schedule_rule_override_v3(
  p_class_course_requirement_id uuid,
  p_teacher_assignment_id uuid,
  p_block_pattern smallint[],
  p_max_per_day smallint,
  p_min_distinct_days smallint,
  p_preferred_days smallint[],
  p_prohibited_days smallint[],
  p_preferred_periods smallint[],
  p_prohibited_periods smallint[],
  p_avoid_last_period boolean,
  p_note text,
  p_exception_reason text,
  p_valid_from date,
  p_valid_until date
) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_existing public.schedule_rule_overrides%rowtype; v_action text;
begin
  perform public.open_permission_context('schedule.rules');
  if (p_class_course_requirement_id is null) = (p_teacher_assignment_id is null) then
    raise exception 'RULE_OVERRIDE_SCOPE_REQUIRED';
  end if;
  if length(btrim(coalesce(p_exception_reason, ''))) < 10 then
    raise exception 'RULE_OVERRIDE_REASON_REQUIRED';
  end if;
  if p_valid_from is null then raise exception 'RULE_OVERRIDE_VALID_FROM_REQUIRED'; end if;
  if p_valid_until is not null and p_valid_until < p_valid_from then
    raise exception 'RULE_OVERRIDE_INVALID_VALIDITY_RANGE';
  end if;

  select * into v_existing
  from public.schedule_rule_overrides
  where institution_code=public.current_tenant_code() and active
    and ((p_class_course_requirement_id is not null and class_course_requirement_id=p_class_course_requirement_id)
      or (p_teacher_assignment_id is not null and teacher_assignment_id=p_teacher_assignment_id))
  for update;

  if found then
    update public.schedule_rule_overrides set
      block_pattern=coalesce(p_block_pattern, '{}'::smallint[]), max_per_day=p_max_per_day,
      min_distinct_days=p_min_distinct_days, preferred_days=coalesce(p_preferred_days, '{}'::smallint[]),
      prohibited_days=coalesce(p_prohibited_days, '{}'::smallint[]), preferred_periods=coalesce(p_preferred_periods, '{}'::smallint[]),
      prohibited_periods=coalesce(p_prohibited_periods, '{}'::smallint[]), avoid_last_period=coalesce(p_avoid_last_period, false),
      note=nullif(btrim(coalesce(p_note, '')), ''), exception_reason=btrim(p_exception_reason),
      valid_from=p_valid_from, valid_until=p_valid_until, approved_by=auth.uid(), approved_at=now(),
      retired_by=null, retired_at=null, retirement_reason=null, updated_at=now()
    where id=v_existing.id returning id into v_id;
    v_action:='UPDATED';
  else
    insert into public.schedule_rule_overrides(
      institution_code, class_course_requirement_id, teacher_assignment_id, block_pattern, max_per_day,
      min_distinct_days, preferred_days, prohibited_days, preferred_periods, prohibited_periods,
      avoid_last_period, note, active, exception_reason, valid_from, valid_until,
      approved_by, approved_at, created_by, created_at, updated_at
    ) values (
      public.current_tenant_code(), p_class_course_requirement_id, p_teacher_assignment_id,
      coalesce(p_block_pattern, '{}'::smallint[]), p_max_per_day, p_min_distinct_days,
      coalesce(p_preferred_days, '{}'::smallint[]), coalesce(p_prohibited_days, '{}'::smallint[]),
      coalesce(p_preferred_periods, '{}'::smallint[]), coalesce(p_prohibited_periods, '{}'::smallint[]),
      coalesce(p_avoid_last_period, false), nullif(btrim(coalesce(p_note, '')), ''), true,
      btrim(p_exception_reason), p_valid_from, p_valid_until, auth.uid(), now(), auth.uid(), now(), now()
    ) returning id into v_id;
    v_action:='CREATED';
  end if;
  insert into public.schedule_rule_override_events(institution_code,schedule_rule_override_id,action,reason,valid_from,valid_until,actor_user_id)
  values(public.current_tenant_code(),v_id,v_action,btrim(p_exception_reason),p_valid_from,p_valid_until,auth.uid());
  return v_id;
end $$;

create or replace function public.retire_schedule_rule_override_v1(
  p_override_id uuid,
  p_retirement_reason text
) returns boolean
language plpgsql security definer set search_path=public as $$
declare v_override public.schedule_rule_overrides%rowtype;
begin
  perform public.open_permission_context('schedule.rules');
  if length(btrim(coalesce(p_retirement_reason, ''))) < 10 then
    raise exception 'RULE_OVERRIDE_RETIREMENT_REASON_REQUIRED';
  end if;
  select * into v_override from public.schedule_rule_overrides
  where id=p_override_id and institution_code=public.current_tenant_code() and active for update;
  if not found then raise exception 'RULE_OVERRIDE_NOT_FOUND'; end if;
  update public.schedule_rule_overrides set active=false, retired_by=auth.uid(), retired_at=now(),
    retirement_reason=btrim(p_retirement_reason), updated_at=now() where id=v_override.id;
  insert into public.schedule_rule_override_events(institution_code,schedule_rule_override_id,action,reason,valid_from,valid_until,actor_user_id)
  values(v_override.institution_code,v_override.id,'RETIRED',btrim(p_retirement_reason),v_override.valid_from,v_override.valid_until,auth.uid());
  return true;
end $$;

create or replace function public.list_schedule_rule_override_events_v1()
returns table(
  schedule_rule_override_id uuid, action text, reason text, valid_from date, valid_until date,
  actor_user_id uuid, created_at timestamptz
) language sql stable security definer set search_path=public as $$
  select e.schedule_rule_override_id,e.action,e.reason,e.valid_from,e.valid_until,e.actor_user_id,e.created_at
  from public.schedule_rule_override_events e
  where e.institution_code=public.current_tenant_code()
  order by e.created_at desc, e.id desc;
$$;

revoke all on function public.save_schedule_rule_override_v3(uuid,uuid,smallint[],smallint,smallint,smallint[],smallint[],smallint[],smallint[],boolean,text,text,date,date), public.retire_schedule_rule_override_v1(uuid,text), public.list_schedule_rule_override_events_v1() from public, anon;
grant execute on function public.save_schedule_rule_override_v3(uuid,uuid,smallint[],smallint,smallint,smallint[],smallint[],smallint[],smallint[],boolean,text,text,date,date) to authenticated;
grant execute on function public.retire_schedule_rule_override_v1(uuid,text), public.list_schedule_rule_override_events_v1() to authenticated;
