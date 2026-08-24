do $$
declare branch_v text; grade_v int; variant_v text;
begin
  foreach branch_v in array array['Döküm','İzabe ve Haddecilik'] loop
    for grade_v in 9..12 loop
      foreach variant_v in array array['USTALIK','DIPLOMA'] loop
        insert into official_curriculum_profiles(effective_academic_year,school_type,program_type,field_name,branch_name,grade_level,required_course_count,required_hour_total,elective_course_min,elective_course_max,elective_hour_min,elective_hour_max,total_hour_min,total_hour_max,total_hour_target,source_file_name,source_decision_no,source_note,active,schedule_variant,common_hours,vocational_hours,elective_hours,guidance_hours,enterprise_hours,academic_support_hours,applicability_status)
        select '2026-2027','MESEM','MESEM','Metalürji Teknolojisi',branch_v,grade_v,0,
          case when variant_v='USTALIK' then case grade_v when 9 then 40 else 42 end else case grade_v when 9 then 42 when 10 then 44 when 11 then 46 else 48 end end,
          0,0,0,case when grade_v=9 then 2 else 0 end,
          case when variant_v='USTALIK' then 42 else case grade_v when 9 then 44 when 10 then 44 when 11 then 46 else 48 end end,
          case when variant_v='USTALIK' then 42 else case grade_v when 9 then 44 when 10 then 44 when 11 then 46 else 48 end end,
          case when variant_v='USTALIK' then 42 else case grade_v when 9 then 44 when 10 then 44 when 11 then 46 else 48 end end,
          'https://meslek.meb.gov.tr/cercevelistele.aspx?kurum_id=2&sinif_kodu='||grade_v,'2023-11',
          case when branch_v='İzabe ve Haddecilik' then '2023-11 yaşayan MESEM Metalürji programı; resmî çizelgedeki İzabe dalı kanonik katalogdaki İzabe ve Haddecilik dalına eşlenmiştir.' else '2023-11 yaşayan MESEM Metalürji programı.' end,true,variant_v,
          case when variant_v='USTALIK' then case grade_v when 9 then 6 when 10 then 6 when 11 then 3 else 2 end else case grade_v when 9 then 8 when 10 then 8 when 11 then 7 else 8 end end,
          case grade_v when 9 then 2 when 10 then 4 when 11 then 7 else 8 end,
          case when grade_v=9 then 2 else 0 end,0,32,0,'ACTIVE'
        on conflict (effective_academic_year,school_type,coalesce(school_subtype,''),coalesce(program_type,''),coalesce(field_name,''),coalesce(branch_name,''),grade_level,coalesce(schedule_variant,'STANDARD')) do update set source_decision_no=excluded.source_decision_no,source_file_name=excluded.source_file_name,source_note=excluded.source_note,active=true,updated_at=now();
      end loop;
    end loop;
  end loop;

  insert into course_catalog(name,category,active)
  select x,'uygulama',true from unnest(array['Temel Döküm Teknolojisine Giriş','Teknik Resim','Temel Döküm Teknolojileri','Ahilik Kültürü ve Girişimcilik','Kalıplama','Metal Ergitme','Temel Elektrik','Bilgisayar Destekli Katı Modelleme','Döküm Laboratuvarı','Özel Döküm Yöntemleri','Mekanik İşlemler','Bilgisayar Destekli Döküm Meslek Resmi','Kok Üretimi','Ham Demir Üretimi','Haddeleme','Isıl İşlem Teknikleri','Kalite Kontrol','Çelik Üretimi','Bilgisayar Destekli İzabe Meslek Resmi']) x
  where not exists(select 1 from course_catalog c where c.name=x);

  delete from official_course_schedule_catalog where school_type='MESEM' and field_name='Metalürji Teknolojisi' and branch_name in ('Döküm','İzabe ve Haddecilik') and effective_academic_year='2026-2027';

  insert into official_course_schedule_catalog(effective_academic_year,school_type,program_type,grade_level,course_id,category,hour_options,max_selections,repeat_across_years,source_file_name,source_note,active,field_name,branch_name,source_decision_no,source_page,parser_confidence,needs_review,schedule_variant)
  select '2026-2027','MESEM','MESEM',m.grade_level,m.course_id,m.category,m.hour_options,m.max_selections,m.repeat_across_years,'https://meslek.meb.gov.tr/cercevelistele.aspx?kurum_id=2&sinif_kodu='||m.grade_level,'2023-11 Metalürji; ortak temel dersler doğrulanmış MESEM şablonundan.',true,'Metalürji Teknolojisi',br.branch_name,'2023-11',case when br.branch_name='Döküm' then 7 else 8 end,1,false,m.schedule_variant
  from official_course_schedule_catalog m
  cross join unnest(array['Döküm','İzabe ve Haddecilik']) as br(branch_name)
  join course_catalog c on c.id=m.course_id
  where m.active and m.school_type='MESEM' and m.field_name='Makine Teknolojisi' and m.branch_name='Makine Bakım Onarım' and m.effective_academic_year='2026-2027'
    and c.name in ('Türk Dili ve Edebiyatı','Din Kültürü ve Ahlak Bilgisi','Matematik','Tarih','T.C. İnkılap Tarihi ve Atatürkçülük','İşletmelerde Mesleki Eğitim');

  insert into official_course_schedule_catalog(effective_academic_year,school_type,program_type,grade_level,course_id,category,hour_options,max_selections,repeat_across_years,source_file_name,source_note,active,field_name,branch_name,source_decision_no,source_page,parser_confidence,needs_review,schedule_variant)
  select '2026-2027','MESEM','MESEM',x.grade_level,c.id,'uygulama',array[x.hours],1,false,'https://meslek.meb.gov.tr/cercevelistele.aspx?kurum_id=2&sinif_kodu='||x.grade_level,'2023-11 Metalürji resmî haftalık çizelgesi.',true,'Metalürji Teknolojisi',x.branch_name,'2023-11',case when x.branch_name='Döküm' then 7 else 8 end,1,false,var.variant_name
  from (values
    ('Döküm',9,'Temel Döküm Teknolojisine Giriş',2),('Döküm',10,'Teknik Resim',2),('Döküm',10,'Temel Döküm Teknolojileri',2),('Döküm',11,'Kalıplama',2),('Döküm',11,'Metal Ergitme',2),('Döküm',11,'Temel Elektrik',1),('Döküm',11,'Bilgisayar Destekli Katı Modelleme',2),('Döküm',12,'Ahilik Kültürü ve Girişimcilik',1),('Döküm',12,'Döküm Laboratuvarı',1),('Döküm',12,'Özel Döküm Yöntemleri',2),('Döküm',12,'Mekanik İşlemler',1),('Döküm',12,'Bilgisayar Destekli Döküm Meslek Resmi',3),
    ('İzabe ve Haddecilik',9,'Temel Döküm Teknolojisine Giriş',2),('İzabe ve Haddecilik',10,'Teknik Resim',2),('İzabe ve Haddecilik',10,'Temel Döküm Teknolojileri',2),('İzabe ve Haddecilik',11,'Kok Üretimi',3),('İzabe ve Haddecilik',11,'Ham Demir Üretimi',2),('İzabe ve Haddecilik',11,'Bilgisayar Destekli Katı Modelleme',2),('İzabe ve Haddecilik',12,'Ahilik Kültürü ve Girişimcilik',1),('İzabe ve Haddecilik',12,'Haddeleme',1),('İzabe ve Haddecilik',12,'Isıl İşlem Teknikleri',1),('İzabe ve Haddecilik',12,'Kalite Kontrol',1),('İzabe ve Haddecilik',12,'Çelik Üretimi',1),('İzabe ve Haddecilik',12,'Bilgisayar Destekli İzabe Meslek Resmi',3)
  ) x(branch_name,grade_level,course_name,hours)
  join course_catalog c on c.name=x.course_name
  cross join unnest(array['USTALIK','DIPLOMA']) as var(variant_name);
end$$;