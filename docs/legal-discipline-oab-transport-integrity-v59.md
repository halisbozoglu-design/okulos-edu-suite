# V59 — Disiplin, OAB ve Taşımalı Eğitim Integrity Reconciliation

Tarih: 2026-08-29
Migration: 0
Lovable: 0

## ARTICLE_VERIFIED gate
`workflow_id + current binding source + exact provision + actor/action/object/recipient/timing/system/applicability match`

## HB-2140 — NEW ARTICLE_VERIFIED
Master: Okul Öğrenci Ödül ve Disiplin Kurulu, ders yılı veya dönem içinde meydana gelen disiplin olaylarının nedenleriyle alınan tedbirleri ve sonuçlarını tespit ederek ders yılı ve dönem sonunda bir rapor hâlinde okul yönetimine bildirir.

Current exact authority: Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği Md189/1-ğ.
- actor: Okul Öğrenci Ödül ve Disiplin Kurulu
- action: disiplin olaylarının nedenleri + alınan tedbirler + sonuçları tespit etmek
- timing: ders yılı ve dönem sonu
- object/output: rapor
- recipient: okul yönetimi
- scope: ortaöğretim

Batch01/Batch02 ARTICLE_VERIFIED listelerinde HB-2140 için önceki count bulunmadı. Status: `ARTICLE_VERIFIED`. Delta +1.

## HB-2111 — source correction, delta 0
Legacy Batch02 parent: OÖİKY 2026 Md9/1-3.
Current exact parent: OÖKY Md157/3.
Master action; öğrencilerden beklenen davranışların derslerde, törenlerde, toplantılarda, rehberlik çalışmalarında, veli görüşme/toplantılarında ve sosyal etkinliklerde kazandırılmaya çalışılması ve kuralların hatırlatılmasıdır. Md157/3 bu eylemi doğrudan düzenler.
Status: `ARTICLE_VERIFIED_SOURCE_CORRECTED`. Delta 0.

## HB-1569 — source correction, delta 0
Legacy Batch02 parent: OÖİKY 2026 Md90/2; bu parent actor/action açısından uygun değildir.
Current exact authority: 11.09.2014 tarihli Taşıma Yoluyla Eğitime Erişim Yönetmeliğinin 01.08.2024 değişiklikleriyle yürürlükteki Md13/1-c.
- actor: taşıma merkezi okul/kurum müdürü
- action: taşıma hizmetinden faydalanan öğrenciler ile merkez okul öğrencilerini birlikte öğrenim görecek biçimde sınıf/şubelere dengeli dağıtmayı sağlamak
Current Md13/2-c aynı görevin taşımadan sorumlu müdür yardımcısı icra düzeyini de düzenler.
Status: `ARTICLE_VERIFIED_SOURCE_CORRECTED`. Delta 0.

## HB-1480 — source correction, delta 0
Master: Yönetim Kurulu karar defteri noter tarafından tasdik edilmiştir.
Legacy Batch02 parent: OÖİKY Md36.
Current exact authority: MEB Okul Aile Birliği Yönetmeliği Md23/2: yönetim kurulu karar defterinin noterce tasdiki zorunludur.
Status: `ARTICLE_VERIFIED_SOURCE_CORRECTED`. Delta 0.

## HB-1482 — source correction / two-provision chain, delta 0
Master: mal ve hizmet alımları gerçekleşmeden önce yönetim kurulunda görüşülür, alınan kararlar karar defterine yazılır ve imzalanır.
Legacy Batch02 parent: OÖİKY Md36.
Current legal chain:
- OAB Yönetmeliği Md18/1: tüm harcamalar birlik yönetim kurulunun kararı ile yapılır; mal ve hizmet alımları kurul üyeleri/komisyon marifetiyle gerçekleştirilir.
- OAB Yönetmeliği Md23/1-b: yönetim kurulu karar defteri tutulur; yönetim kurulu bunun tutulması/muhafazasından sorumludur.
Master action tek ekonomik karar zincirini tarif ettiği için current exact chain korunur. Status: `ARTICLE_VERIFIED_SOURCE_CORRECTED_MULTI_PROVISION_CHAIN`. Delta 0.

## HB-1360 — wrong-source detected, current exact-parent review
Master scope: Pansiyon işlemleri; alınan malzemenin taşınır mal kayıt işlemleri.
Legacy Batch02 parent: OÖİKY Md11 kayıt/nakil hükümleri — actor/action/legal-family mismatch.
Taşınır kayıt görevi güncel taşınır mevzuatı/pansiyon mal yönetimi ile doğrulanmalıdır. Bu V59'da exact provision lock tamamlanmadığı için eski yanlış source artık authoritative kabul edilmez.
Status: `SOURCE_INVALIDATED + CURRENT_PARENT_RESEARCH`; count kararı bir sonraki exact-parent pass'te verilecek.

## OÖKY Md197–203 guard
- Md197: müdürün kurul kararına itirazı ve dosyanın ilçe disiplin kuruluna gönderilmesi.
- Md198: okul disiplin kurulunun kurulamaması/karar verememesi halinde ilk soruşturma dosyasının ilçe kuruluna gönderilmesi.
- Md199: ilçe öğrenci disiplin kurulunun kuruluşu.
- Md200: ilçe disiplin kurulunun görevleri ve 10 iş günü karar süreleri.
- Md201: il öğrenci disiplin kurulunun kuruluşu.
- Md202: il disiplin kurulu görevleri; her dönem sonu il genel disiplin değerlendirmesi dahil.
- Md203: öğrenci üst disiplin kurulunun kuruluşu.
Bu maddeler masterdaki okul-level kayıtlarla otomatik birleştirilmeyecek; actor/institution scope birebir eşleşmeden promotion yok.

## V59 integrity result
- New exact: HB-2140 (+1)
- Source correction retained: HB-2111, HB-1569, HB-1480, HB-1482 (0)
- Current parent research: HB-1360
- Migration 0
- Lovable 0
