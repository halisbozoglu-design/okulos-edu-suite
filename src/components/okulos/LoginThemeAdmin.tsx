import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Eye, Palette, Power, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoginThemeSurface } from "@/components/okulos/LoginThemeSurface";
import {
  LOGIN_THEME_CATALOG,
  fetchAdminLoginThemeSchedules,
  fromLocalDateTimeInput,
  getLoginTheme,
  parseLoginThemeCommand,
  saveAdminLoginThemeSchedules,
  toLocalDateTimeInput,
  type LoginThemeKey,
  type LoginThemeSchedule,
} from "@/lib/login-theme";

type TenantOption = { institution_code: string; school_name: string };

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultLocalDate(offsetHours = 0) {
  const d = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return toLocalDateTimeInput(d.toISOString());
}

function scheduleStatus(item: LoginThemeSchedule) {
  if (!item.enabled) return { label: "Pasif", className: "border-slate-200 bg-slate-50 text-slate-600" };
  const now = Date.now(), start = Date.parse(item.startsAt), end = Date.parse(item.endsAt);
  if (now < start) return { label: "Planlandı", className: "border-blue-200 bg-blue-50 text-blue-700" };
  if (now > end) return { label: "Süresi Doldu", className: "border-slate-200 bg-slate-50 text-slate-500" };
  return { label: "Aktif", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
}

export function LoginThemeAdmin({ tenants }: { tenants: TenantOption[] }) {
  const [schedules, setSchedules] = useState<LoginThemeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [theme, setTheme] = useState<LoginThemeKey>("aurora");
  const [tenantCode, setTenantCode] = useState<string>("*");
  const [startsAt, setStartsAt] = useState(() => defaultLocalDate(0));
  const [endsAt, setEndsAt] = useState(() => defaultLocalDate(24));
  const [priority, setPriority] = useState(100);
  const [note, setNote] = useState("");
  const [command, setCommand] = useState("");
  const [previewTheme, setPreviewTheme] = useState<LoginThemeKey>("aurora");

  const tenantMap = useMemo(() => Object.fromEntries(tenants.map((x) => [x.institution_code, x.school_name])), [tenants]);
  const ordered = useMemo(() => [...schedules].sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt) || b.priority - a.priority), [schedules]);

  async function load() {
    setLoading(true); setNotice(null);
    try { setSchedules(await fetchAdminLoginThemeSchedules()); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Tema ayarları okunamadı."); }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function persist(next: LoginThemeSchedule[], success: string) {
    setBusy(true); setNotice(null);
    try {
      await saveAdminLoginThemeSchedules(next);
      setSchedules(next);
      setNotice(success);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tema ayarları kaydedilemedi.");
    }
    setBusy(false);
  }

  async function addSchedule() {
    const startIso = fromLocalDateTimeInput(startsAt), endIso = fromLocalDateTimeInput(endsAt);
    if (!startIso || !endIso || Date.parse(startIso) > Date.parse(endIso)) return setNotice("Başlangıç ve bitiş tarihlerini kontrol edin.");
    const next: LoginThemeSchedule = { id: newId(), theme, tenantCode, startsAt: startIso, endsAt: endIso, priority, enabled: true, ...(note.trim() ? { note: note.trim() } : {}) };
    setPreviewTheme(theme);
    await persist([...schedules, next], "Giriş teması zamanlaması kaydedildi.");
  }

  async function applyCommand() {
    const parsed = parseLoginThemeCommand(command);
    if (!parsed) return setNotice("Komut biçimi geçersiz. Örneği kopyalayıp tarih/tema/tenant alanlarını değiştirin.");
    if (parsed.tenantCode !== "*" && !tenantMap[parsed.tenantCode]) return setNotice("Komuttaki tenant kodu kayıtlı kurumlarla eşleşmiyor.");
    const next: LoginThemeSchedule = { id: newId(), ...parsed };
    setPreviewTheme(next.theme);
    await persist([...schedules, next], "Tema komutu uygulandı ve zamanlamaya eklendi.");
    setCommand("");
  }

  async function toggle(item: LoginThemeSchedule) {
    await persist(schedules.map((x) => x.id === item.id ? { ...x, enabled: !x.enabled } : x), item.enabled ? "Tema zamanlaması pasife alındı." : "Tema zamanlaması yeniden etkinleştirildi.");
  }

  async function remove(item: LoginThemeSchedule) {
    await persist(schedules.filter((x) => x.id !== item.id), "Tema zamanlaması silindi.");
  }

  const preview = getLoginTheme(previewTheme);

  return <div className="space-y-4">
    <section className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="flex items-center gap-2 font-semibold"><Palette className="size-4 text-primary"/>Giriş Görseli ve Animasyon Zamanlaması</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">Tek giriş motoru korunur; yalnız görsel katman değişir. Zamanlama tüm kurumlara veya seçilen tenant'a uygulanabilir. Tema hatasında giriş ekranı otomatik olarak OkulOS Standart görünümüne döner.</p></div>
        <Button variant="outline" size="sm" className="gap-2" onClick={()=>void load()} disabled={loading||busy}><RefreshCw className="size-3.5"/>Yenile</Button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Tema</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={theme} onChange={e=>{const v=e.target.value as LoginThemeKey;setTheme(v);setPreviewTheme(v)}}>{LOGIN_THEME_CATALOG.map(x=><option key={x.key} value={x.key}>{x.label}</option>)}</select></div>
          <div><Label>Tenant kapsamı</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={tenantCode} onChange={e=>setTenantCode(e.target.value)}><option value="*">Tüm kurumlar (global)</option>{tenants.map(t=><option key={t.institution_code} value={t.institution_code}>{t.school_name} ({t.institution_code})</option>)}</select></div>
          <div><Label>Başlangıç</Label><Input className="mt-1" type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)}/></div>
          <div><Label>Bitiş</Label><Input className="mt-1" type="datetime-local" value={endsAt} onChange={e=>setEndsAt(e.target.value)}/></div>
          <div><Label>Öncelik</Label><Input className="mt-1" type="number" min={-10000} max={10000} value={priority} onChange={e=>setPriority(Number(e.target.value)||0)}/><p className="mt-1 text-[11px] text-muted-foreground">Çakışmada tenant'a özel kayıt önce, sonra yüksek öncelik kazanır.</p></div>
          <div><Label>Not</Label><Input className="mt-1" maxLength={240} value={note} onChange={e=>setNote(e.target.value)} placeholder="Örn. 29 Ekim"/></div>
          <Button className="sm:col-span-2 gap-2" onClick={()=>void addSchedule()} disabled={busy}><CalendarClock className="size-4"/>Zamanlamayı Kaydet</Button>
        </div>

        <div className={`relative min-h-64 overflow-hidden rounded-2xl bg-gradient-to-br ${preview.accentClass} p-6 text-white shadow-inner`}>
          <LoginThemeSurface theme={preview}/>
          <div className="relative flex h-full min-h-52 flex-col justify-between"><div><span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur"><Eye className="size-3"/>Önizleme</span><h3 className="mt-6 text-2xl font-semibold">{preview.label}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-white/75">{preview.description}</p></div><p className="mt-6 text-xs text-white/65">Mobilde giriş formu sade kalır; ağır animasyon gösterilmez.</p></div>
        </div>
      </div>
    </section>

    <section className="rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary"/>Hızlı Komut</h2>
      <p className="mt-1 text-xs text-muted-foreground">Biçim: <code className="rounded bg-muted px-1 py-0.5">tema aurora | tenant * | 2026-10-29 00:00 | 2026-10-29 23:59 | 100</code></p>
      <Textarea className="mt-3" rows={3} value={command} onChange={e=>setCommand(e.target.value)} placeholder="tema orbit | tenant 774380 | 2026-09-01 08:00 | 2026-09-15 23:59 | 120"/>
      <Button className="mt-3 w-full" variant="outline" onClick={()=>void applyCommand()} disabled={busy||!command.trim()}>Komutu Uygula</Button>
    </section>

    {notice?<div className="rounded-xl border bg-muted/40 p-3 text-sm">{notice}</div>:null}

    <section className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Kayıtlı Zamanlamalar</h2><p className="mt-1 text-xs text-muted-foreground">{schedules.length} kayıt</p></div>{loading?<span className="text-xs text-muted-foreground">Yükleniyor…</span>:null}</div>
      <div className="mt-4 space-y-2">{ordered.map(item=>{const status=scheduleStatus(item),meta=getLoginTheme(item.theme);return <article key={item.id} className="rounded-xl border p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><b className="text-sm">{meta.label}</b><span className={`rounded-full border px-2 py-0.5 text-[11px] ${status.className}`}>{status.label}</span><span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">Öncelik {item.priority}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.tenantCode==="*"?"Tüm kurumlar":`${tenantMap[item.tenantCode]??"Kurum"} (${item.tenantCode})`}</p><p className="mt-1 text-[11px] text-muted-foreground">{new Date(item.startsAt).toLocaleString("tr-TR")} → {new Date(item.endsAt).toLocaleString("tr-TR")}{item.note?` · ${item.note}`:""}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>setPreviewTheme(item.theme)}><Eye className="size-3.5"/></Button><Button size="sm" variant={item.enabled?"outline":"default"} disabled={busy} onClick={()=>void toggle(item)}><Power className="mr-1 size-3.5"/>{item.enabled?"Pasif":"Aç"}</Button><Button size="sm" variant="destructive" disabled={busy} onClick={()=>void remove(item)}><Trash2 className="size-3.5"/></Button></div></div></article>})}{!loading&&!ordered.length?<div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Henüz giriş teması zamanlaması yok. Varsayılan OkulOS görünümü kullanılıyor.</div>:null}</div>
    </section>
  </div>;
}
