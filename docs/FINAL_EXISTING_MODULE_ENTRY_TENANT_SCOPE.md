# OkulOS — Mevcut Modül Giriş/Tenant Kapsamı (Kapalı Kapsam)

Bu aşamada yeni fonksiyonel modül geliştirilmeyecektir.

Tamamlanan ve korunacak çekirdek kurallar:

- Kamuya açık rotalar yalnız giriş, okul kaydı ve auth callback rotalarıdır.
- Diğer tüm rotalar kimlik doğrulaması gerektirir ve erişim kontrolü hata verirse fail-closed davranır.
- Normal kullanıcı aktif bir institution_memberships kaydı olmadan tenant modüllerine giremez.
- Tenant onayı pending/rejected olduğunda yalnız Bildirimler erişilebilir kalır.
- Süper Admin sistem bakımını ve mevcut modül/alt modül feature durumlarını merkezi olarak yönetir.
- Ana feature kapalı/bakımda ise alt route'ları da kapalı kabul edilir.
- Mevcut tüm aktif route'lar system_feature_catalog/tenant erişim haritasında sınıflandırılmış olmalıdır.
- Yeni route eklenirse CI sınıflandırılmamış aktif route'u reddeder.
- Yeni modül adı gerekirse yalnız Süper Admin alanının altında pasif/default kapalı kayıt olarak tanımlanır; geliştirilmez.
- Ders Programı geliştirmesi ayrı çalışma akışında devam eder; bu dosya onun domain mantığını değiştirmez.

Bu dosya mevcut modül giriş + tenant omurgasının kapanış kriteridir; "sonra olgunlaştırılacak" açık uçlu iş bırakmamak için eklenmiştir.
