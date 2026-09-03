-- Reporting projections for management audit screens.

create or replace view public.smartboard_unlock_audit_v
with (security_invoker=true)
as
select
  e.id,
  e.institution_code,
  e.smartboard_device_key,
  pr.room_code,
  pr.name as room_name,
  e.actor_user_id,
  p.full_name as actor_name,
  e.actor_kind,
  e.decision,
  e.decision_code,
  e.reason,
  e.schedule_id,
  e.lesson_date,
  e.period,
  e.class_name,
  e.subject,
  e.occurred_at,
  c.id as command_id,
  c.command_type,
  c.status as command_status,
  c.delivered_at,
  c.acknowledged_at
from public.smartboard_unlock_events e
left join public.physical_rooms pr on pr.id=e.physical_room_id and pr.institution_code=e.institution_code
left join public.profiles p on p.user_id=e.actor_user_id
left join public.smartboard_device_commands c on c.source_event_id=e.id;

grant select on public.smartboard_unlock_audit_v to authenticated,service_role;

create or replace function public.smartboard_unlock_summary(
  p_institution_code text,
  p_from timestamptz,
  p_to timestamptz
)
returns table(
  smartboard_device_key text,
  granted_count bigint,
  denied_count bigint,
  scheduled_teacher_count bigint,
  admin_count bigint,
  guidance_count bigint,
  duty_substitute_count bigint
)
language sql
stable
security definer
set search_path=public
as $$
  select
    e.smartboard_device_key,
    count(*) filter(where e.decision='GRANTED') as granted_count,
    count(*) filter(where e.decision='DENIED') as denied_count,
    count(*) filter(where e.actor_kind='SCHEDULED_TEACHER' and e.decision='GRANTED') as scheduled_teacher_count,
    count(*) filter(where e.actor_kind in ('PRINCIPAL','VICE_PRINCIPAL') and e.decision='GRANTED') as admin_count,
    count(*) filter(where e.actor_kind='GUIDANCE_COUNSELOR' and e.decision='GRANTED') as guidance_count,
    count(*) filter(where e.actor_kind='DUTY_SUBSTITUTE' and e.decision='GRANTED') as duty_substitute_count
  from public.smartboard_unlock_events e
  where e.institution_code=p_institution_code
    and e.occurred_at>=p_from
    and e.occurred_at<p_to
    and public.has_institution_access(p_institution_code)
  group by e.smartboard_device_key
  order by e.smartboard_device_key;
$$;

revoke all on function public.smartboard_unlock_summary(text,timestamptz,timestamptz) from public;
grant execute on function public.smartboard_unlock_summary(text,timestamptz,timestamptz) to authenticated,service_role;
