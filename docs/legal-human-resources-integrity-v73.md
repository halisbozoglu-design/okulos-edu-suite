# V73 — İnsan Kaynakları integrity

Kaynak politikası: yalnız resmî MEB / Resmî Gazete. Migration 0. Lovable 0.

## Master sınırı
HB-1623..HB-1632 İnsan Kaynakları Yönetimi bloğudur; HB-1633 ile Aday Öğretmenlik başlar. Stratejik plan kaynağı bu bloğa miras bırakılmaz.

## HB-1623
Master: `Norm kadroya uygun sayıda öğretmen bulunmaktadır.` Güncel MEB Personel mevzuat envanteri 18.06.2014/29034 Norm Kadro Yönetmeliğini hâlen current olarak listeliyor. 2026 TKB lise rehberi öğretmenlerin norm kadroya göre yeterlik durumunu ayrıca denetim kriteri yapıyor ve Norm Kadro Yönetmeliği Md18,20,21/2,22'yi işaret ediyor. Ancak master bir `durum/sonuç` ifadesi; Yönetmelik normun hesaplanmasını/belirlenmesini düzenler, boş normların mutlaka doldurulacağını garanti eden aynı actor-action hükmü değildir. Status: `AUDIT_STATE_NOT_SAME_AS_BINDING_FILL_DUTY + WITHHELD`.

## HB-1624
Master: `Her çalışan için personel dosyası tutulmaktadır.` Güncel 2026 MEB TKB rehberleri personel bilgilerinin güncel tutulmasını ve personel dosyalarının düzenlenmesini 657 Md109'a bağlamaya devam ediyor. Fakat Md109 memur özlük dosyası zinciridir; master `her çalışan` diyerek işçi/sözleşmeli/diğer statüleri de kapsıyor. Status: `EMPLOYMENT_STATUS_SCOPE_SPLIT_REQUIRED`; broad whole-row promotion yok.

## HB-1625
Master generic disiplin/mevzuata aykırı davranışta gerekli işlemler. Güncel MEB Personel sayfası 02.01.2022 Disiplin Amirleri Yönetmeliğini current listeliyor. Ancak fiil, statü, disiplin amiri, soruşturma/ön inceleme ve yaptırım hukuku tek generic cümlede birleşiyor. Status: `DISCIPLINE_LEGAL_FAMILY_TOO_BROAD + ATOMIC_PROCESS_SPLIT_REQUIRED`.

## HB-1626
Master başarı gösteren personelin ödüllendirilmesi için çalışmalar. Güncel MEB Personel mevzuat sayfası `MEB Personeline Başarı, Üstün Başarı Belgesi ve Ödül Verilmesine Dair Yönerge`yi current listeliyor. Master ise belge/ödül türü, teklif makamı, şart ve yetkili makamı ayırmıyor. Status: `REWARD_TYPE_AND_AUTHORITY_SPLIT_REQUIRED`.

## HB-1627
Master: sonu 0 ve 5 ile biten yıllarda Ocak/Şubat mal bildirimi. 3628 + Mal Bildiriminde Bulunulması Hakkında Yönetmelik ailesi current olmakla birlikte bu tur official current consolidated primary metin ve exact renewal provision doğrudan kilitlenemedi. L2/official references yeterli görülmedi. Status: `PRIMARY_RENEWAL_PROVISION_LOCK_PENDING`.

## HB-1628
Master müdürün iş bölümü/görev dağılımı yapması ve tebliği. Okul türü yönetmeliklerinde ve kurum türlerinde actor/tebliğ ayrıntıları farklılaşabildiğinden broad ALL satır tek parent ile doğrulanmadı. Status: `SCHOOL_TYPE_ROLE_ASSIGNMENT_SPLIT_REQUIRED`.

## HB-1629
İzinli/raporlu personelin yerine bakacak kişinin görev dağılımında belirtilmesi. Genel idari süreklilik mantığı mevcut olsa da current bütün okul türlerini kapsayan exact named provision kilitlenmedi. Status: `WITHHELD_CURRENT_EXACT_PARENT_NOT_LOCKED`.

## HB-1630
Hizmet içi eğitim duyuruları. Current MEB hizmet içi eğitim sistemi/operasyonu canlı; fakat her okul müdürüne exact `duyuru yapma` actor-action parentı kilitlenmeden sayılmadı. `L2_CURRENT_OPERATIONAL`.

## HB-1631
Kurumdan ayrılan personelin devir teslimi; personel statüsü + görev/taşınır/mühür/evrak kapsamları farklı hukuk aileleri. `COMPOUND_HANDOVER_OBJECT_SPLIT_REQUIRED`.

## HB-1632
İzin/rapor işlemlerinin takibi current MEB HR operasyonunda canlı; 2026 TKB rehberleri devamsızlık/izin/rapor izlenmesini kriter yapıyor. Ancak memur/öğretmen/sözleşmeli/işçi izin kaynakları ayrışır. `EMPLOYMENT_STATUS_LEAVE_SPLIT_REQUIRED`; L2 tek başına sayaç artırmaz.

## Yeni guards
- `AUDIT_STATE != BINDING_FILL_DUTY`.
- `EMPLOYEE != SINGLE_LEGAL_STATUS`.
- `PERSONNEL_FILE_SCOPE_MUST_MATCH_EMPLOYMENT_STATUS`.
- `DISCIPLINE_ACTION_REQUIRES_STATUS_ACTOR_PROCESS_SANCTION_EXACTNESS`.
- `REWARD_REQUIRES_TYPE_PROPOSER_AUTHORITY_CONDITION_EXACTNESS`.
- `HANDOVER_OBJECTS_MUST_NOT_BE_MERGED_ACROSS_LEGAL_FAMILIES`.
