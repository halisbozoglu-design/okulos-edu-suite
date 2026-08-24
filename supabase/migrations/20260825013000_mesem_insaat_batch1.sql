begin;
-- İnşaat Teknolojisi MESEM 2021-33, batch 1:
-- Ahşap Yapı Sistemleri, Beton-Çimento ve Zemin Teknolojisi,
-- Betonarme Kalıp ve Donatı Sistemleri, Cephe Sistemleri ve PVC Doğrama.
-- 9-12 USTALIK/DIPLOMA profilleri ve gerçek ders satırları Cloud'a uygulanmıştır.
insert into supabase_migrations.schema_migrations(version,name) values ('20260825013000','mesem_insaat_batch1') on conflict(version) do nothing;
commit;
