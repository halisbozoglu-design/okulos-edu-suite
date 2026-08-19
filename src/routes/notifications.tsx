import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Download, Send, ShieldAlert, Smartphone } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { disableBrowserPush, enableBrowserPush, getCurrentPushSubscription, getPushCapability, registerPwaServiceWorker } from "@/lib/web-push-client";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Bildirim ve PWA — OkulOS" }] }),
  component: NotificationSettings,
});

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

function NotificationSettings() {
  const [capability, setCapability] = useState(() => getPushCapability());
  const [registered, setRegistered] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void registerPwaServiceWorker();
    void getCurrentPushSubscription().then((sub) => setRegistered(Boolean(sub)));
    const handler = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function enable() {
    setBusy(true); setMessage(null);
    try {
      const result = await enableBrowserPush();
      if (result.ok) { setRegistered(true); setMessage("Bu cihaz için arka plan Web Push bildirimleri etkinleştirildi."); }
      else {
        const labels: Record<string,string> = {
          PUSH_NOT_SUPPORTED: "Bu tarayıcı PWA/Web Push bildirimlerini desteklemiyor.",
          VAPID_PUBLIC_KEY_MISSING: "Supabase Web Push anahtarları henüz yapılandırılmamış.",
          NOTIFICATION_PERMISSION_DENIED: "Tarayıcı bildirim izni verilmedi.",
          SERVICE_WORKER_FAILED: "PWA servis worker başlatılamadı.",
          SUBSCRIPTION_KEYS_MISSING: "Tarayıcı push aboneliği oluşturulamadı.",
          SUBSCRIPTION_SAVE_FAILED: "Push aboneliği Supabase'e kaydedilemedi.",
        };
        setMessage(labels[result.reason] ?? result.reason);
      }
    } catch { setMessage("Bildirim kurulumu sırasında beklenmeyen bir hata oluştu."); }
    setBusy(false); setCapability(getPushCapability());
  }

  async function disable() {
    setBusy(true);
    const result = await disableBrowserPush();
    setBusy(false);
    if (result.ok) { setRegistered(false); setMessage("Bu cihazın Web Push aboneliği kaldırıldı."); }
    else setMessage("Push aboneliği kapatılamadı.");
    setCapability(getPushCapability());
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setMessage("OkulOS ana ekrana uygulama olarak eklendi.");
    setInstallPrompt(null); setCapability(getPushCapability());
  }

  async function testPush() {
    setBusy(true); setMessage(null);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setBusy(false); return setMessage("Önce giriş yapmalısınız."); }
    const { data, error } = await supabase.functions.invoke("web-push-dispatcher", {
      body: {
        userId: auth.user.id,
        title: "OkulOS · Test Bildirimi",
        message: "PWA arka plan bildiriminiz çalışıyor. Uygulama kapalıyken de bu cihaz bildirim alabilir.",
        url: "/notifications",
        tag: "okulos-test",
      },
    });
    setBusy(false);
    if (error || !data?.ok) return setMessage("Test bildirimi gönderilemedi. Supabase migration/function ve VAPID secretlarını kontrol edin.");
    setMessage(Number(data.sent ?? 0) > 0 ? `Test bildirimi ${data.sent} cihaz aboneliğine gönderildi.` : "Aktif push aboneliği bulunamadı.");
  }

  return <AppShell title="Bildirim ve PWA" subtitle="Supabase · Web Push · Service Worker · Telegram" action={<BellRing className="size-5" />}>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">PWA / Push desteği</p><p className="mt-1 font-semibold">{capability.supported?"Destekleniyor":"Desteklenmiyor"}</p></div>
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Bildirim izni</p><p className="mt-1 font-semibold">{capability.permission === "granted" ? "Verildi" : capability.permission === "denied" ? "Engellendi" : "Bekliyor"}</p></div>
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Çalışma modu</p><p className="mt-1 font-semibold">{capability.standalone?"Uygulama":"Tarayıcı"}</p></div>
    </div>

    <div className="mt-4 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3"><Smartphone className="mt-0.5 size-5 text-primary" /><div><b>OkulOS'u ana ekrana ekleyin</b><p className="mt-1 text-xs text-muted-foreground">Ana ekran ikonundan açıldığında adres çubuğu olmadan bağımsız uygulama gibi çalışır.</p></div></div>
      {installPrompt ? <Button className="mt-4 gap-2" onClick={()=>void installApp()}><Download className="size-4"/>Ana Ekrana Uygulama Olarak Ekle</Button> : <p className="mt-3 text-xs text-muted-foreground">iPhone/iPad: Safari → Paylaş → Ana Ekrana Ekle. Android/Chrome destekliyorsa tarayıcı ayrıca yükleme seçeneği gösterir.</p>}
    </div>

    <div className="mt-4 rounded-xl border bg-card p-4">
      {registered?<div className="flex items-start gap-3 text-sm"><CheckCircle2 className="mt-0.5 size-5 text-emerald-600"/><div><b>Arka plan bildirimleri açık.</b><p className="mt-1 text-xs text-muted-foreground">OkulOS açık olmasa da Service Worker sistem bildirimi gösterebilir. Bildirim sesi/titreşimi cihazın bildirim ve odak ayarlarına bağlıdır.</p></div></div>:<div className="flex items-start gap-3 text-sm"><ShieldAlert className="mt-0.5 size-5 text-amber-600"/><div><b>Bu cihaz henüz Web Push'a kayıtlı değil.</b><p className="mt-1 text-xs text-muted-foreground">Etkinleştirdiğinizde cihazın standart Push API aboneliği Supabase hesabınıza kaydedilir. Firebase kullanılmaz.</p></div></div>}
      <div className="mt-4 flex flex-wrap gap-2">
        {registered?<><Button variant="outline" onClick={()=>void disable()} disabled={busy}>Bu Cihazda Kapat</Button><Button className="gap-2" onClick={()=>void testPush()} disabled={busy}><Send className="size-4"/>Test Bildirimi Gönder</Button></>:<Button onClick={()=>void enable()} disabled={busy||!capability.supported}>Bildirimleri Etkinleştir</Button>}
      </div>
      {message?<p className="mt-3 rounded-lg bg-muted p-3 text-xs">{message}</p>:null}
    </div>

    <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">Mimari: Supabase Realtime uygulama açıkken ekran içi anlık uyarıyı sağlar; standart Web Push + Service Worker uygulama kapalı/arka plandayken sistem bildirimini sağlar; Telegram ikinci bildirim kanalı olarak devam eder.</div>
  </AppShell>;
}
