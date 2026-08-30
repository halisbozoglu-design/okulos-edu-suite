# V74 — Aday Öğretmenlik Geçiş Modeli Integrity

Tarih: 2026-08-30
Migration: 0
Lovable: 0

## Resmî current parent
21.12.2024 tarihli 32759 sayılı Resmî Gazete'de yayımlanan Aday Öğretmenlik ve Öğretmenlik Mesleği Kariyer Basamakları Yönetmeliği.

## Kritik geçiş kapsamı
Md5 yalnız 18.10.2024 tarihinde aday öğretmen olanlar ile 18.10.2024-01.09.2025 arasında aday öğretmen/sözleşmeli öğretmen olarak istihdam edilen geçiş kohortunu Yetiştirme Programına bağlar. Bu nedenle eski aday öğretmen workflow'ları 2026'da ancak bu kohorttan adaylık süreci devam eden kişi varsa uygulanabilir; yeni atamaların tamamına koşulsuz uygulanamaz.

## HB-1633
Master: göreve başlamayı takip eden beş gün içinde, öncelikle alanında danışman öğretmen görevlendirilmesi.
Current Md6/1 aynı alanı esas alır ve bulunmaması hâlinde sıralı fallback kurar. Md8/2-a eğitim kurumu müdürüne ilk beş iş günü içinde danışman öğretmen görevlendirme görevi verir.
Sonuç: ARTICLE_VERIFIED, ancak `TRANSITION_COHORT_2024_10_18_TO_2025_09_01` applicability guard ile.

## HB-1634..HB-1640 legacy performance model
Current 2024 Yönetmelikte eski `bir dönemde 60 iş günü`, `Ek-3 Performans Değerlendirme Formu`, `ilk dönemde 1 + takip eden dönemde 2 değerlendirme`, `üçüncü değerlendirmede maarif müfettişi`, `Ek-3 üç nüsha` ve `60 gün + telafi sonrası birinci performans değerlendirmesi` modeli bulunmaz. Current Md7-9 modeli Yetiştirme Programının tamamlanmasına ve bir yıllık görev süresine dayanır; adaylığın kaldırılması valilikçe yapılır.
Sonuç: legacy wording current exact değildir; master rewrite/retire veya historical snapshot gerekir. Eski handbook/FAQ bu modeli current parent yapamaz.

## HB-1639
Current Md7/4 Yetiştirme Programını tamamlamayı zorunlu tutar; fakat masterdaki `(hazırlayıcı ve temel eğitim)` nesne adları current 2024 Yönetmelikte aynı model olarak yer almaz. `OBJECT_MODEL_CHANGED`; exact promotion yok.

## HB-1641
Öğretmen dışındaki aday personelin temel/hazırlayıcı eğitimi aday öğretmenlik Yönetmeliğinin kapsamı değildir. 657 aday memur eğitim ailesine ayrılmalıdır. `LEGAL_FAMILY_SPLIT_REQUIRED`.

## Guards
- `TRANSITIONAL_COHORT_SCOPE_IS_EXACTNESS_FIELD`
- `LEGACY_PERFORMANCE_FORM_DOES_NOT_SURVIVE_WITHOUT_CURRENT_PROVISION`
- `OLD_FAQ_OR_HANDBOOK_CANNOT_OVERRIDE_CURRENT_RG`
- `CANDIDATE_TEACHER_AND_CANDIDATE_CIVIL_SERVANT_ARE_SEPARATE_LEGAL_FAMILIES`
- historical completed candidate-teacher instances immutable.
