# V52 — Legal source correction staging

Tarih: 2026-08-29
Migration: 0

## Amaç
Daha önce ARTICLE_VERIFIED havuzuna girmiş ancak source/provision mappingi generic veya yanlış kalmış RPD kayıtlarını sayaç değiştirmeden doğru hükme taşımak.

### HB-2029
- Existing status: ARTICLE_VERIFIED
- Existing bad mapping found: OÖİKY 28.07.2026 change / Md9 generic.
- Correct current parent: MEB RPD Hizmetleri Yönetmeliği Md16/8.
- Correct action: gündem RPD servisince hazırlanır ve müdüre sunulur; gündem + toplantı tarihi müdür tarafından bir hafta önce yazılı duyurulur.
- Staging action: SOURCE_REPLACE_ONLY.
- Counter delta: 0.

### HB-2036
- Existing status: ARTICLE_VERIFIED in historical batch.
- Existing bad/generic mapping found: OÖİKY 2026 Md9 generic.
- Correct current parent: RPD Yönetmeliği Md21/4-a.
- Action: öğretmen/veli/yönetici ve okul içinde öğrenciyle iletişimde olan kişilere ortak/yeterli rehberlik anlayışı amacıyla müşavirlik.
- Staging action: SOURCE_REPLACE_ONLY.
- Counter delta: 0.

### HB-2037
- Historical ARTICLE_VERIFIED record exists under OÖİKY 2026 Md9 generic source.
- Current exact provision for `tüm çalışmaların kayıtları + doküman arşivi` must be resolved before source replacement.
- Status: ARTICLE_VERIFIED_INTEGRITY_REVIEW.
- No immediate rollback in V52 because current e-Rehberlik/record duties plausibly support part of action; exact whole-row provision audit required.

### HB-2038
- Historical ARTICLE_VERIFIED record under OÖİKY 2026 Md9 generic source is not exact.
- Family/economic/education data tracking requires exact RPD duty plus KVKK purpose/necessity/minimization compatibility.
- Status: ARTICLE_VERIFIED_INTEGRITY_REVIEW_HIGH.
- No new task should expose sensitive family/economic data beyond role-based need-to-know until exact data-field authority is confirmed.

## Publication model
`OLD_MAPPING -> SOURCE_DIFF -> EXACT_CURRENT_PARENT -> SUPERADMIN_REVIEW -> SOURCE_REPLACE -> FUTURE_INSTANCE_REBIND`
Historical completed task snapshots remain immutable; legal source metadata can retain audit trail of correction.

## Counter rule
Source correction of an already counted workflow is not a new ARTICLE_VERIFIED increment. If a previously counted workflow ultimately lacks a current exact whole-row parent, it must be rolled back in a later integrity batch with explicit delta.
