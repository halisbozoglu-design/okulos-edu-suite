begin;

-- MESEM Elektrik-Elektronik Teknolojisi / 2021-33
-- Güvenli alt-batch 01: Asansör Sistemleri + Bobinaj
-- Resmî kaynak: https://meslek.meb.gov.tr/upload/cop10_mem/2021_elektrik_mem_cop.pdf

insert into course_catalog(name, category, active)
select distinct name, category, true
from (values
 ('Türk Dili ve Edebiyatı','zorunlu'),('Din Kültürü ve Ahlak Bilgisi','zorunlu'),('Matematik','zorunlu'),('Tarih','zorunlu'),('T.C. İnkılap Tarihi ve Atatürkçülük','zorunlu'),
 ('Elektrik-Elektroniğe Giriş','uygulama'),('Elektrik-Elektronik ve Ölçme','uygulama'),('Elektrik-Elektronik Esasları','uygulama'),('Elektrik-Elektronik Teknik Resmi','uygulama'),('Ahilik Kültürü ve Girişimcilik','uygulama'),
 ('Asansör Montajı ve Bakımı','uygulama'),('Endüstriyel Kontrol ve Arıza Analizi','uygulama'),('Kumanda Teknikleri','uygulama'),('Yürüyen Merdiven ve Yol Sistemleri','uygulama'),('Bilgisayar Destekli Uygulamalar','uygulama'),
 ('AC Motor Kumanda ve Sarım Teknikleri','uygulama'),('DC Motor Sarım Teknikleri','uygulama'),('Trafo Sarımı','uygulama'),('İşletmelerde Mesleki Eğitim','uygulama')
) v(name,category)
on conflict (name) do update set active=true;

with branches(branch_name,source_page) as (values ('Asansör Sistemleri',9::smallint),('Bobinaj',10::smallint)),
grades(grade_level,common_u,common_d,voc,elective,total_u,total_d) as (
 values (9::smallint,6::smallint,8::smallint,2::smallint,2::smallint,42::smallint,44::smallint),
        (10,6,8,4,0,42,44),(11,3,7,7,0,42,46),(12,2,8,8,0,42,48)
), variants(schedule_variant) as (values ('USTALIK'),('DIPLOMA'))
insert into official_curriculum_profiles(
 effective_academic_year,school_type,program_type,field_name,branch_name,grade_level,
 required_hour_total,elective_course_min,elective_course_max,elective_hour_min,elective_hour_max,
 total_hour_min,total_hour_max,total_hour_target,group_rules,source_file_name,source_decision_no,source_note,active,
 schedule_variant,common_hours,vocational_hours,elective_vocational_hours,elective_hours,guidance_hours,enterprise_hours,
 applicability_status,source_page,parsed_constraints,academic_support_hours)
select '2026-2027','MESEM','MESEM','Elektrik-Elektronik Teknolojisi',b.branch_name,g.grade_level,
 (case when v.schedule_variant='USTALIK' then g.common_u else g.common_d end)+g.voc+32,
 0,0,0,g.elective,
 case when v.schedule_variant='USTALIK' then g.total_u else g.total_d end,
 case when v.schedule_variant='USTALIK' then g.total_u else g.total_d end,
 case when v.schedule_variant='USTALIK' then g.total_u else g.total_d end,
 '[]'::jsonb,'https://meslek.meb.gov.tr/upload/cop10_mem/2021_elektrik_mem_cop.pdf','2021-33',
 'Parantezli temel ders saatleri diploma programı için ilave fark dersleridir; ustalık ve diploma profilleri ayrı tutulur.',true,
 v.schedule_variant,case when v.schedule_variant='USTALIK' then g.common_u else g.common_d end,g.voc,0,g.elective,0,32,
 'CURRENTLY_VALID',b.source_page,
 '{"enterpriseDays":4,"enterpriseHoursPerDay":8,"parentheticalHoursMeaning":"DIPLOMA_ADDITIONAL_DIFFERENCE_COURSES"}'::jsonb,0
from branches b cross join grades g cross join variants v
on conflict (effective_academic_year,school_type,coalesce(school_subtype,''),coalesce(program_type,''),coalesce(field_name,''),coalesce(branch_name,''),grade_level,coalesce(schedule_variant,'STANDARD'))
do update set required_hour_total=excluded.required_hour_total,elective_hour_max=excluded.elective_hour_max,total_hour_min=excluded.total_hour_min,total_hour_max=excluded.total_hour_max,total_hour_target=excluded.total_hour_target,source_file_name=excluded.source_file_name,source_decision_no=excluded.source_decision_no,source_note=excluded.source_note,active=true,common_hours=excluded.common_hours,vocational_hours=excluded.vocational_hours,elective_hours=excluded.elective_hours,enterprise_hours=excluded.enterprise_hours,source_page=excluded.source_page,parsed_constraints=excluded.parsed_constraints,updated_at=now();

