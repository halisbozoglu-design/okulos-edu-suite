create or replace function public.list_official_course_transition_mappings_v1()
returns table(id uuid,source_course_id uuid,source_course_name text,target_course_id uuid,target_course_name text,transition_kind text,effective_from date,decision_no text,reason text,approved_at timestamptz,active boolean)
language sql stable security definer set search_path=public as $$
 select m.id,m.source_course_id,s.name,m.target_course_id,t.name,m.transition_kind,m.effective_from,m.decision_no,m.reason,m.approved_at,m.active
 from public.official_course_transition_mappings m join public.course_catalog s on s.id=m.source_course_id join public.course_catalog t on t.id=m.target_course_id
 where public.is_super_admin() order by m.effective_from desc,m.approved_at desc;
$$;
revoke all on function public.list_official_course_transition_mappings_v1() from public;
grant execute on function public.list_official_course_transition_mappings_v1() to authenticated;