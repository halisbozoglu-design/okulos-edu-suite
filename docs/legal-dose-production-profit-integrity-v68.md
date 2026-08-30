# V68 — DÖSE üretim / ücret / prim integrity

Kaynak politikası: yalnız resmî MEB / Resmî Gazete. Migration 0. Lovable 0.

## HB-1594
Master %5 kâr + %25 faaliyet gideri diyor. Güncel MEB Teftiş Kurulu 09.10.2025 DÖSE rehberi Yönetmelik Md8/2'yi aynen anıyor; ayrıca 20.12.2018 tarih ve 24650793 sayılı Bakan Oluru nedeniyle faaliyet giderinin %11 uygulandığını kaydediyor. Status: LEGACY_PARAMETER_MISMATCH + MASTER_REWRITE_REQUIRED. Durable publish önerisi: `%5 kâr + yürürlükteki faaliyet gideri oranı`; current parameter %11, legal_snapshot ile tutulmalı.

## HB-1595
Master iki eylemi birleştiriyor: (a) personele ayrılan işçiliğin en az %30'unun öğrenci hakkı olarak ayrılması; (b) öğrenci ücretinin asgari ücretin 1/3'ünden az olmaması. Güncel MEB TKB rehberi ilk eylemi Yönetmelik Md8/3 ile teyit ediyor. Aynı rehber öğrenci/kursiyer parça başı ücretinde üst sınırı yaşına uygun asgari ücretin bir aylık tutarı olarak Md8/6 + 8/8-c ile düzenliyor; masterdaki `asgari ücretin 1/3'ünden az olmama` ifadesi aynı hükmün exact karşılığı değil. Status: COMPOUND + PARTIAL_CURRENT_EXACT + SECOND_CLAUSE_PARENT_RECHECK; whole-row ARTICLE_VERIFIED yok.

## HB-1596
Master eğitim-öğretim hizmetleri sınıfında aylık parça başı ücretin iki aylık asgari ücreti geçmemesini ve diğer personel için yasal sınıra uyulmasını söylüyor. Güncel TKB DÖSE rehberi Yönetmelik Md8/5 altında sınıfları exact ayırıyor: eğitim-öğretim = 2 aylık; teknik hizmetler = 1,5 aylık; diğer hizmetler = 1 aylık. Sayman için 07.01.2025 / 123536939 resmî DHGM yazısı 1 aylık sınırı ayrıca teyit ediyor. Master `diğer personel için yasal sınır` diyerek atomları kaybediyor. Status: CURRENT_PARENT_CONFIRMED + ATOMIC_ROLE_LIMIT_SPLIT_REQUIRED; whole-row promotion withheld.

## HB-1597
Master: mali yıl sonu bilançosundan görülen kârın en çok üçte biri, bilanço tarihini izleyen iki ay içinde üretimi teşvik primi olarak dağıtılır. Güncel TKB 09.10.2025 rehber kriter 17 bunu Yönetmelik Md4 ile exact doğruluyor; ayrıca kişi başı yıllık üst sınır ve esas alınacak asgari ücret yılı gibi ek şartlar var. Ancak ARTICLE_VERIFIED gate altında rehber L2 destek; current regulation provision'ın resmî primary metni ayrıca kilitlenmeden sayaç artırılmadı. Status: L2_CURRENT_EXACT + PRIMARY_PROVISION_LOCK_PENDING.

## HB-1598–HB-1602
HB-1598 aylık hesap kapama/mizan; HB-1599 yıl sonu kesin mizan-bilanço ve eski `Maliye Bakanlığına gönderme`; HB-1600 kârın personele dağıtımı; HB-1601 eski `Sosyal Hizmetler Çocuk Esirgeme payı %1`; HB-1602 Sayıştay'a idare hesabı dosyası. Bunlar current accounting/reporting recipient ve kurum adı açısından ayrı ayrı yeniden doğrulanmalı. Eski kurum adı/recipient metni sessizce güncellenmez.

Yeni guards:
- CURRENT_GUIDE_CAN_CONFIRM_OPERATION_BUT_NOT_REPLACE_PRIMARY_PROVISION.
- COMPOUND_PERCENTAGE_RULES_SPLIT_BEFORE_COUNT.
- LEGACY_INSTITUTION_NAME_OR_RECIPIENT_REQUIRES_CURRENT_RECIPIENT_RECHECK.
