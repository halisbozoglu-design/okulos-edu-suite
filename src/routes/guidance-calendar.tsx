import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BellRing, CalendarDays, Camera, CheckCircle2, Clock3, Plus, QrCode, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/guidance-calendar")({
  head: () => ({ meta: [{ title: "Rehberlik Akışı & Akıllı Tahta — OkulOS" }] }),
  component: GuidanceCalendar,
});

type AcademicYear = { id: string; code: string; title: string | null; starts_on: string; ends_on: string; active: boolean; institution_code: string };
type Section = { id: string; display_name: string; academic_year_id: string; institution_code: string; active: boolean };
type Placement = { section_instance_id: string; physical_room_id: string; valid_from: string; valid_until: string | null; is_primary: boolean };
type Room = { id: string; room_code: string; name: string };
type CalendarRow = {
  id: string;
  section_instance_id: string;
  section_name: string;
  physical_room_id: string;
  room_code: string;
  room_name: string;
  activity_date: string;
  starts_at: string;
  ends_at: string;
  title: string;
  description: string | null;
  reminder_minutes: number;
  reminder_status: "PENDING" | "SENT" | "CANCELLED" | "FAILED" | null;
  remind_at: string | null;
  smartboard_barcode_public_id: string | null;
  smartboard_device_key: string | null;
  active: boolean;
};
type UnlockResult = { granted: boolean; decision_code: string; smartboard_device_key: string; actor_kind: string; event_id: string };
type UnlockAudit = { reason: string | null; guidance_activity_id: string | null; access_purpose: string; occurred_at: string };

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const clock = (value: string) => value.slice(0, 5);

function extractBarcodeId(raw: string) {
  return raw.match(uuidPattern)?.[0] ?? null;
}

