# V65 — Taşıma / Sözleşme / Yangın Tüpü Integrity

Kaynak politikası: yalnız resmî MEB / Resmî Gazete / mevzuat.gov.tr.
Migration: 0
Lovable: 0

## HB-1575 — yangın söndürme tüpü
Master: Servis aracında kullanılabilir durumda yangın söndürme tüpü vardır.

Resmî güncel operasyonel kanıtlar:
- MEB DHGM `Okul Müdürünün Kullanacağı Araç Denetim Formu`: servis aracında bakımlı ve son kullanma tarihi geçmemiş yangın söndürme tüpü kontrol edilir; kaynak alanı Teknik Şartname olarak gösterilir.
- MEB DHGM 2026-2027 İlk-Ortaöğretim Taşıma İhaleleri Örnek Sözleşme Tasarısı, özel aykırılık tablosu sıra 22: minibüste 1 adet 2 kg; 26 kişiye kadar otobüste 2 adet 2 kg; 26 kişinin üstünde 2 adet 6 kg yangın söndürme cihazı bulunmaması yaptırıma bağlanır.

Karar: `CURRENT_YEAR_EXACT_OPERATIONAL + YEAR_PARAMETER`.
Durable ARTICLE_VERIFIED yok. Gerekçe: teknik şartname/sözleşme tasarısı yıllık ihale katmanıdır; master durable ulusal görev olarak statik sayılmayacak. Tenant sözleşmesi oluştuğunda year-specific instance/legal snapshot ile bağlanmalı.

## HB-1576
V64 new exact korunur; mevcut current official source mapping değiştirilmedi.

## HB-1577
Current Taşıma Yoluyla Eğitime Erişim Yönetmeliği Md13/1-ğ exact mapping korunur. Batch08 daha önce ARTICLE_VERIFIED olarak saymıştır; ikinci kez sayılmaz.

## HB-1578 — yeni ARTICLE_VERIFIED
Master: Taşıma uygulaması kapsamında yapılan taşıma ihale sözleşmelerinin bir örneği okulda bulunmaktadır.

Current exact official source: Resmî Gazete 01.08.2024 / 32619, MEB Taşıma Yoluyla Eğitime Erişim Yönetmeliği değişikliği:
- Md16/2-ç: harcama yetkilisi tarafından ihale işlemleri sonuçlandırılıp sözleşmeler millî eğitim müdürlüğüne teslim edildikten sonra ihale sözleşmelerinin bir örneği ilgili taşıma merkezi okul/kurum müdürlüklerine gönderilir.
- Md18/1-d: ihale sözleşmelerinin onaylı bir nüshası ilgili taşıma merkezi okul/kurum müdürlüklerine gönderilir.

Actor/action/object/recipient eşleşmesi exact. Master mevcut durable ID. Önceki ARTICLE_VERIFIED setlerinde HB-1578 bulunmadı.
Status: `ARTICLE_VERIFIED`.
Delta: +1.

## 2026-2027 resmî doküman durumu
DHGM Öğrenci Taşıma Hizmetleri Daire Başkanlığı sayfası 30.07.2026 güncel ve şu belgeleri resmen yayımlıyor:
- 2026-2027 İlk-Ortaöğretim Taşıma Teknik Şartname (DOCX; web parser application/vnd.openxmlformats-officedocument.wordprocessingml.document nedeniyle doğrudan metne açamadı),
- 2026-2027 İlk-Ortaöğretim Taşıma İhaleleri Örnek İdari Şartname,
- 2026-2027 İlk-Ortaöğretim Taşıma İhaleleri Örnek Sözleşme Tasarısı (PDF; metin okunabildi),
- okul müdürü araç denetim formu.

PDF screenshot denemeleri araç içi hata verdi; başarı iddiası yok.

## Guard
Annual technical specification / contract template cannot by itself promote a durable master row into universal ARTICLE_VERIFIED. Annual clauses are `YEAR_PARAMETER` or year-specific legal snapshots unless a current regulation/directive supplies the durable parent.
