# Okulos — MESEM Nakil/Geçiş Mevzuat Staging

Durum: **STAGING / Super Admin onayı gerekli**  
Kaynak kontrol tarihi: **25.08.2026**

## Resmî kaynak

- MEB Mevzuat Sistemi — Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- İncelenen hükümler: Md.37/3, Md.38/1-5, Md.41/1

## Atomik kurallar

1. **MESEM nakli — Md.37/3**  
   Alan/dal bulunması ve gidilecek yerleşim biriminde bir işletmeyle sözleşme imzalanması şartıyla MESEM öğrencisinin nakli zamana bakılmaksızın yapılabilir.

2. **Alan değişikliği süresi — Md.37/3**  
   MESEM'de 9. sınıfın birinci dönemi sonuna kadar alan değişikliği yapılabilir.

3. **Dal değişikliği süresi — Md.37/3**  
   Aynı alan içinde 10. sınıfın birinci dönemi sonuna kadar dal değişikliği yapılabilir.

4. **Diğer okul türlerinden MESEM'e geçiş — Md.37/3**  
   Okul türüne bakılmaksızın her sınıf seviyesinde MESEM'e nakil ve geçiş mümkündür; ancak mesleki eğitim geçmişi ve alan değişikliği durumuna göre ilave süre/sınıf kuralları uygulanır.

5. **Mesleki eğitim almamış/farklı alan isteyen öğrenci — Md.37/3**  
   Alan seçimi için 10. sınıfın ikinci döneminin başlangıcına kadar nakil/geçiş yapılmış olmalıdır.

6. **Geç başvuru — Md.37/3**  
   Daha önce mesleki eğitim almamış olup 10. sınıf ikinci dönem başlangıcından sonra MESEM'e geçmek isteyen öğrenci yalnız işletmede mesleki eğitim amacıyla kaydedilir; ilgili ders yılı için yılsonu puanı verilmez.

7. **11-12. sınıftan MESEM'e geçiş — Md.37/3**  
   Diğer okul türlerinin 11 ve 12. sınıflarından MESEM'e geçmek isteyenlerin nakli 10. sınıfa kabul edilir.

8. **Nakil değerlendirme çerçevesi — Md.38**  
   Nakil/geçiş işlemleri Md.37 çerçevesinde kontenjan, okul türü, başvuru takvimi ve e-Okul süreçleriyle değerlendirilir. MESEM'e özgü Md.37/3 hükümleri genel nakil motorundan ayrı koşul seti olarak tutulmalıdır.

9. **Açık öğretimden MESEM'e geçiş — Md.41/1**  
   Açık Öğretim Lisesi, Mesleki Açık Öğretim Lisesi veya Açık Öğretim İmam Hatip Lisesinden şartları taşıyan öğrenciler, program ve kontenjan uygunluğu çerçevesinde MESEM'e nakil/geçiş yapabilir.

10. **MESEM'e açık öğretim naklinde kredi istisnası — Md.41/1-b**  
   Mesleki eğitim merkezine nakillerde kredi sayısına bakılmaz.

## Önerilen sistem etkileri

- `MESEM_TRANSFER_CONTRACT_REQUIRED` → L3 / BLOCK
- `MESEM_FIELD_CHANGE_DEADLINE` → L2 / PROCESS
- `MESEM_BRANCH_CHANGE_DEADLINE` → L2 / PROCESS
- `MESEM_LATE_TRANSFER_NO_YEAR_END_GRADE` → L3 / BLOCK_GRADE
- `MESEM_11_12_TO_GRADE_10` → L2 / PROCESS
- `OPEN_ED_TO_MESEM_CREDIT_EXEMPTION` → L2 / PROCESS

## Uygulama modeli

- Kurallar `school_type_scope=MESEM` ile sınırlandırılmalı.
- İşletme sözleşmesi gerektiren nakillerde sözleşme durumu ayrı doğrulanmalı.
- Genel nakil takvimi ile MESEM'e özgü zamandan bağımsız nakil hükmü aynı kurala birleştirilmemeli.
- Yeni/yenilenen kurallar staging → diff → Super Admin onayı → yalnız gelecek/pending workflow zinciriyle yayımlanmalı.
- Tamamlanmış nakil, sınıf/alan/dal geçmişi ve legal snapshot geriye dönük değiştirilmemeli.

## ARTICLE_VERIFIED sayacı

Bu belge resmî hükümleri atomik kurallara ayırır; ancak 2.229 master içindeki kesin `workflow_id` eşleşmeleri bu turda runtime/file-library masterı olmadan doğrudan teyit edilemediği için **ARTICLE_VERIFIED toplamı artırılmamıştır**.
