import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Camera, CheckCircle2, CreditCard, LoaderCircle, Phone, ShieldAlert, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { LiveIdCardScanner } from "@/components/okulos/LiveIdCardScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecuritySectionNav } from "@/components/okulos/SecuritySectionNav";
import { supabase } from "@/lib/supabase";
import { canCompleteCheckIn, maskTckn, type IdentityReading } from "@/lib/visitor-security";

export const Route = createFileRoute("/security/visitors/check-in")({
  head: () => ({ meta: [{ title: "Ziyaretçi Giriş — OkulOS" }, { name: "description", content: "OkulOS canlı kimlik doğrulamalı ziyaretçi giriş ekranı." }] }),
  component: VisitorCheckIn,
});

type Location = { id: string; name: string; visitor_entry_enabled: boolean };
type Student = { id: string; full_name: string; school_number: string | null; class_id: string | null };
type Person = { id: string; full_name: string; phone: string | null; tc_last4: string | null };

function VisitorCheckIn() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [locationId, setLocationId] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [tcLast4, setTcLast4] = useState("");
  const [reason, setReason] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [identity, setIdentity] = useState<IdentityReading | null>(null);
  const [physicalSeen, setPhysicalSeen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [mode, setMode] = useState<"camera" | "manual" | "student" | "phone">("camera");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const load = useCallback(async () => {
    const [locationResponse, peopleResponse, studentResponse] = await Promise.all([
      supabase.from("duty_locations").select("id,name,visitor_entry_enabled").eq("visitor_entry_enabled", true).eq("active", true).order("sort_order"),
      supabase.from("visitor_people").select("id,full_name,phone,tc_last4").order("updated_at", { ascending: false }).limit(50),
      supabase.from("students").select("id,full_name,school_number,class_id").eq("active", true).order("full_name").limit(100),
    ]);
    if (!locationResponse.error) { const next = (locationResponse.data ?? []) as Location[]; setLocations(next); if (!locationId && next[0]) setLocationId(next[0].id); }
    if (!peopleResponse.error) setPeople((peopleResponse.data ?? []) as Person[]);
    if (!studentResponse.error) setStudents((studentResponse.data ?? []) as Student[]);
  }, [locationId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (identity) { setVisitorName(identity.fullName); setTcLast4(identity.tckn.slice(-4)); setMode("camera"); } }, [identity]);

  const matchingStudents = studentSearch.trim().length < 2 ? [] : students.filter((item) => `${item.full_name} ${item.school_number ?? ""}`.toLocaleLowerCase("tr-TR").includes(studentSearch.toLocaleLowerCase("tr-TR"))).slice(0, 8);
  const matchingPeople = phone.trim().length < 3 ? [] : people.filter((item) => item.phone?.includes(phone.trim())).slice(0, 5);
  const ready = canCompleteCheckIn(physicalSeen, Boolean(identity || visitorName.trim()), visitorName, locationId);

  async function completeCheckIn() {
    setMessage(null);
    if (!ready) { setMessage({ tone: "error", text: "Kimliği fiziksel olarak gördüm ve kişiyle eşleştirdim onayı, ad ve giriş noktası zorunludur." }); return; }
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { setBusy(false); setMessage({ tone: "error", text: "Oturum doğrulanamadı. Tekrar giriş yapın." }); return; }
    let personId: string | null = null;
    if (phone.trim()) {
      const existingPerson = await supabase.from("visitor_people").select("id").eq("phone", phone.trim()).order("updated_at", { ascending: false }).limit(1).maybeSingle();
      personId = (existingPerson.data as { id: string } | null)?.id ?? null;
    }
    if (!personId) {
      const personResponse = await supabase.from("visitor_people").insert({ full_name: visitorName.trim(), phone: phone.trim() || null, tc_last4: tcLast4 || null, source: identity ? "camera_live" : student ? "student_lookup" : phone ? "phone_lookup" : "manual" }).select("id").single();
      if (personResponse.error || !personResponse.data) { setBusy(false); setMessage({ tone: "error", text: "Ziyaretçi kaydı oluşturulamadı." }); return; }
      personId = personResponse.data.id as string;
    }
    const restrictionResponse = await supabase.from("visitor_access_restrictions").select("decision").eq("is_active", true).or(`visitor_person_id.eq.${personId},related_student_id.eq.${student?.id ?? "00000000-0000-0000-0000-000000000000"}`);
    const decisions = (restrictionResponse.data ?? []) as { decision: "allow" | "deny" | "approval_required" }[];
    if (restrictionResponse.error || decisions.some((item) => item.decision === "deny")) { setBusy(false); setMessage({ tone: "error", text: "Bu ziyaretçi/öğrenci için aktif erişim kısıtlaması var; giriş reddedildi." }); return; }
    if (decisions.some((item) => item.decision === "approval_required")) { setBusy(false); setMessage({ tone: "info", text: "Bu ziyaret için kurum onayı gerekiyor; içeride kaydı oluşturulmadı." }); return; }
    const visitResponse = await supabase.from("visitor_visits").insert({ visitor_person_id: personId, entry_location_id: locationId, related_student_id: student?.id ?? null, visit_reason: reason.trim() || null, card_no: cardNo.trim() || null, status: "inside", physical_id_seen: physicalSeen, identity_method: identity ? "camera_live" : "manual", identity_verified_at: new Date().toISOString(), identity_verified_by: userId, entered_by: userId, phone_used: phone.trim() || null }).select("id").single();
    setBusy(false);
    if (visitResponse.error) { setMessage({ tone: "error", text: visitResponse.error.message.includes("physical") ? "Fiziksel kimlik doğrulaması olmadan giriş tamamlanamaz." : "Ziyaret girişi kaydedilemedi." }); return; }
    setMessage({ tone: "success", text: `${visitorName.trim()} için giriş kaydı tamamlandı. Kimlik: ${identity?.maskedTckn ?? maskTckn(`0000000${tcLast4}`)}` });
    setVisitorName(""); setPhone(""); setTcLast4(""); setReason(""); setCardNo(""); setStudent(null); setStudentSearch(""); setIdentity(null); setPhysicalSeen(false); await load();
  }

  function pickPerson(person: Person) { setVisitorName(person.full_name); setPhone(person.phone ?? ""); setTcLast4(person.tc_last4 ?? ""); setMode("phone"); }

  return <AppShell title="Güvenlik & Ziyaretçi" subtitle="Fiziksel kimlik doğrulamalı hızlı giriş">
    <SecuritySectionNav active="/security/visitors/check-in" />
    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-primary">Ana işlem</p><h1 className="mt-1 text-xl font-semibold">Ziyaretçi girişi</h1><p className="mt-1 text-sm text-muted-foreground">Kamera sonucu tek başına yeterli değildir; kimliği fiziksel olarak görüp kişiyle eşleştirin.</p></div><CreditCard className="size-6 text-primary" /></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2"><Button type="button" size="lg" className="h-14" onClick={() => { setMode("camera"); setScannerOpen(true); }}><Camera />Kamerayla kimlik oku</Button><Button type="button" variant="outline" size="lg" className="h-14" onClick={() => setMode("manual")}><UserPlus />Manuel giriş</Button><Button type="button" variant="outline" onClick={() => setMode("student")}><Users />Öğrenci Bul</Button><Button type="button" variant="outline" onClick={() => setMode("phone")}><Phone />Telefonla Bul</Button></div>
        {mode === "student" ? <div className="mt-4 rounded-lg border bg-muted/20 p-3"><Label>Öğrenci ara</Label><Input className="mt-2" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Ad soyad veya okul numarası" />{matchingStudents.length ? <div className="mt-2 divide-y rounded-md border bg-card">{matchingStudents.map((item) => <button type="button" key={item.id} className="block w-full px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => { setStudent(item); setStudentSearch(item.full_name); setMode("manual"); }}>{item.full_name}<span className="ml-2 text-xs text-muted-foreground">{item.school_number ?? "Numara yok"}</span></button>)}</div> : null}</div> : null}
        {mode === "phone" ? <div className="mt-4 rounded-lg border bg-muted/20 p-3"><Label>Telefon</Label><Input className="mt-2" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefon numarası" />{matchingPeople.length ? <div className="mt-2 divide-y rounded-md border bg-card">{matchingPeople.map((item) => <button type="button" key={item.id} className="block w-full px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => pickPerson(item)}>{item.full_name}<span className="ml-2 text-xs text-muted-foreground">{item.phone}</span></button>)}</div> : null}</div> : null}
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label>Ad soyad</Label><Input value={visitorName} onChange={(event) => setVisitorName(event.target.value)} placeholder="Ziyaretçi adı soyadı" /></div><div className="space-y-2"><Label>Giriş noktası</Label><select value={locationId} onChange={(event) => setLocationId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Nokta seçin</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="space-y-2"><Label>T.C. son 4 hane</Label><Input inputMode="numeric" maxLength={4} value={tcLast4} onChange={(event) => setTcLast4(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Saklanmaz; yalnızca son 4" /></div><div className="space-y-2"><Label>Telefon</Label><Input inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></div><div className="space-y-2"><Label>Ziyaret kartı no</Label><Input value={cardNo} onChange={(event) => setCardNo(event.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label>Ziyaret nedeni</Label><Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Görüşme, teslimat, veli görüşmesi…" /></div></div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3"><input type="checkbox" checked={physicalSeen} onChange={(event) => setPhysicalSeen(event.target.checked)} className="mt-1 size-4 accent-primary" /><span className="text-sm"><b>Kimliği fiziksel olarak gördüm ve kişiyle eşleştirdim.</b><span className="mt-1 block text-xs text-muted-foreground">Bu onay olmadan GİRİŞİ TAMAMLA etkinleşmez ve veritabanı kuralı da bunu zorunlu tutar.</span></span></label>
        {identity ? <div className="mt-3 flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 p-3"><CheckCircle2 className="size-5 text-success"/><div><p className="text-sm font-medium">Canlı kimlik doğrulandı</p><p className="text-xs text-muted-foreground">{identity.fullName} · {identity.maskedTckn}</p></div></div> : null}
        {message ? <div role="alert" className={`mt-4 rounded-lg border p-3 text-sm ${message.tone === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : message.tone === "success" ? "border-success/30 bg-success/10 text-success-foreground" : "border-border bg-muted"}`}>{message.text}</div> : null}
        <Button className="mt-5 w-full" size="lg" disabled={!ready || busy} onClick={() => void completeCheckIn()}>{busy ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />}GİRİŞİ TAMAMLA</Button>
      </section>
      <aside className="space-y-4"><div className="rounded-xl border bg-card p-4"><div className="flex items-center gap-2"><ShieldAlert className="size-5 text-primary"/><h2 className="font-semibold">Kimlik ve veri güvenliği</h2></div><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>• Açık T.C. Kimlik Numarası tutulmaz; kamera sonucunda yalnızca maskeli görünüm ve son 4 hane kullanılır.</li><li>• Kamera görüntüsü dosya, blob, base64, depolama veya ağa gönderilmez.</li><li>• NFC bu PWA/web sürümünde pasiftir; okuyucu desteği için manuel akış hazırdır.</li></ul></div><div className="rounded-xl border bg-card p-4"><p className="text-sm font-semibold">PWA / güvenli bağlantı</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Kamera ve bildirimler güvenli bağlantı ister. iOS Safari’de paylaş menüsünden Ana Ekrana Ekle, Android’de tarayıcı menüsünden Uygulamayı Yükle seçeneklerini kullanın.</p></div>{student ? <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">İlişkili öğrenci</p><p className="mt-1 font-medium">{student.full_name}</p><Button className="mt-3" size="sm" variant="outline" onClick={() => setStudent(null)}>Kaldır</Button></div> : null}</aside>
    </div>
    {scannerOpen ? <LiveIdCardScanner onClose={() => setScannerOpen(false)} onStableReading={(reading) => { setIdentity(reading); setScannerOpen(false); }} /> : null}
  </AppShell>;
}
