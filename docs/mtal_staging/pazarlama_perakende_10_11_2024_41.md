# MTAL Staging — Pazarlama ve Perakende 10–11

Status: SOURCE_VERIFIED / PRODUCTION_PENDING
Decision: 2024-41
Decision date: 2024-06-07
Program year: 2024
Field: Pazarlama ve Perakende
Branches: Satış Danışmanlığı; Sigortacılık

## Expected production delta
- Grade 10: 6 profiles
- Grade 11: 6 profiles
- Total: 12 profiles
- Expected fixed course rows: 160

## Grade 10 common courses — 28 hours
- Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik: 2
- Biyoloji: 2
- Coğrafya: 2
- Din Kültürü ve Ahlak Bilgisi: 2
- Felsefe: 2
- Fizik: 2
- Kimya: 2
- Matematik: 5
- Rehberlik ve Yönlendirme: 1
- Tarih: 2
- Türk Dili ve Edebiyatı: 4
- Yabancı Dil: 2

### Satış Danışmanlığı — Grade 10 vocational 13
- Satış Teknikleri: 5
- Paket Programlar: 3
- Tedarik Zinciri Yönetimi: 3
- Mesleki Yabancı Dil: 2

### Sigortacılık — Grade 10 vocational 13
- Temel Sigortacılık: 5
- Risk Analizi: 3
- Ofis Uygulamaları: 3
- Mesleki Yabancı Dil: 2

Grade 10 variants for each branch:
- AMP / STANDARD: required 41, elective 4, target 45
- ATP / STANDARD: required 41, elective 4, target 45
- AMP / ENTERPRISE_FROM_11: required 41, elective 4, target 45

## Grade 11 common courses — 16 hours
- Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik: 2
- Din Kültürü ve Ahlak Bilgisi: 2
- Felsefe: 2
- Rehberlik ve Yönlendirme: 1
- Sağlık Bilgisi ve Trafik Kültürü: 1
- Tarih: 2
- Türk Dili ve Edebiyatı: 4
- Yabancı Dil: 2

### Satış Danışmanlığı — Grade 11
AMP STANDARD vocational 17:
- Satış Teknikleri: 7
- Etkili İletişim: 4
- Pazarlama: 6

ATP STANDARD / ENTERPRISE school core 9:
- Satış Teknikleri: 5
- Etkili İletişim: 4

AMP ENTERPRISE_FROM_11 additionally:
- İşletmelerde Mesleki Eğitim: 16

### Sigortacılık — Grade 11
AMP STANDARD vocational 17:
- Temel Sigortacılık: 7
- Sigortacılık Teknikleri: 6
- Sigortacılıkta Hasar: 4

ATP STANDARD / ENTERPRISE school core 9:
- Temel Sigortacılık: 5
- Sigortacılık Teknikleri: 4

AMP ENTERPRISE_FROM_11 additionally:
- İşletmelerde Mesleki Eğitim: 16

Grade 11 profile arithmetic for each branch:
- AMP / STANDARD: required 33, elective 12, target 45
- ATP / STANDARD: required 25, elective 20, target 45
- AMP / ENTERPRISE_FROM_11: required 41, elective 4, target 45

## Production verification gate
Do not mark APPLIED until all are true:
1. 12 active profiles exist for this field/grades 10–11.
2. 160 active fixed course rows exist for this batch.
3. Source PDF/decision provenance is present on every profile.
4. `audit_mtal_curriculum_v1()` returns no findings for this field.
5. Global MTAL profile/course-row totals are re-counted after application.

## Current blocker
Production Supabase connector returned PostgreSQL 28P01 password authentication failure during this run. No production write was claimed or inferred. Retry connector before application.
