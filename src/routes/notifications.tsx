import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { disableBrowserPush, enableBrowserPush, getPushCapability } from "@/lib/fcm-client";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Bildirim Ayarları — OkulOS" }] }),
  component: NotificationSettings,
});

function NotificationSettings() {
  const [capability, setCapability] = useState(() => getPushCapability());
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("fcm_tokens").select("id").eq("user_id", auth.user.id).eq("platform", "web").limit(1);
      setRegistered(Boolean(data?.length));
    })();
  }, []);

  async function enable() {
    setBusy(true); setMessage(null);
    try {
      const result = await enableBrowserPush();
      if (result.ok) { setRegistered(true); setMessage("Bu cihaz için anlık bildirimler etkinleştirildi."); }
      else {
        const labels: Record<string,string> = {
          PUSH_NOT_SUPPORTED: "Bu tarayıcı web bildirimlerini desteklemiyor.",
          FIREBASE_CLIENT_CONFIG_MISSING: "Firebase istemci yapılandırması henüz girilmemiş. VAPID ve web app bilgileri gerekli.",
          NOTIFICATION_PERMISSION_DENIED: "Tarayıcı bildirim izni verilmedi.",
          FCM_TOKEN_EMPTY: "Firebase cihaz tokenı üretmedi.",
          NOT_AUTHENTICATED: "Önce giriş yapmalısınız.",
          TOKEN_SAVE_FAILED: "Cihaz tokenı veritabanına kaydedilemedi.",
        };
        setMessage(labels[result.reason] ?? result.reason);
      }
    } catch { setMessage("Bildirim kurulumu sırasında beklenmeyen bir hata oluştu."); }
    setBusy(false); setCapability(getPushCapability());
  }

  async function disable() {
    setBusy(true); await disableBrowserPush(); setRegistered(false); setBusy(false); setMessage("Bu cihazın OkulOS push kaydı kaldırıldı."); setCapability(getPushCapability());
  }

  return <AppShell title="Bildirim Ayarları" subtitle="Web push · FCM · Telegram'dan bağımsız cihaz bildirimi" action={<BellRing className="size-5" />}>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Tarayıcı desteği</p><p className="mt-1 font-semibold">{capability.supported?"Destekleniyor":"Desteklenmiyor"}</p></div>
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Firebase yapılandırması</p><p className="mt-1 font-semibold">{capability.configured?"Hazır":"Eksik"}</p></div>
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Bu cihaz</p><p className="mt-1 font-semibold">{registered?"Kayıtlı":"Kayıtlı değil"}</p></div>
    </div>

    <div className="mt-4 rounded-xl border bg-card p-4">
      {registered?<div className="flex items-start gap-3 text-sm"><CheckCircle2 className="mt-0.5 size-5 text-emerald-600"/><div><b>Anlık bildirimler açık.</b><p className="mt-1 text-xs text-muted-foreground">Vekalet ve kritik bildirimler, sunucu FCM gönderebildiğinde bu cihaza ulaşabilir.</p></div></div>:<div className="flex items-start gap-3 text-sm"><ShieldAlert className="mt-0.5 size-5 text-amber-600"/><div><b>Bu cihaz henüz kayıtlı değil.</b><p className="mt-1 text-xs text-muted-foreground">Etkinleştir dediğinizde tarayıcı bildirim izni ister ve Firebase tokenı kullanıcı hesabınıza kaydedilir.</p></div></div>}
      <div className="mt-4 flex gap-2">{registered?<Button variant="outline" onClick={()=>void disable()} disabled={busy}>Bu Cihazda Kapat</Button>:<Button onClick={()=>void enable()} disabled={busy||!capability.supported}>Bildirimleri Etkinleştir</Button>}</div>
      {message?<p className="mt-3 rounded-lg bg-muted p-3 text-xs">{message}</p>:null}
    </div>

    <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">Gerekli Vite değişkenleri: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID ve VITE_FIREBASE_VAPID_KEY. Sunucu gönderimi için ayrıca mevcut FIREBASE_SERVICE_ACCOUNT_JSON kullanılır.</div>
  </AppShell>;
}
