create or replace function public.apply_official_course_transition_to_drafts_v1(p_mapping_id uuid,p_confirm boolean default false)
returns integer language plpgsql security definer set search_path=public as $$
declare m record; v_count integer;
begin
 if not public.is_super_admin() then raise exception 'SUPER_ADMIN_REQUIRED'; end if;
 if not p_confirm then raise exception 'COURSE_TRANSITION_CONFIRMATION_REQUIRED'; end if;
 select * into m from public.official_course_transition_mappings where id=p_mapping_id and active;
 if not found then raise exception 'COURSE_TRANSITION_NOT_FOUND'; end if;
 if m.transition_kind='RETIRED' then raise exception 'RETIRED_COURSE_REQUIRES_MANUAL_REVIEW'; end if;
 update public.class_course_requirements r set course_id=m.target_course_id,note='RESMI_CIZELGE:TRANSITION:'||m.id::text,updated_at=now()
 where r.course_id=m.source_course_id and not r.locked and coalesce(r.note,'') like 'RESMI_CIZELGE:%'
   and not exists(select 1 from public.class_course_requirements x where x.class_id=r.class_id and x.course_id=m.target_course_id);
 get diagnostics v_count=row_count;
 return v_count;
end $$;
revoke all on function public.apply_official_course_transition_to_drafts_v1(uuid,boolean) from public;
grant execute on function public.apply_official_course_transition_to_drafts_v1(uuid,boolean) to authenticated;