begin;

delete from public.official_curriculum_profiles
where effective_academic_year='2026-2027' and school_type='MTAL' and field_name='Bilişim Teknolojileri';

with branches(branch_name,p26_amp,p26_atp,p26_e11,p24_amp,p24_atp,p24_e11) as (
 values ('Yazılım Geliştirme',18::smallint,19::smallint,20::smallint,11::smallint,12::smallint,13::smallint),
        ('Ağ İşletmenliği',21::smallint,22::smallint,23::smallint,14::smallint,15::smallint,16::smallint)
), rows as (
 select b.branch_name,'AMP'::text program_type,'STANDARD'::text schedule_variant,9::smallint grade,28::smallint common_h,12::smallint voc_h,0::smallint ev_h,4::smallint el_h,1::smallint guide_h,0::smallint ent_h,45::smallint total_h,'CURRENTLY_VALID'::text app,'2026-85'::text decision,b.p26_amp page,'2026'::text src from branches b
 union all select b.branch_name,'ATP','STANDARD',9,28,12,0,4,1,0,45,'CURRENTLY_VALID','2026-85',b.p26_atp,'2026' from branches b
 union all select b.branch_name,'AMP','ENTERPRISE_FROM_11',9,28,12,0,4,1,0,45,'CURRENTLY_VALID','2026-85',b.p26_e11,'2026' from branches b
 union all select b.branch_name,'AMP','STANDARD',10,27,13,0,4,1,0,45,'TRANSITIONALLY_VALID','2024-41',b.p24_amp,'2024' from branches b
 union all select b.branch_name,'AMP','STANDARD',11,15,17,12,0,1,0,45,'TRANSITIONALLY_VALID','2024-41',b.p24_amp,'2024' from branches b
 union all select b.branch_name,'AMP','STANDARD',12,10,24,11,0,0,24,45,'TRANSITIONALLY_VALID','2024-41',b.p24_amp,'2024' from branches b
 union all select b.branch_name,'ATP','STANDARD',10,27,13,0,4,1,0,45,'TRANSITIONALLY_VALID','2024-41',b.p24_atp,'2024' from branches b
 union all select b.branch_name,'ATP','STANDARD',11,15,9,0,20,1,0,45,'TRANSITIONALLY_VALID','2024-41',b.p24_atp,'2024' from branches b
 union all select b.branch_name,'ATP','STANDARD',12,10,8,3,24,0,0,45,'TRANSITIONALLY_VALID','2024-41',b.p24_atp,'2024' from branches b
 union all select b.branch_name,'AMP','ENTERPRISE_FROM_11',10,27,13,0,4,1,0,45,'TRANSITIONALLY_VALID','2024-41',b.p24_e11,'2024' from branches b
 union all select b.branch_name,'AMP','ENTERPRISE_FROM_11',11,15,25,0,4,1,16,45,'TRANSITIONALLY_VALID','2024-41',b.p24_e11,'2024' from branches b
 union all select b.branch_name,'AMP','ENTERPRISE_FROM_11',12,10,32,0,4,0,24,46,'TRANSITIONALLY_VALID','2024-41',b.p24_e11,'2024' from branches b
)
insert into public.official_curriculum_profiles(
 effective_academic_year,school_type,school_subtype,program_type,field_name,branch_name,grade_level,
 required_course_count,required_hour_total,elective_course_min,elective_course_max,elective_hour_min,elective_hour_max,
 total_hour_min,total_hour_max,total_hour_target,group_rules,source_file_name,source_decision_no,source_note,active,
 schedule_variant,common_hours,vocational_hours,elective_vocational_hours,elective_hours,guidance_hours,enterprise_hours,
 applicability_status,source_page,parsed_constraints)
select '2026-2027','MTAL',null,r.program_type,'Bilişim Teknolojileri',r.branch_name,r.grade,
 0,(r.common_h+r.voc_h+r.guide_h)::smallint,0,null,0,(r.ev_h+r.el_h)::smallint,
 r.total_h,r.total_h,r.total_h,'[]'::jsonb,
 case when r.src='2026' then 'bilisim_9.pdf' else 'bilisim_10.pdf' end,r.decision,
 case when r.app='CURRENTLY_VALID' then '2026-85: 2026-2027 hazırlık/9. sınıftan başlayan kademeli uygulama' else '2024-41: 2026-2027 üst sınıflarda yaşayan geçiş bileşeni' end,true,
 r.schedule_variant,r.common_h,r.voc_h,r.ev_h,r.el_h,r.guide_h,r.ent_h,r.app,r.page,
 jsonb_build_object('sourceKind','FRAMEWORK_SCHEDULE','phaseRule',case when r.app='CURRENTLY_VALID' then 'STARTS_GRADE_9_2026_2027' else 'TRANSITION_UPPER_GRADES_2026_2027' end,
 'enterpriseFrom11RequiresApproval',r.schedule_variant='ENTERPRISE_FROM_11','preserveVocationalHourIntegrity',true)
from rows r;

commit;
