create or replace function public.audit_mtal_curriculum_v1()
returns table(severity text,code text,field_name text,branch_name text,grade_level smallint,program_type text,schedule_variant text,detail text)
language sql stable security definer set search_path=public as $$
with p as (
 select field_name,coalesce(branch_name,'') branch_name,grade_level,program_type,coalesce(schedule_variant,'STANDARD') schedule_variant,
 required_hour_total,coalesce(elective_hours,0) elective_hours,coalesce(elective_vocational_hours,0) elective_vocational_hours,
 coalesce(academic_support_hours,0) academic_support_hours,total_hour_target,source_file_name,source_decision_no
 from official_curriculum_profiles where school_type='MTAL' and active
),r as(
 select field_name,coalesce(branch_name,'') branch_name,grade_level,program_type,coalesce(schedule_variant,'STANDARD') schedule_variant,
 count(*) row_count,coalesce(sum((hour_options)[1]),0)::int fixed_hours
 from official_course_schedule_catalog where school_type='MTAL' and active group by 1,2,3,4,5
),f(severity,code,field_name,branch_name,grade_level,program_type,schedule_variant,detail) as(
 select 'ERROR','PROFILE_WITHOUT_ROWS',p.field_name,p.branch_name,p.grade_level,p.program_type,p.schedule_variant,'profile exists but no active course rows' from p left join r using(field_name,branch_name,grade_level,program_type,schedule_variant) where coalesce(r.row_count,0)=0
 union all select 'ERROR','FIXED_HOURS_MISMATCH',p.field_name,p.branch_name,p.grade_level,p.program_type,p.schedule_variant,format('profile required=%s rows=%s',p.required_hour_total,r.fixed_hours) from p join r using(field_name,branch_name,grade_level,program_type,schedule_variant) where r.fixed_hours<>p.required_hour_total
 union all select 'ERROR','TOTAL_HOURS_MISMATCH',p.field_name,p.branch_name,p.grade_level,p.program_type,p.schedule_variant,format('target=%s computed=%s',p.total_hour_target,p.required_hour_total+p.elective_hours+p.elective_vocational_hours+p.academic_support_hours) from p where p.total_hour_target is not null and p.required_hour_total+p.elective_hours+p.elective_vocational_hours+p.academic_support_hours<>p.total_hour_target
 union all select 'ERROR','MISSING_SOURCE',p.field_name,p.branch_name,p.grade_level,p.program_type,p.schedule_variant,'missing source file/decision provenance' from p where coalesce(source_file_name,'')='' or coalesce(source_decision_no,'')=''
 union all select 'WARNING','SOURCE_NOT_PDF',p.field_name,p.branch_name,p.grade_level,p.program_type,p.schedule_variant,source_file_name from p where coalesce(source_file_name,'')<>'' and source_file_name not ilike '%.pdf%'
)
select * from f order by severity desc,field_name,branch_name,grade_level,program_type,schedule_variant,code;
$$;