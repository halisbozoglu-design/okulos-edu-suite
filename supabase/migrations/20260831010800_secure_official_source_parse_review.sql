-- A detected official source change cannot be promoted by a bare status update.
-- The parse evidence and the human review note stay with the queue item, then the
-- existing approval/apply flow remains the only path to a curriculum change.

create or replace function public.mark_official_source_change_parsed_v2(
  p_queue_id uuid,
  p_parser_result jsonb,
  p_review_note text,
  p_effective_from date default null,
  p_approval_required boolean default true
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null or not public.is_super_admin() then
    raise exception 'SUPER_ADMIN_REQUIRED';
  end if;

  if jsonb_typeof(p_parser_result) <> 'object' then
    raise exception 'SOURCE_PARSE_RESULT_INVALID';
  end if;

  if nullif(btrim(coalesce(p_parser_result->>'parser_version','')), '') is null
     or nullif(btrim(coalesce(p_parser_result->>'source_hash','')), '') is null then
    raise exception 'SOURCE_PARSE_EVIDENCE_REQUIRED';
  end if;

  if char_length(btrim(coalesce(p_review_note,''))) < 10 then
    raise exception 'SOURCE_PARSE_REVIEW_NOTE_REQUIRED';
  end if;

  v_result := p_parser_result || jsonb_build_object(
    'review_note', btrim(p_review_note),
    'reviewed_by', auth.uid(),
    'reviewed_at', now()
  );

  update public.official_source_change_queue
  set parser_result=v_result,
      effective_from=coalesce(p_effective_from,effective_from),
      approval_required=p_approval_required,
      status=case when p_approval_required then 'PARSED_AWAITING_APPROVAL' else 'PARSED_READY' end,
      parsed_at=now()
  where id=p_queue_id
    and status in ('DETECTED','PARSE_FAILED');

  if not found then
    raise exception 'SOURCE_CHANGE_NOT_READY_FOR_PARSE_REVIEW';
  end if;
end;
$$;

revoke all on function public.mark_official_source_change_parsed_v2(uuid,jsonb,text,date,boolean) from public, anon;
grant execute on function public.mark_official_source_change_parsed_v2(uuid,jsonb,text,date,boolean) to authenticated;
