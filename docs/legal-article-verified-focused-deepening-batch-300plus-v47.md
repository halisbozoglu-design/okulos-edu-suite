# V47 — Danışmanlık Tedbiri / RAM Derinleştirme

Tarih: 2026-08-28
Migration: 0
Support atoms: 480

## Kaynak düzeltmesi
- 24 Nisan 2026 tarihli Resmî Gazete sayısı **33233**'tür.
- ORGM liste sayfasındaki 33223 ibaresi metadata typo olarak ele alınmıştır; canonical legal snapshot Resmî Gazete günlük sayfası + yayımlanan Tebliğ PDF başlığına göre 33233 tutulacaktır.

## 2026 Danışmanlık Tedbiri Tebliği — yeni parametre çekirdeği
Current authority: 24.04.2026 tarihli, 33233 sayılı Resmî Gazete'de yayımlanan Danışmanlık Tedbiri Kararlarının Uygulama Usul ve Esasları Hakkında Tebliğ.

### Madde 7
- MEB tarafından uygulanacak tedbirlerde eğitim kurumuna devam eden çocuk için görevli rehber öğretmen/psikolojik danışman ana uygulayıcıdır.
- Rehber öğretmen/psikolojik danışman bulunmayan eğitim kurumlarında il/ilçe MEM görevlendirmesi uygulanır.
- Herhangi bir okulla ilişiği olmayan çocuklarda danışmanlık tedbiri uygulaması bağlı RAM tarafından yerine getirilir.
- Dosya dağılımında hâlihazırdaki danışmanlık tedbir kararları gözetilerek dengeli dağılım yapılır.

### Madde 8
- Eğitim almış sosyal çalışma görevlilerine öncelik.
- Aynı çocukta başka tedbir/denetimi izleyen kişi ile danışmanlık hizmetini verecek kişi aynı olamaz.
- Uygulama planı için sosyal inceleme raporundan yararlanılır.
- Çocuk/aile ile 15 günde bir, asgari 8 oturum.
- İhtiyaca göre görüşme sıklığı artırılabilir.
- Tatilde ilk ve son oturum dışındaki oturumlar, üstün yarar gözetilerek çevrim içi yapılabilir.
- Süre sonunda tedbirin devamı/sonlandırılması konusunda rapora görüş yazılır.
- MEB görevlisi kendi okul/kurumunda uygular; ihtiyaç halinde hane ziyareti yapabilir.
- Dosyaların eşit dağıtımı şartıyla bir danışmanın azami 15 dosyaya bakması esastır.

### Madde 9 — süre ve süreç parametreleri
- Kurum: tebliğden sonra en geç 5 iş günü içinde personel görevlendirir.
- Personel: görevin tebliğinden sonra en geç 3 iş günü içinde süreci başlatır.
- Aile: bildirimden sonra en geç 10 gün içinde kuruma başvurur; gelmezse mahkemeye bildirilir.
- İlk görüşmeden sonra uygulama planı en geç 5 iş günü içinde mahkemeye sunulur.
- Çocuk/aile/dosya bilgileri incelenir.
- Çocuk/aile ile tanışma ve bilgilendirme yapılır.
- Gerektiğinde aile, öğretmen, idareci ve diğer kişilerle görüşülerek problem sınırları belirlenir.
- Uygulama planı hazırlanır.
- İzleme kriterleri planda gösterilir.
- Üçer aylık değerlendirme raporu mahkemeye gönderilir.
- Hedefler gerçekleştiyse kaldırma talebi; devam kararı varsa yeni uygulama planı; mahkeme kararıyla sonlandırma.
- Çocuğa karşı suç veya korunma ihtiyacı tespit edilirse yetkili mercilere bildirim.

## Master workflow audit
Canonical masterda saf 'danışmanlık tedbir görüşmeleri' parent'ı yerine aylık ve çoğu zaman compound kayıtlar bulunuyor.

Örnek recurring/split family:
- HB-0278 — başvuran/yönlendirilen öğrenci ve velilerle görüşme + danışmanlık tedbiri görüşmelerinin sürdürülmesi; yıl sonu etiketi.
- HB-0680 — aynı çekirdek; Aralık.
- HB-0943 / HB-0944 — aynı metin ve aynı Mart zamanlaması; duplicate extraction riski.
- HB-1040 — görüşmeler + danışmanlık tedbiri + Şiddet İl Eylem Planı aynı satırda; SPLIT_REQUIRED.
- HB-0515 ve benzeri satırlar danışmanlık çekirdeğine başka toplantı/görev ekleyebiliyor.

Karar: Bu aylık kayıtların hiçbiri whole-row ARTICLE_VERIFIED yapılmadı. Yeni Tebliğ hükümleri ayrı durable legal process template olarak modellenmeli; eski HB satırları LEGACY_CALENDAR_INSTANCE / SPLIT_REQUIRED / DUPLICATE_REVIEW durumunda tutulmalı.

## RAM genel rehberlik ile danışmanlık tedbiri ayrımı
'RAM'e başvuran/yönlendirilen öğrenci ve velilerle görüşme' genel rehberlik/psikolojik danışma hizmetidir; mahkeme kararlı danışmanlık tedbiri ile aynı şey değildir. Legacy satırdaki 've' bağlacı iki ayrı süreç üretir:
1. GENERAL_RPD_CLIENT_INTERVIEW
2. COURT_ORDERED_COUNSELING_MEASURE

Bu ayrım zorunludur; danışmanlık tedbiri ekranında yalnız mahkeme kararı bulunan dosya yer almalıdır.

## Diğer standalone RAM adayları
Masterda saf müşavirlik kayıtları bulundu: HB-0141, HB-0208, HB-0280, HB-0396, HB-0685, HB-0948 ve diğer aylık kopyalar. Bunlar duplicate legal parent olarak sayılmayacak; RAM'in görevlerini düzenleyen güncel source-exact hüküm doğrulanana kadar LEGACY_CALENDAR_INSTANCE olarak tutulacak.

HB-0602: okul rehberlik programı inceleme workflow'u metin olarak RAM işi olmasına rağmen kaynak kapsam etiketi PANSİYONLU OKULLAR; SCOPE_ERROR_CANDIDATE.
HB-0603: okul risk haritası uygulaması; önceki otomatik legal-family eşleştirmesi sosyal etkinliklere kaymış görünüyor; LEGAL_FAMILY_ERROR_CANDIDATE.

## Atom dağılımı
- 2026 Tebliğ source/article/parameter extraction: 140
- RAM counseling family master crosswalk: 120
- duplicate/compound/calendar-instance guards: 80
- general RPD vs court-ordered counseling split: 60
- scope/legal-family error detection: 40
- versioning/impact/publication guards: 40
Toplam: 480

## Sonuç
ARTICLE_VERIFIED: 467 / 2229 (değişmedi)
Atom pool: 6195 -> 6675
Remaining exact: 1762
Migration: 0
