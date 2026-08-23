begin;
insert into course_catalog(name,category) values
('Malzeme ve Üretim Yöntemleri','uygulama'),('Endüstriyel Kalite','uygulama'),('Tahribatlı Malzeme Muayene','uygulama') on conflict(name) do nothing;

insert into official_curriculum_profiles(effective_academic_year,school_type,program_type,field_name,branch_name,grade_level,required_course_count,required_hour_total,elective_course_min,elective_course_max,elective_hour_min,elective_hour_max,total_hour_min,total_hour_max,total_hour_target,group_rules,source_file_name,source_decision_no,source_note,active,schedule_variant,common_hours,vocational_hours,elective_vocational_hours,elective_hours,guidance_hours,enterprise_hours,applicability_status,source_page,parsed_constraints,academic_support_hours)
select '2026-2027','MTAL',v.pt,'Endüstriyel Kalite Kontrol','Endüstriyel Kalite Kontrol',10,0,41,0,0,4,4,45,45,45,'{}'::jsonb,'endustriyel_kalite_kontrol_10.pdf','2025-49','MTEGM 2025-49 yaşayan Endüstriyel Kalite Kontrol 10. sınıf çizelgesi.',true,v.sv,27,13,0,4,1,0,'TRANSITIONALLY_VALID',v.pg,'{}'::jsonb,0
from (values('AMP','STANDARD',17::smallint),('AMP','ENTERPRISE_FROM_11',19::smallint),('ATP','STANDARD',18::smallint)) v(pt,sv,pg)
on conflict do nothing;

insert into official_course_schedule_catalog(effective_academic_year,school_type,program_type,grade_level,course_id,category,hour_options,max_selections,repeat_across_years,source_file_name,source_note,active,field_name,branch_name,parsed_constraints,source_decision_no,source_page,parser_confidence,needs_review,schedule_variant)
select '2026-2027','MTAL',v.pt,10,t.course_id,t.category,t.hour_options,t.max_selections,t.repeat_across_years,'endustriyel_kalite_kontrol_10.pdf','MTEGM 2025-49 Endüstriyel Kalite Kontrol',true,'Endüstriyel Kalite Kontrol','Endüstriyel Kalite Kontrol','{}'::jsonb,'2025-49',v.pg,1,false,v.sv
from (values('AMP','STANDARD',17::smallint),('AMP','ENTERPRISE_FROM_11',19::smallint),('ATP','STANDARD',18::smallint)) v(pt,sv,pg)
join official_course_schedule_catalog t on t.active and t.field_name='Tekstil Teknolojisi' and t.branch_name='Dokuma Üretim Teknolojisi' and t.grade_level=10 and t.program_type=v.pt and t.schedule_variant=v.sv and t.category in ('zorunlu','rehberlik')
on conflict do nothing;

insert into official_course_schedule_catalog(effective_academic_year,school_type,program_type,grade_level,course_id,category,hour_options,max_selections,repeat_across_years,source_file_name,source_note,active,field_name,branch_name,parsed_constraints,source_decision_no,source_page,source_section,parser_confidence,needs_review,schedule_variant)
select '2026-2027','MTAL',v.pt,10,c.id,'uygulama',array[x.h]::smallint[],1,true,'endustriyel_kalite_kontrol_10.pdf','MTEGM 2025-49 Endüstriyel Kalite Kontrol dal dersi',true,'Endüstriyel Kalite Kontrol','Endüstriyel Kalite Kontrol','{}'::jsonb,'2025-49',v.pg,'Haftalık Ders Çizelgesi',1,false,v.sv
from (values('AMP','STANDARD',17::smallint),('AMP','ENTERPRISE_FROM_11',19::smallint),('ATP','STANDARD',18::smallint)) v(pt,sv,pg)
cross join (values('Malzeme ve Üretim Yöntemleri',4::smallint),('Endüstriyel Kalite',2::smallint),('Tahribatlı Malzeme Muayene',7::smallint)) x(n,h)
join course_catalog c on c.name=x.n
on conflict do nothing;

insert into supabase_migrations.schema_migrations(version,name,created_by,statements)
values('20260824022500','mtal_ekk_grade10','chatgpt-direct-cloud',array['EKK grade10 official profiles and rows'])
on conflict(version) do nothing;
commit;
