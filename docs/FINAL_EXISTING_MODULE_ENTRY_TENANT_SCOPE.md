# OkulOS — Mevcut Modül Giriş/Tenant Kapsamı

**Durum: TAMAMLANDI.** Bu kapsam sonradan “olgunlaştırılacak” açık iş olarak bırakılmaz.

- Yeni fonksiyonel modül geliştirilmeyecek; mevcut modüller tamamlanacak.
- Kamuya açık rotalar yalnız giriş, okul kaydı ve auth callback'tir.
- Diğer tüm rotalar giriş gerektirir; erişim kontrolü hata verirse fail-closed davranır.
- Normal kullanıcı aktif tenant üyeliği olmadan modüllere giremez.
- Pending/rejected tenant için Bildirimler erişilebilir kalır.
- Süper Admin sistem ve mevcut modül/alt modül aç-kapat/bakım durumunu yönetir.
- Mevcut route'ların feature/tenant sınıflandırması CI tarafından korunur.
- Yeni bir modül adı ileride gerekirse yalnız Süper Admin altında pasif/default kapalı tanımlanır; tenantlara açılmaz.
- Ders Programı domain çalışması ayrı çalışma akışında devam eder.
