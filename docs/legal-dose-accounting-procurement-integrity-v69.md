# V69 — DÖSE muhasebe / raporlama / satın alma integrity

Kaynak politikası: yalnız resmî MEB / Resmî Gazete. Migration 0. Lovable 0.

## HB-1597
Master, mali yıl sonu bilançosundan görülen kârın en çok üçte birinin bilanço tarihini izleyen iki ay içinde üretimi teşvik primi olarak dağıtılmasını söylüyor. Güncel MEB Teftiş Kurulu DÖSE rehberi bu eylemi current operational criterion olarak sürdürüyor; ancak strict ARTICLE_VERIFIED gate altında resmî primary hüküm kilidi tamamlanmadan L2 rehber tek başına sayaç artıramaz. Status: L2_CURRENT_OPERATIONAL_EXACT + PRIMARY_PROVISION_LOCK_PENDING.

## HB-1598
Master aylık hesapların kapatılması ve aylık mizan çıkarılmasını tek kontrol cümlesinde taşıyor. Bu işlem muhasebe sisteminin dönem kapama/mizan zinciridir; durable exact doğrulamada hesap kapama ile mizan üretiminin aynı current binding provision içinde olup olmadığı ayrıca kilitlenmelidir. Status: ACCOUNTING_ATOMICITY_REVIEW + PRIMARY_PROVISION_PENDING.

## HB-1599
Master yıl sonu kesin mizan + bilanço tablosu + `Maliye Bakanlığına gönderme` eylemlerini birleştiriyor. `Maliye Bakanlığı` güncel kurum adı değildir; current recipient ve elektronik muhasebe/raporlama kanalı exact bulunmadan eski recipient sessizce Hazine ve Maliye Bakanlığına çevrilemez. Status: LEGACY_RECIPIENT_NAME + COMPOUND_REPORTING_CHAIN + MASTER_REWRITE_REQUIRED.

## HB-1600
Master `döner sermaye işletmesinin karının personele göre dağıtılması` şeklinde geniş bir ifade kullanıyor. HB-1597 üretimi teşvik primi ile ilişkili olsa da kârın personele dağıtımı; hak sahibi, oran, üst sınır, süre ve onay koşullarını kaybediyor. Generic profit distribution cümlesi current exact prim hükmünün yerine geçmez. Status: SEMANTIC_BROADENING + EXACT_BENEFICIARY_AND_LIMITS_REQUIRED.

## HB-1601
Master eski `Sosyal Hizmetler Çocuk Esirgeme payı %1` terminolojisini taşıyor. Kurum adı ve transfer mekanizması tarihsel olabilir; current statutory recipient/rate/provision kilitlenmeden bu satır yürürlükte kabul edilmez. Status: LEGACY_INSTITUTION_NAME_AND_RATE_RECHECK + WITHHELD.

## HB-1602
Master idare hesapları dosyası + bilanço açıklaması + ek tutanaklar + Sayıştay Başkanlığına gönderme zinciridir. Current public-accounting/Sayıştay submission architecture açısından recipient, dosya nesnesi ve elektronik gönderim biçimi yeniden exact doğrulanmalıdır. Status: CURRENT_RECIPIENT_OBJECT_CHANNEL_RECHECK + WITHHELD.

## HB-1603
Master, döner sermaye işletmesinin mal ve hizmet alım **ve satım** işlerinin tümünü `kamu ihale mevzuatına uygunluk` altında tekleştiriyor. Alım, ihale/satın alma; satış ise farklı satış/bedel/teslim hükümlerine tabi olabilir. `ALIM VE SATIM` connector semantics kaybedilemez. Status: PROCUREMENT_VS_SALES_LEGAL_FAMILY_SPLIT_REQUIRED; whole-row ARTICLE_VERIFIED yok.

## V69 guards
- LEGACY_RECIPIENT_NAME_IS_NOT_AUTO_RENAMED.
- ACCOUNTING_REPORT_OBJECT_AND_SUBMISSION_CHANNEL_ARE_EXACTNESS_FIELDS.
- PROCUREMENT_AND_SALES_MUST_NOT_BE_COLLAPSED_UNDER_ONE_GENERIC_IHALE_PARENT.
- PROFIT_DISTRIBUTION_REQUIRES_BENEFICIARY_RATE_LIMIT_TIMING_EXACTNESS.
- CURRENT_MEB_INSPECTION_GUIDE_REMAINS_L2_UNLESS_PRIMARY_PROVISION_LOCKED.
