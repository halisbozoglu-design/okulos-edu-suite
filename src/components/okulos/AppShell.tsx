import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bell, CalendarClock, Check, Copy, LayoutGrid, Send, Settings, Table2, UserRound, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/lib/permissions";
import { isProfileIncomplete, maskNationalId } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const primaryNav = [
  { to: "/dashboard", label: "Panel", icon: LayoutGrid, permissions: [] as string[] },
  { to: "/substitutes", label: "Vekalet", icon: Users, permissions: ["substitutes.view", "substitutes.manage"] },
  { to: "/payroll", label: "Ek Ders", icon: Table2, permissions: ["payroll.view", "payroll.calculate", "payroll.edit", "payroll.approve", "payroll.publish"] },
  { to: "/classes", label: "Sınıflar", icon: CalendarClock, permissions: ["classes.manage"] },
] as const;
const managerNavItem = { to: "/management", label: "Yönetim", icon: Settings } as const;
const teacherNavItem = { to: "/notifications", label: "Bildirim", icon: Bell } as const;
const managementCodes = [
  "management.access", "permissions.manage", "settings.manage",
  "schedule.view", "schedule.edit", "schedule.rules", "schedule.generate", "schedule.apply", "schedule.publish", "schedule.restore",
  "classrooms.manage", "curriculum.manage", "duty.view", "duty.manage", "duty.generate", "duty.lock",
  "payroll.view", "payroll.calculate", "payroll.edit", "payroll.approve", "payroll.publish",
  "substitutes.view", "substitutes.manage", "classes.manage", "personnel.view", "personnel.manage",
  "norm.view", "norm.manage", "quran.manage", "notifications.manage",
] as const;

const TELEGRAM_BOT_USERNAME = "okulos_bildirim_botu";

type Profile = {
  user_id: string;
  tckn: string | null;
  email: string | null;
  full_name: string | null;
  role: "admin" | "manager" | "teacher";
  blood_type: string | null;
  phone: string | null;
  emergency_contact: string | null;
};

type RealtimeNotification = {
  id: string;
  user_id: string;
  type: "crisis" | "substitute" | "schedule" | "system";
  priority: "normal" | "high" | "critical";
  title: string;
  message: string;
  action_label: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
};

function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);
    gain.connect(context.destination);

    [880, 1174].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      const start = context.currentTime + index * 0.14;
      oscillator.start(start);
      oscillator.stop(start + 0.22);
    });

    window.setTimeout(() => void context.close(), 900);
  } catch {
    // Browsers can block audio until the user has interacted with the page.
  }
}

