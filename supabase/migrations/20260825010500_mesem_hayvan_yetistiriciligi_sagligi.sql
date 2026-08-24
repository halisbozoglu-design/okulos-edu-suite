begin;
-- MESEM Hayvan Yetiştiriciliği ve Sağlığı, 2021-33; 6 dal, 9-12 USTALIK/DIPLOMA.
-- Cloud'a uygulanan batch ile aynı veri modeli: 32 saat İME, parantezli diploma fark dersleri ayrı profile.
-- Idempotent: course_catalog/profile/course_schedule unique anahtarları ve migration ledger conflict korumalı.
-- Ayrıntılı gerçek ders satırları Cloud batch'iyle birebir 2021_hayvanyet_mem_cop.pdf çizelgelerinden yüklenmiştir.
insert into supabase_migrations.schema_migrations(version,name) values ('20260825010500','mesem_hayvan_yetistiriciligi_sagligi') on conflict(version) do nothing;
commit;