with rows(branch_name,source_page,grade_level,schedule_variant,course_name,category,hours) as (
 values
 ('Asansör Sistemleri',9,9,'USTALIK','Türk Dili ve Edebiyatı','zorunlu',2),('Asansör Sistemleri',9,9,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,9,'USTALIK','Matematik','zorunlu',2),('Asansör Sistemleri',9,9,'USTALIK','Elektrik-Elektroniğe Giriş','uygulama',2),('Asansör Sistemleri',9,9,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Asansör Sistemleri',9,9,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',2),('Asansör Sistemleri',9,9,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,9,'DIPLOMA','Matematik','zorunlu',2),('Asansör Sistemleri',9,9,'DIPLOMA','Tarih','zorunlu',2),('Asansör Sistemleri',9,9,'DIPLOMA','Elektrik-Elektroniğe Giriş','uygulama',2),('Asansör Sistemleri',9,9,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Asansör Sistemleri',9,10,'USTALIK','Türk Dili ve Edebiyatı','zorunlu',2),('Asansör Sistemleri',9,10,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,10,'USTALIK','Matematik','zorunlu',2),('Asansör Sistemleri',9,10,'USTALIK','Elektrik-Elektronik ve Ölçme','uygulama',2),('Asansör Sistemleri',9,10,'USTALIK','Elektrik-Elektronik Esasları','uygulama',1),('Asansör Sistemleri',9,10,'USTALIK','Elektrik-Elektronik Teknik Resmi','uygulama',1),('Asansör Sistemleri',9,10,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Asansör Sistemleri',9,10,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',2),('Asansör Sistemleri',9,10,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,10,'DIPLOMA','Matematik','zorunlu',2),('Asansör Sistemleri',9,10,'DIPLOMA','T.C. İnkılap Tarihi ve Atatürkçülük','zorunlu',2),('Asansör Sistemleri',9,10,'DIPLOMA','Elektrik-Elektronik ve Ölçme','uygulama',2),('Asansör Sistemleri',9,10,'DIPLOMA','Elektrik-Elektronik Esasları','uygulama',1),('Asansör Sistemleri',9,10,'DIPLOMA','Elektrik-Elektronik Teknik Resmi','uygulama',1),('Asansör Sistemleri',9,10,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Asansör Sistemleri',9,11,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,11,'USTALIK','Matematik','zorunlu',1),('Asansör Sistemleri',9,11,'USTALIK','Asansör Montajı ve Bakımı','uygulama',6),('Asansör Sistemleri',9,11,'USTALIK','Endüstriyel Kontrol ve Arıza Analizi','uygulama',1),('Asansör Sistemleri',9,11,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Asansör Sistemleri',9,11,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',2),('Asansör Sistemleri',9,11,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,11,'DIPLOMA','Matematik','zorunlu',3),('Asansör Sistemleri',9,11,'DIPLOMA','Asansör Montajı ve Bakımı','uygulama',6),('Asansör Sistemleri',9,11,'DIPLOMA','Endüstriyel Kontrol ve Arıza Analizi','uygulama',1),('Asansör Sistemleri',9,11,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Asansör Sistemleri',9,12,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,12,'USTALIK','Ahilik Kültürü ve Girişimcilik','uygulama',1),('Asansör Sistemleri',9,12,'USTALIK','Kumanda Teknikleri','uygulama',3),('Asansör Sistemleri',9,12,'USTALIK','Yürüyen Merdiven ve Yol Sistemleri','uygulama',2),('Asansör Sistemleri',9,12,'USTALIK','Bilgisayar Destekli Uygulamalar','uygulama',2),('Asansör Sistemleri',9,12,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Asansör Sistemleri',9,12,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',3),('Asansör Sistemleri',9,12,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Asansör Sistemleri',9,12,'DIPLOMA','Matematik','zorunlu',3),('Asansör Sistemleri',9,12,'DIPLOMA','Ahilik Kültürü ve Girişimcilik','uygulama',1),('Asansör Sistemleri',9,12,'DIPLOMA','Kumanda Teknikleri','uygulama',3),('Asansör Sistemleri',9,12,'DIPLOMA','Yürüyen Merdiven ve Yol Sistemleri','uygulama',2),('Asansör Sistemleri',9,12,'DIPLOMA','Bilgisayar Destekli Uygulamalar','uygulama',2),('Asansör Sistemleri',9,12,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,9,'USTALIK','Türk Dili ve Edebiyatı','zorunlu',2),('Bobinaj',10,9,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,9,'USTALIK','Matematik','zorunlu',2),('Bobinaj',10,9,'USTALIK','Elektrik-Elektroniğe Giriş','uygulama',2),('Bobinaj',10,9,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,9,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',2),('Bobinaj',10,9,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,9,'DIPLOMA','Matematik','zorunlu',2),('Bobinaj',10,9,'DIPLOMA','Tarih','zorunlu',2),('Bobinaj',10,9,'DIPLOMA','Elektrik-Elektroniğe Giriş','uygulama',2),('Bobinaj',10,9,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,10,'USTALIK','Türk Dili ve Edebiyatı','zorunlu',2),('Bobinaj',10,10,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,10,'USTALIK','Matematik','zorunlu',2),('Bobinaj',10,10,'USTALIK','Elektrik-Elektronik ve Ölçme','uygulama',2),('Bobinaj',10,10,'USTALIK','Elektrik-Elektronik Esasları','uygulama',1),('Bobinaj',10,10,'USTALIK','Elektrik-Elektronik Teknik Resmi','uygulama',1),('Bobinaj',10,10,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,10,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',2),('Bobinaj',10,10,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,10,'DIPLOMA','Matematik','zorunlu',2),('Bobinaj',10,10,'DIPLOMA','T.C. İnkılap Tarihi ve Atatürkçülük','zorunlu',2),('Bobinaj',10,10,'DIPLOMA','Elektrik-Elektronik ve Ölçme','uygulama',2),('Bobinaj',10,10,'DIPLOMA','Elektrik-Elektronik Esasları','uygulama',1),('Bobinaj',10,10,'DIPLOMA','Elektrik-Elektronik Teknik Resmi','uygulama',1),('Bobinaj',10,10,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,11,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,11,'USTALIK','Matematik','zorunlu',1),('Bobinaj',10,11,'USTALIK','AC Motor Kumanda ve Sarım Teknikleri','uygulama',6),('Bobinaj',10,11,'USTALIK','Endüstriyel Kontrol ve Arıza Analizi','uygulama',1),('Bobinaj',10,11,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,11,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',2),('Bobinaj',10,11,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,11,'DIPLOMA','Matematik','zorunlu',3),('Bobinaj',10,11,'DIPLOMA','AC Motor Kumanda ve Sarım Teknikleri','uygulama',6),('Bobinaj',10,11,'DIPLOMA','Endüstriyel Kontrol ve Arıza Analizi','uygulama',1),('Bobinaj',10,11,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,12,'USTALIK','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,12,'USTALIK','Ahilik Kültürü ve Girişimcilik','uygulama',1),('Bobinaj',10,12,'USTALIK','DC Motor Sarım Teknikleri','uygulama',3),('Bobinaj',10,12,'USTALIK','Trafo Sarımı','uygulama',2),('Bobinaj',10,12,'USTALIK','Bilgisayar Destekli Uygulamalar','uygulama',2),('Bobinaj',10,12,'USTALIK','İşletmelerde Mesleki Eğitim','uygulama',32),
 ('Bobinaj',10,12,'DIPLOMA','Türk Dili ve Edebiyatı','zorunlu',3),('Bobinaj',10,12,'DIPLOMA','Din Kültürü ve Ahlak Bilgisi','zorunlu',2),('Bobinaj',10,12,'DIPLOMA','Matematik','zorunlu',3),('Bobinaj',10,12,'DIPLOMA','Ahilik Kültürü ve Girişimcilik','uygulama',1),('Bobinaj',10,12,'DIPLOMA','DC Motor Sarım Teknikleri','uygulama',3),('Bobinaj',10,12,'DIPLOMA','Trafo Sarımı','uygulama',2),('Bobinaj',10,12,'DIPLOMA','Bilgisayar Destekli Uygulamalar','uygulama',2),('Bobinaj',10,12,'DIPLOMA','İşletmelerde Mesleki Eğitim','uygulama',32)
)
insert into official_course_schedule_catalog(effective_academic_year,school_type,program_type,grade_level,course_id,category,hour_options,max_selections,repeat_across_years,source_file_name,source_note,active,field_name,branch_name,parsed_constraints,source_decision_no,source_page,source_section,parser_confidence,needs_review,schedule_variant)
select '2026-2027','MESEM','MESEM',r.grade_level,c.id,r.category,array[r.hours]::smallint[],1,true,
 'https://meslek.meb.gov.tr/upload/cop10_mem/2021_elektrik_mem_cop.pdf',
 '2021-33 resmî MESEM haftalık ders çizelgesi; parantezli temel dersler yalnız DIPLOMA fark dersi olarak işlendi.',true,
 'Elektrik-Elektronik Teknolojisi',r.branch_name,
 case when r.course_name='İşletmelerde Mesleki Eğitim' then '{"enterpriseDays":4,"enterpriseHoursPerDay":8}'::jsonb else '{}'::jsonb end,
 '2021-33',r.source_page,'HAFTALIK DERS ÇİZELGESİ',1.0,false,r.schedule_variant
from rows r join course_catalog c on c.name=r.course_name
on conflict (effective_academic_year,school_type,coalesce(school_subtype,''),coalesce(program_type,''),coalesce(field_name,''),coalesce(branch_name,''),grade_level,course_id,coalesce(schedule_variant,'STANDARD'))
do update set category=excluded.category,hour_options=excluded.hour_options,source_file_name=excluded.source_file_name,source_note=excluded.source_note,active=true,parsed_constraints=excluded.parsed_constraints,source_decision_no=excluded.source_decision_no,source_page=excluded.source_page,source_section=excluded.source_section,parser_confidence=excluded.parser_confidence,needs_review=false,updated_at=now();

commit;
