create or replace function public.preview_official_course_transition_impact_v1(p_mapping_id uuid)
returns table(mapping_id uuid,class_id uuid,class_name text,requirement_id uuid,source_course_name text,target_course_name text,weekly_hours smallint,locked boolean,note text,recommended_action text)
language sql stable security definer set search_path=public as $$
 select m.id,sc.id,sc.class_name,r.id,s.name,t.name,r.weekly_hours,r.locked,r.note,
   case when r.locked then 'PRESERVE_LOCKED' when coalesce(r.note,'') not like 'RESMI_CIZELGE:%' then 'REVIEW_MANUAL' else 'READY_FOR_DRAFT_REPLACEMENT' end
 from public.official_course_transition_mappings m
 join public.course_catalog s on s.id=m.source_course_id
 join public.course_catalog t on t.id=m.target_course_id
 join public.class_course_requirements r on r.course_id=m.source_course_id
 join public.school_classes sc on sc.id=r.class_id
 where m.id=p_mapping_id and m.active and public.is_super_admin()
 order by sc.class_name;
$$;
revoke all on function public.preview_official_course_transition_impact_v1(uuid) from public;
grant execute on function public.preview_official_course_transition_impact_v1(uuid) to authenticated;