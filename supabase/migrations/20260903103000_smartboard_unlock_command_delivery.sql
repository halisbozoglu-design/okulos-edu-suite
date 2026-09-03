-- Forward-only delivery layer for barcode unlock authorization.
-- Granted barcode authorization must create a board-consumable command; denied attempts never do.

create table if not exists public.smartboard_device_commands (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null,
  smartboard_device_key text not null,
  command_type text not null check (command_type in ('UNLOCK_LESSON','UNLOCK_ADMIN','UNLOCK_GUIDANCE','UNLOCK_DUTY_SUBSTITUTE','LOCK','SHUTDOWN','KEEP_AWAKE')),
  payload jsonb not null default '{}'::jsonb,
  source_event_id uuid references public.smartboard_unlock_events(id) on delete set null,
  requested_by uuid references public.profiles(user_id) on delete set null,
  requested_at timestamptz not null default now(),
  not_before timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'PENDING' check (status in ('PENDING','DELIVERED','ACKNOWLEDGED','FAILED','EXPIRED','CANCELLED')),
  delivered_at timestamptz,
  acknowledged_at timestamptz,
  result jsonb not null default '{}'::jsonb
);

create index if not exists idx_smartboard_device_commands_pending
  on public.smartboard_device_commands(institution_code,smartboard_device_key,status,not_before,requested_at);

create unique index if not exists uq_smartboard_unlock_source_command
  on public.smartboard_device_commands(source_event_id)
  where source_event_id is not null and command_type in ('UNLOCK_LESSON','UNLOCK_ADMIN','UNLOCK_GUIDANCE','UNLOCK_DUTY_SUBSTITUTE');

alter table public.smartboard_device_commands enable row level security;

do $$ begin
  create policy "tenant read smartboard commands" on public.smartboard_device_commands
    for select to authenticated using(public.has_institution_access(institution_code));
exception when duplicate_object then null; end $$;

grant select on public.smartboard_device_commands to authenticated;
grant all on public.smartboard_device_commands to service_role;

-- Trigger guarantees the authorization audit row and device command cannot drift.
-- Only GRANTED events produce commands; DENIED events remain audit-only.
create or replace function public.enqueue_smartboard_unlock_command()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_type text;
begin
  if new.decision <> 'GRANTED' then
    return new;
  end if;

  v_type := case new.actor_kind
    when 'PRINCIPAL' then 'UNLOCK_ADMIN'
    when 'VICE_PRINCIPAL' then 'UNLOCK_ADMIN'
    when 'GUIDANCE_COUNSELOR' then 'UNLOCK_GUIDANCE'
    when 'DUTY_SUBSTITUTE' then 'UNLOCK_DUTY_SUBSTITUTE'
    else 'UNLOCK_LESSON'
  end;

  insert into public.smartboard_device_commands(
    institution_code,smartboard_device_key,command_type,payload,source_event_id,requested_by,not_before,expires_at
  ) values (
    new.institution_code,
    new.smartboard_device_key,
    v_type,
    jsonb_build_object(
      'unlockEventId',new.id,
      'actorKind',new.actor_kind,
      'decisionCode',new.decision_code,
      'scheduleId',new.schedule_id,
      'lessonDate',new.lesson_date,
      'period',new.period,
      'className',new.class_name,
      'subject',new.subject,
      'reason',new.reason
    ),
    new.id,
    new.actor_user_id,
    new.occurred_at,
    case
      when new.actor_kind in ('PRINCIPAL','VICE_PRINCIPAL') then new.occurred_at + interval '15 minutes'
      else new.occurred_at + interval '5 minutes'
    end
  ) on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists trg_enqueue_smartboard_unlock_command on public.smartboard_unlock_events;
create trigger trg_enqueue_smartboard_unlock_command
  after insert on public.smartboard_unlock_events
  for each row execute function public.enqueue_smartboard_unlock_command();