export function AppShell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { codes: permissionCodes, loading: permissionsLoading } = usePermissions();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramLinking, setTelegramLinking] = useState(false);
  const [telegramCode, setTelegramCode] = useState<string | null>(null);
  const [telegramCopied, setTelegramCopied] = useState(false);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [liveAlert, setLiveAlert] = useState<RealtimeNotification | null>(null);
  const liveAlertTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !active) return;

      const userId = userData.user.id;
      const [{ data: profileData }, { data: notificationData }, { data: telegramData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id,tckn,email,full_name,role,blood_type,phone,emergency_contact")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("notifications")
          .select("id,user_id,type,priority,title,message,action_label,action_url,read_at,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("telegram_integrations")
          .select("enabled")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (!active) return;

      if (profileData) {
        const next = profileData as Profile;
        setProfile(next);
        setBloodType(next.blood_type ?? "");
        setPhone(next.phone ?? "");
        setEmergencyContact(next.emergency_contact ?? "");
      }

      setTelegramLinked(Boolean(telegramData?.enabled));
      setNotifications((notificationData ?? []) as RealtimeNotification[]);

      channel = supabase
        .channel(`user-notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload: { new: RealtimeNotification }) => {
            const incoming = payload.new as RealtimeNotification;
            setNotifications((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, 20));
            setLiveAlert(incoming);
            playAlertChime();
            if (liveAlertTimer.current) window.clearTimeout(liveAlertTimer.current);
            liveAlertTimer.current = window.setTimeout(() => setLiveAlert(null), 12000);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload: { new: RealtimeNotification }) => {
            const updated = payload.new as RealtimeNotification;
            setNotifications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
      if (liveAlertTimer.current) window.clearTimeout(liveAlertTimer.current);
    };
  }, []);

  const incomplete = isProfileIncomplete(profile);
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);
  const nav = useMemo(() => {
    const visiblePrimary = primaryNav.filter((item) => item.permissions.length === 0 || item.permissions.some((code) => permissionCodes.has(code)));
    const hasManagementTask = managementCodes.some((code) => permissionCodes.has(code));
    if (permissionsLoading) return [primaryNav[0], teacherNavItem];
    return [...visiblePrimary, hasManagementTask ? managerNavItem : teacherNavItem];
  }, [permissionCodes, permissionsLoading]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        blood_type: bloodType || null,
        phone: phone || null,
        emergency_contact: emergencyContact || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.user_id);
    setSaving(false);
    if (error) return;
    setProfile({ ...profile, blood_type: bloodType || null, phone: phone || null, emergency_contact: emergencyContact || null });
    setProfileOpen(false);
  }

  async function generateTelegramCode(openBot = false) {
    setTelegramLinking(true);
    setTelegramCopied(false);
    const { data, error } = await supabase.rpc("create_telegram_link_token");
    setTelegramLinking(false);
    if (error || typeof data !== "string") return;
    setTelegramCode(data);
    if (openBot) {
      window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(data)}`, "_blank", "noopener,noreferrer");
    }
  }

  async function copyTelegramCommand() {
    if (!telegramCode) return;
    await navigator.clipboard.writeText(`/start ${telegramCode}`);
    setTelegramCopied(true);
    window.setTimeout(() => setTelegramCopied(false), 1800);
  }

  async function disableTelegram() {
    setTelegramLinking(true);
    const { error } = await supabase.rpc("disable_telegram_notifications");
    setTelegramLinking(false);
    if (!error) {
      setTelegramLinked(false);
      setTelegramCode(null);
    }
  }

  async function markRead(notification: RealtimeNotification) {
    if (notification.read_at) return;
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, read_at: readAt } : item)));
    await supabase.from("notifications").update({ read_at: readAt }).eq("id", notification.id);
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((item) => !item.read_at).map((item) => item.id);
    if (!unreadIds.length) return;
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => (item.read_at ? item : { ...item, read_at: readAt })));
    await supabase.from("notifications").update({ read_at: readAt }).in("id", unreadIds);
  }

  async function openNotificationAction(notification: RealtimeNotification) {
    await markRead(notification);
    setNotificationOpen(false);
    setLiveAlert(null);
    if (notification.action_url) void navigate({ to: notification.action_url as never });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight">{title}</p>
            {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="relative flex shrink-0 items-center gap-2">
            {action}
            <button
              type="button"
              aria-label="Profil bilgilerini düzenle"
              onClick={() => setProfileOpen(true)}
              className="relative grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            >
              <UserRound className="size-5" />
              {incomplete ? (
                <span className="absolute -right-1 -top-1 grid size-5 animate-pulse place-items-center rounded-full bg-red-600 text-[11px] font-bold leading-none text-white ring-2 ring-card">!</span>
              ) : null}
            </button>
            <button
              type="button"
              aria-label={`Bildirimler${unreadCount ? `, ${unreadCount} okunmamış` : ""}`}
              onClick={() => setNotificationOpen((open) => !open)}
              className="relative grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-card">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>

            {notificationOpen ? (
              <div className="absolute right-0 top-11 z-50 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Bildirimler</p>
                    <p className="text-xs text-muted-foreground">{unreadCount} okunmamış</p>
                  </div>
                  {unreadCount ? (
                    <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => void markAllRead()}>
                      <Check className="size-3.5" /> Tümünü Oku
                    </Button>
                  ) : null}
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.length ? notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void openNotificationAction(notification)}
                      className={cn(
                        "block w-full border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted/50",
                        !notification.read_at && "bg-indigo-50/70",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", notification.priority === "critical" ? "bg-red-600" : notification.priority === "high" ? "bg-amber-500" : "bg-indigo-600")} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{notification.title}</p>
                          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{notification.message}</p>
                          <p className="mt-1.5 text-[10px] text-muted-foreground">{new Date(notification.created_at).toLocaleString("tr-TR")}</p>
                        </div>
                      </div>
                    </button>
                  )) : (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">Henüz bildiriminiz yok.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {liveAlert ? (
        <div className="fixed inset-x-3 top-20 z-[60] mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-4 shadow-2xl ring-1 ring-red-100">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-red-600 text-white">
              <Bell className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-700">{liveAlert.title}</p>
              <p className="mt-1 text-sm text-foreground">{liveAlert.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {liveAlert.action_url ? (
                  <Button size="sm" onClick={() => void openNotificationAction(liveAlert)}>
                    {liveAlert.action_label ?? "Aç"}
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => { void markRead(liveAlert); setLiveAlert(null); }}>
                  Okundu
                </Button>
              </div>
            </div>
            <button type="button" aria-label="Uyarıyı kapat" onClick={() => setLiveAlert(null)} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-5xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <ul className="mx-auto grid max-w-5xl" style={{ gridTemplateColumns: `repeat(${Math.max(nav.length, 1)}, minmax(0, 1fr))` }}>
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link to={item.to as never} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil Bilgileri</DialogTitle>
            <DialogDescription>Eksik temel bilgilerinizi hızlıca tamamlayın.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">T.C. Kimlik No</p>
              <p className="font-medium tabular-nums">{maskNationalId(profile?.tckn, profile?.role)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood-type">Kan Grubu</Label>
              <select
                id="blood-type"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Seçiniz</option>
                {["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-"].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Telefon</Label>
              <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-contact">Acil Durum İletişim</Label>
              <Input id="emergency-contact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700">
                  <Send className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Telegram Bildirimleri</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Telegram'da @{TELEGRAM_BOT_USERNAME} botuna <strong>/start &lt;kod&gt;</strong> göndererek bildirimleri açabilirsiniz.
                  </p>
                </div>
              </div>

              {!telegramLinked ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full gap-2"
                    disabled={telegramLinking}
                    onClick={() => void generateTelegramCode(false)}
                  >
                    <Send className="size-4" />
                    {telegramLinking ? "Kod Oluşturuluyor..." : telegramCode ? "Yeni Bağlantı Kodu Oluştur" : "Bağlantı Kodu Oluştur"}
                  </Button>

                  {telegramCode ? (
                    <div className="mt-3 rounded-lg border border-sky-200 bg-white p-3">
                      <p className="text-xs font-medium text-muted-foreground">Bağlantı kodunuz</p>
                      <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">{telegramCode}</p>
                      <div className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground">
                        /start {telegramCode}
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">Bu kod kısa süreli ve tek kullanımlıktır.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void copyTelegramCommand()}>
                          <Copy className="size-3.5" /> {telegramCopied ? "Kopyalandı" : "Komutu Kopyala"}
                        </Button>
                        <Button type="button" size="sm" className="gap-2" onClick={() => window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(telegramCode)}`, "_blank", "noopener,noreferrer")}>
                          <Send className="size-3.5" /> Telegram'ı Aç
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full gap-2"
                  disabled={telegramLinking}
                  onClick={() => void disableTelegram()}
                >
                  <Send className="size-4" />
                  {telegramLinking ? "İşleniyor..." : "Telegram Bildirimlerini Kapat"}
                </Button>
              )}
            </div>

            <Button className="w-full" onClick={saveProfile} disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
