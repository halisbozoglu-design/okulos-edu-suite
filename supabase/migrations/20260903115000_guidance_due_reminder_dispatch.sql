-- Materialize due guidance reminders into the existing OkulOS notification stream.
-- Safe for repeated calls: reminder row is locked and marked SENT exactly once.

create or replace function public.dispatch_my_due_guidance_reminders()
returns table(notification_id uuid, activity_id uuid, title text)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_row record;
  v_notification uuid;
begin
  if v_user is null then raise exception 'UNAUTHENTICATED'; end if;

  for v_row in
    select
      r.id as reminder_id,
      r.activity_id,
      r.institution_code,
      g.title as activity_title,
      g.activity_date,
      g.starts_at,
      si.display_name as section_name,
      pr.room_code
    from public.guidance_activity_reminders r
    join public.guidance_class_activities g on g.id=r.activity_id
    join public.section_instances si on si.id=g.section_instance_id and si.institution_code=g.institution_code
    join public.physical_rooms pr on pr.id=g.physical_room_id and pr.institution_code=g.institution_code
    where r.counselor_user_id=v_user
      and r.status='PENDING'
      and r.remind_at<=now()
      and g.active=true
      and public.has_institution_access(r.institution_code)
    order by r.remind_at
    for update of r skip locked
  loop
    insert into public.notifications(user_id,type,priority,title,message,action_label,action_url)
    values(
      v_user,
      'system',
      'normal',
      'Rehberlik etkinliği yaklaşıyor',
      format('%s · %s · %s · %s',v_row.section_name,to_char(v_row.activity_date,'DD.MM.YYYY'),to_char(v_row.starts_at,'HH24:MI'),v_row.activity_title),
      'Etkinliği Aç',
      '/guidance-calendar'
    )
    returning id into v_notification;

    update public.guidance_activity_reminders
    set status='SENT',sent_at=now()
    where id=v_row.reminder_id and status='PENDING';

    return query select v_notification,v_row.activity_id,v_row.activity_title;
  end loop;
end $$;

revoke all on function public.dispatch_my_due_guidance_reminders() from public;
grant execute on function public.dispatch_my_due_guidance_reminders() to authenticated;
