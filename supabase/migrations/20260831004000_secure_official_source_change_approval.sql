-- Source changes are detected automatically but never change curriculum data
-- without an explicit, auditable Super Admin decision.
alter table public.official_source_change_queue
  add column if not exists approved_by uuid references public.profiles(user_id) on delete set null,
  add column if not exists applied_by uuid references public.profiles(user_id) on delete set null;

create or replace function public.list_official_source_changes_v1()
returns table(queue_id uuid,status text,change_type text,detected_at timestamptz,effective_from date,approval_required boolean,source_key text,source_url text,decision_no text,title text,parser_result jsonb,approved_by uuid,approved_at timestamptz,applied_at timestamptz,note text)
language sql stable security definer set search_path=public as $$
  select q.id,q.status,q.change_type,q.detected_at,q.effective_from,q.approval_required,
    r.source_key,r.source_url,s.decision_no,s.title,q.parser_result,q.approved_by,q.approved_at,q.applied_at,q.note
  from public.official_source_change_queue q
  join public.official_source_registry r on r.id=q.source_id
  join public.official_source_snapshots s on s.id=q.snapshot_id
  where public.is_super_admin()
  order by q.detected_at desc;
$$;

create or replace function public.approve_official_source_change_v2(p_queue_id uuid,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_super_admin() then raise exception 'SUPER_ADMIN_REQUIRED'; end if;
  update public.official_source_change_queue
  set status='APPROVED',approved_at=now(),approved_by=auth.uid(),note=coalesce(nullif(btrim(p_note),''),note)
  where id=p_queue_id and status in ('PARSED_AWAITING_APPROVAL','PARSED_READY') and parsed_at is not null;
  if not found then raise exception 'SOURCE_CHANGE_NOT_READY_FOR_APPROVAL'; end if;
end $$;

create or replace function public.mark_official_source_change_applied_v1(p_queue_id uuid,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_super_admin() then raise exception 'SUPER_ADMIN_REQUIRED'; end if;
  update public.official_source_change_queue
  set status='APPLIED',applied_at=now(),applied_by=auth.uid(),note=coalesce(nullif(btrim(p_note),''),note)
  where id=p_queue_id and status='APPROVED';
  if not found then raise exception 'SOURCE_CHANGE_NOT_APPROVED'; end if;
end $$;

revoke all on function public.list_official_source_changes_v1(),public.approve_official_source_change_v2(uuid,text),public.mark_official_source_change_applied_v1(uuid,text) from public;
grant execute on function public.list_official_source_changes_v1(),public.approve_official_source_change_v2(uuid,text),public.mark_official_source_change_applied_v1(uuid,text) to authenticated;
[codex/turkiye-teacher-exception fac5477] feat: secure official source change approval
 1 file changed, 40 insertions(+)
 create mode 100644 supabase/migrations/20260831004000_secure_official_source_change_approval.sql
fac5477140382dbb4ba7c5168269709792fcd242