function GuidanceCalendar() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [institutionCode, setInstitutionCode] = useState("");
  const [userId, setUserId] = useState("");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activities, setActivities] = useState<CalendarRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState("");
  const [activityDate, setActivityDate] = useState(today());
  const [startsAt, setStartsAt] = useState("09:00");
  const [endsAt, setEndsAt] = useState("09:40");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("30");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [manualReason, setManualReason] = useState("");
  const [unlockResult, setUnlockResult] = useState<(UnlockResult & { reason?: string | null }) | null>(null);
  const [busy, setBusy] = useState(false);

  const activeYear = useMemo(() => years.find((y) => y.active) ?? years[0] ?? null, [years]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const placementBySection = useMemo(() => {
    const map = new Map<string, Placement>();
    for (const p of placements) if (!map.has(p.section_instance_id)) map.set(p.section_instance_id, p);
    return map;
  }, [placements]);
  const selectedPlacement = sectionId ? placementBySection.get(sectionId) ?? null : null;
  const selectedRoom = selectedPlacement ? roomMap.get(selectedPlacement.physical_room_id) ?? null : null;
  const upcoming = useMemo(() => activities.filter((a) => a.active && `${a.activity_date}T${a.ends_at}` >= `${today()}T00:00`).slice(0, 10), [activities]);

  const load = useCallback(async () => {
    setMessage(null);
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData.user?.id;
    if (!uid) { setAuthorized(false); setMessage("Oturum bulunamadı."); return; }
    setUserId(uid);
    const { data: membership, error: membershipError } = await supabase
      .from("institution_memberships")
      .select("institution_code")
      .eq("user_id", uid)
      .eq("active", true)
      .order("is_owner", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (membershipError || !membership?.institution_code) { setAuthorized(false); setMessage("Aktif kurum bağlantısı bulunamadı."); return; }
    const inst = membership.institution_code as string;
    setInstitutionCode(inst);
    const { data: canGuide } = await supabase.rpc("smartboard_has_role", { p_institution_code: inst, p_user_id: uid, p_role_code: "GUIDANCE_COUNSELOR", p_at: new Date().toISOString() });
    if (!canGuide) { setAuthorized(false); return; }
    setAuthorized(true);

    // Materialize reminders that became due while this user was online.
    await supabase.rpc("dispatch_my_due_guidance_reminders").catch(() => undefined);

    const [y, s, p, r, a] = await Promise.all([
      supabase.from("academic_years").select("id,code,title,starts_on,ends_on,active,institution_code").eq("institution_code", inst).order("starts_on", { ascending: false }),
      supabase.from("section_instances").select("id,display_name,academic_year_id,institution_code,active").eq("institution_code", inst).eq("active", true).order("display_name"),
      supabase.from("section_room_placements").select("section_instance_id,physical_room_id,valid_from,valid_until,is_primary").eq("institution_code", inst).eq("is_primary", true).order("valid_from", { ascending: false }),
      supabase.from("physical_rooms").select("id,room_code,name").eq("institution_code", inst).eq("active", true).order("room_code"),
      supabase.from("guidance_calendar_v").select("id,section_instance_id,section_name,physical_room_id,room_code,room_name,activity_date,starts_at,ends_at,title,description,reminder_minutes,reminder_status,remind_at,smartboard_barcode_public_id,smartboard_device_key,active").eq("institution_code", inst).eq("counselor_user_id", uid).order("activity_date").order("starts_at"),
    ]);
    const error = y.error ?? s.error ?? p.error ?? r.error ?? a.error;
    if (error) { setMessage(`Rehberlik verileri okunamadı: ${error.message}`); return; }
    setYears((y.data ?? []) as AcademicYear[]);
    setSections((s.data ?? []) as Section[]);
    setPlacements((p.data ?? []) as Placement[]);
    setRooms((r.data ?? []) as Room[]);
    setActivities((a.data ?? []) as CalendarRow[]);
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => stopScanner(), []);

  async function saveActivity() {
    if (!authorized || !activeYear || !sectionId || !selectedPlacement || !title.trim()) {
      setMessage("Sınıf, etkinlik başlığı ve geçerli derslik eşleşmesi zorunludur."); return;
    }
    if (activityDate < activeYear.starts_on || activityDate > activeYear.ends_on) { setMessage("Etkinlik aktif eğitim-öğretim yılının dışında olamaz."); return; }
    if (startsAt >= endsAt) { setMessage("Bitiş saati başlangıç saatinden sonra olmalıdır."); return; }
    setBusy(true);
    const { error } = await supabase.from("guidance_class_activities").insert({
      institution_code: institutionCode,
      academic_year_id: activeYear.id,
      counselor_user_id: userId,
      section_instance_id: sectionId,
      physical_room_id: selectedPlacement.physical_room_id,
      activity_date: activityDate,
      starts_at: startsAt,
      ends_at: endsAt,
      title: title.trim(),
      description: description.trim() || null,
      reminder_minutes: Math.max(0, Math.min(10080, Number(reminderMinutes) || 0)),
      created_by: userId,
    });
    setBusy(false);
    if (error) { setMessage(`Etkinlik kaydedilemedi: ${error.message}`); return; }
    setTitle(""); setDescription("");
    setMessage("Rehberlik etkinliği yıllık akışa eklendi; hatırlatma ve tahta eşleştirmesi hazır.");
    await load();
  }

  async function cancelActivity(id: string) {
    setBusy(true);
    const { error } = await supabase.from("guidance_class_activities").update({ active: false, updated_at: new Date().toISOString() }).eq("id", id).eq("counselor_user_id", userId);
    setBusy(false);
    if (error) setMessage("Etkinlik iptal edilemedi."); else { setMessage("Etkinlik iptal edildi; bağlı hatırlatma da kapatıldı."); await load(); }
  }

  async function requestUnlock(barcodeId: string, reason?: string) {
    const clean = extractBarcodeId(barcodeId);
    if (!clean) { setScannerMessage("Geçerli SmartBoard barkod kimliği okunamadı."); return; }
    setBusy(true); setUnlockResult(null); setScannerMessage("Yetki ve takvim eşleşmesi kontrol ediliyor…");
    const { data, error } = await supabase.rpc("request_smartboard_barcode_unlock", {
      p_barcode_public_id: clean,
      p_reason: reason?.trim() || null,
      p_client_context: { source: "GUIDANCE_CALENDAR_UI", userAgent: navigator.userAgent },
      p_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) { setScannerMessage(`Tahta erişimi değerlendirilemedi: ${error.message}`); return; }
    const row = (Array.isArray(data) ? data[0] : data) as UnlockResult | undefined;
    if (!row) { setScannerMessage("Tahta erişim kararı alınamadı."); return; }
    let audit: UnlockAudit | null = null;
    if (row.event_id) {
      const result = await supabase.from("smartboard_unlock_events").select("reason,guidance_activity_id,access_purpose,occurred_at").eq("id", row.event_id).maybeSingle();
      audit = (result.data ?? null) as UnlockAudit | null;
    }
    setUnlockResult({ ...row, reason: audit?.reason ?? null });
    if (!row.granted && row.decision_code === "GUIDANCE_REASON_REQUIRED") {
      setPendingBarcode(clean); setScannerMessage("Takvimde eşleşen etkinlik yok ve ders öğretmeni tahtayı açmamış. Açma nedeni zorunlu."); return;
    }
    setPendingBarcode(null); setManualReason("");
    setScannerMessage(row.granted ? (row.decision_code === "GUIDANCE_CALENDAR_ACTIVITY" ? `Takvim etkinliği eşleşti. ${audit?.reason ?? "Tahta açma komutu gönderildi."}` : "Tahta erişimi onaylandı ve açma komutu gönderildi.") : `Erişim reddedildi: ${row.decision_code}`);
    if (row.granted) stopScanner();
  }

  function stopScanner() {
    if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScannerOpen(false);
  }

  async function startScanner() {
    setScannerMessage(null); setUnlockResult(null); setPendingBarcode(null); setManualReason("");
    const Detector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Detector) { setScannerOpen(true); setScannerMessage("Bu tarayıcı canlı barkod algılamayı desteklemiyor. Aşağıdaki alana barkod/QR içeriğini yapıştırabilirsiniz."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream; setScannerOpen(true);
      window.setTimeout(async () => {
        const video = videoRef.current; if (!video) return;
        video.srcObject = stream; await video.play();
        const detector = new Detector({ formats: ["qr_code"] });
        const scan = async () => {
          if (!streamRef.current || !videoRef.current) return;
          try {
            const found = await detector.detect(videoRef.current);
            const raw = found[0]?.rawValue;
            if (raw) { const id = extractBarcodeId(raw); if (id) { setManualBarcode(id); await requestUnlock(id); return; } }
          } catch { /* keep scanning */ }
          scanTimerRef.current = window.setTimeout(() => void scan(), 350);
        };
        void scan();
      }, 100);
    } catch {
      setScannerOpen(true); setScannerMessage("Kamera açılamadı. Kamera iznini kontrol edin veya barkod kimliğini elle girin.");
    }
  }

  const visibleSections = activeYear ? sections.filter((s) => s.academic_year_id === activeYear.id) : sections;

  return <AppShell title="Rehberlik Akışı & Akıllı Tahta" subtitle="Yıllık sınıf çalışmaları · otomatik hatırlatma · takvimle eşleşen barkod erişimi" action={<CalendarDays className="size-5" />}>
    {authorized === null ? <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">Rehberlik yetkisi ve kurum bilgisi kontrol ediliyor…</div> : null}
    {authorized === false ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"><div className="flex items-center gap-2 font-semibold"><ShieldAlert className="size-5" />Rehber öğretmen yetkisi gerekli</div><p className="mt-2">Bu ekran yalnız OkulOS kurum kaydında aktif rehber öğretmen yetkisi bulunan kullanıcılar için çalışır.</p></div> : null}
    {message ? <div className="mb-4 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div> : null}

    {authorized ? <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Yıllık akışa sınıf etkinliği ekle</h2><p className="mt-1 text-xs text-muted-foreground">Sınıfın güncel fiziksel dersliği otomatik kullanılır; eski yılın oda eşleşmesi taşınmaz.</p></div><Plus className="size-5 text-primary" /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Sınıf / Şube</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={sectionId} onChange={(e) => setSectionId(e.target.value)}><option value="">Seçiniz</option>{visibleSections.map((s) => <option key={s.id} value={s.id}>{s.display_name}</option>)}</select>{sectionId ? <p className="mt-1 text-xs text-muted-foreground">Derslik: {selectedRoom ? `${selectedRoom.room_code} · ${selectedRoom.name}` : "Eşleşme eksik — etkinlik kaydedilemez"}</p> : null}</div>
            <div><Label>Tarih</Label><Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} /></div>
            <div><Label>Hatırlatma</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={reminderMinutes} onChange={(e) => setReminderMinutes(e.target.value)}><option value="0">Etkinlik saatinde</option><option value="15">15 dk önce</option><option value="30">30 dk önce</option><option value="60">1 saat önce</option><option value="1440">1 gün önce</option></select></div>
            <div><Label>Başlangıç</Label><Input type="time" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
            <div><Label>Bitiş</Label><Input type="time" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Etkinlik adı</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Akran Nezaketi Sınıf Çalışması" /></div>
            <div className="sm:col-span-2"><Label>Açıklama</Label><textarea className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Amaç, içerik veya hazırlık notu" /></div>
          </div>
          <Button className="mt-4 w-full" disabled={busy || !selectedRoom} onClick={() => void saveActivity()}><Plus className="mr-2 size-4" />Akışa Ekle ve Hatırlatmayı Kur</Button>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Tahta barkodunu okut</h2><p className="mt-1 text-xs text-muted-foreground">Takvimde bu sınıf ve saat için etkinliğiniz varsa neden otomatik bağlanır.</p></div><QrCode className="size-5 text-primary" /></div>
          {!scannerOpen ? <Button className="mt-5 w-full" onClick={() => void startScanner()}><Camera className="mr-2 size-4" />Kamerayı Aç ve Barkodu Tara</Button> : <div className="mt-4 space-y-3">
            <div className="relative overflow-hidden rounded-xl border bg-black/90"><video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover" /><div className="pointer-events-none absolute inset-[18%] rounded-xl border-2 border-white/80" /></div>
            <Button variant="outline" className="w-full" onClick={stopScanner}>Kamerayı Kapat</Button>
          </div>}
          <div className="mt-4"><Label>Barkod / QR kimliği</Label><div className="mt-1 flex gap-2"><Input value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} placeholder="UUID veya QR içeriği" /><Button variant="outline" disabled={busy} onClick={() => void requestUnlock(manualBarcode)}>Kontrol Et</Button></div></div>
          {pendingBarcode ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30"><Label>Açma nedeni zorunlu</Label><textarea className="mt-1 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" value={manualReason} onChange={(e) => setManualReason(e.target.value)} placeholder="Örn. 7/B öğrenci grup çalışması / acil rehberlik görüşmesi" /><Button className="mt-2 w-full" disabled={busy || !manualReason.trim()} onClick={() => void requestUnlock(pendingBarcode, manualReason)}>Gerekçeyle Tahtayı Aç</Button></div> : null}
          {scannerMessage ? <div className="mt-4 rounded-xl border bg-muted/40 p-3 text-sm">{scannerMessage}</div> : null}
          {unlockResult ? <div className={`mt-3 rounded-xl border p-3 text-sm ${unlockResult.granted ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100" : "border-red-300 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100"}`}><div className="flex items-center gap-2 font-semibold">{unlockResult.granted ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}{unlockResult.decision_code}</div>{unlockResult.reason ? <p className="mt-1 text-xs">{unlockResult.reason}</p> : null}<p className="mt-1 text-xs opacity-80">Tahta: {unlockResult.smartboard_device_key} · Log: {unlockResult.event_id}</p></div> : null}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Yaklaşan rehberlik etkinlikleri</h2><p className="mt-1 text-xs text-muted-foreground">Hatırlatma, sınıfın güncel dersliği ve varsa SmartBoard eşleşmesi birlikte görünür.</p></div><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="mr-2 size-4" />Yenile</Button></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{upcoming.length ? upcoming.map((a) => <article key={a.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-primary">{a.section_name} · {a.room_code}</p><h3 className="mt-1 font-semibold">{a.title}</h3></div>{a.reminder_status === "SENT" ? <CheckCircle2 className="size-4 text-emerald-600" /> : <BellRing className="size-4 text-amber-600" />}</div><div className="mt-3 space-y-1 text-xs text-muted-foreground"><p className="flex items-center gap-2"><CalendarDays className="size-3.5" />{a.activity_date}</p><p className="flex items-center gap-2"><Clock3 className="size-3.5" />{clock(a.starts_at)}–{clock(a.ends_at)} · {a.reminder_minutes} dk önce hatırlat</p><p>Tahta: {a.smartboard_device_key ?? "Bu odada aktif tahta eşleşmesi yok"}</p></div>{a.description ? <p className="mt-3 text-xs leading-relaxed">{a.description}</p> : null}<Button className="mt-3 w-full" size="sm" variant="outline" disabled={busy} onClick={() => void cancelActivity(a.id)}>Etkinliği İptal Et</Button></article>) : <div className="col-span-full rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Yaklaşan rehberlik etkinliği yok.</div>}</div>
      </section>
    </div> : null}
  </AppShell>;
}
