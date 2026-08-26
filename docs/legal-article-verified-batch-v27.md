# ARTICLE_VERIFIED V27 — exact workflow bindings

Date: 2026-08-27
Base verified: 414 / 2229
New exact verifications: 6
Result: 420 / 2229 = 18.84%
Migration: 0

## Official sources
- OÖKY current: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- MEB Eğitim Kurulları ve Zümreleri Yönergesi current: https://mevzuat.meb.gov.tr/dosyalar/2260.pdf

## Newly promoted
1. HB-1671 — `Kayıtlar, öğrencinin e-Okul sistemindeki veya denklik belgesindeki bilgilerine göre yapılmaktadır.`
   - OÖKY Md.21/2
   - current exact rule: registration uses e-Okul or equivalence-document information; address source and no-extra-document rule remain in same paragraph.

2. HB-1672 — `Evli olanların kayıtları yapılmamakta, öğrenci iken evlenenlerin okulla ilişiği kesilmekte ve Açık Öğretime/MESEM’e yönlendirilmektedir.`
   - OÖKY Md.21/4
   - exact legal interpretation stored: married applicants are not registered in formal secondary education; marriage while enrolled triggers open-education transfer; MESEM is the explicit exception. Legacy wording is normalized so it does not imply that formal students are automatically transferred *to MESEM* by this paragraph.

3. HB-1673 — `AÖL/MAÖL/AÖİHL'den örgün öğretime ders kesiminden yeni öğretim yılı başlangıcına kadar...`
   - OÖKY Md.21/5 first limb
   - exact timing and conditions matched.

4. HB-1674 — `e-Okul sisteminde kaydı bulunmayanlar ile bilgileri eksik olanların bilgileri sisteme işlenmektedir.`
   - OÖKY Md.22/7 second sentence
   - exact current match.

5. HB-0053 — `İlçe Sınıf/Alan Zümre toplantılarının yapılması`
   - MEB Eğitim Kurulları ve Zümreleri Yönergesi Md.14
   - formation, meeting periods, agenda/decision workflow and current schedule context matched.

6. HB-0055 — `İl Sınıf/Alan Zümre toplantısının yapılması`
   - MEB Eğitim Kurulları ve Zümreleri Yönergesi Md.15
   - formation, meeting periods, agenda, decision/approval and record workflow matched.

## Duplicate guard
- HB-1675 also matches current OÖKY Md.22/8, but it is already ARTICLE_VERIFIED in `Mimaros_Article_Verified_Batch02_Ilkogretim_2026.csv`; it is **not counted again**.
- Existing zümre ARTICLE_VERIFIED workflows from Batch01 are not recounted.

## Legal snapshot rule
Each promoted workflow stores current source URL + article/paragraph + verification date and uses immutable historical snapshots. Future amendments affect only future/pending instances through legal diff/review.