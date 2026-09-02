import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { SecuritySectionNav } from "@/components/okulos/SecuritySectionNav";
import { supabase } from "@/lib/supabase";
import { canExitVisit, maskTckn } from "@/lib/visitor-security";

export const Route = createFileRoute("/security/visitors/inside")({ head: () => ({ meta: [{ title: "İçerideki Ziyaretçiler — OkulOS" }, { name: "description", content: "OkulOS içerideki ziyaretçi kayıtları ve güvenli çıkış işlemleri." }] }), component: InsideVisitors });
type Visit = { id: string; visitor_person_id: string; entry_location_id: string | null; entry_at: string; visit_reason: string | null; card_no: string | null; physical_id_seen: boolean; visitor_people: { full_name: string; phone: string | null; tc_last4: string | null } | null };

function InsideVisitors() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [exitLocation, setExitLocation] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(async () => { const [v, l] = await Promise.all([supabase.from("visitor_visits").select("id,visitor_person_id,entry_location_id,entry_at,visit_reason,card_no,physical_id_seen,visitor_people(full_name,phone,tc_last4)").eq("status", "inside").order("entry_at", { ascending: false }), supabase.from("duty_locations").select("id,name").eq("active", true).order("sort_order")]); if (!v.error) setVisits((v.data ?? []) as unknown as Visit[]); if (!l.error) { setLocations((l.data ?? []) as { id: string; name: string }[]); if (!exitLocation && l.data?.[0]) setExitLocation(l.data[0].id); } }, [exitLocation]);
  useEffect(() => { void load(); }, [load]);
  async function exitVisit(visit: Visit) { if (!canExitVisit("inside")) return; setBusy(visit.id); setMessage(null); const { data } = await supabase.auth.getUser(); const { error } = await supabase.from("visitor_visits").update({ status: "exited", exit_at: new Date().toISOString(), exited_by: data.user?.id ?? null, exit_location_id: exitLocation || null }).eq("id", visit.id).eq("status", "inside"); setBusy(null); setMessage(error ? "Çıkış kaydedilemedi." : "Çıkış kaydedildi."); if (!error) await load(); }
  return <AppShell title="İçerideki Ziyaretçiler" subtitle="Gerçek zamanlı içeride kayıtları">
    <SecuritySectionNav active="/security/visitors/inside" />
    <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold">Çıkış noktası</p><select value={exitLocation} onChange={(event) => setExitLocation(event.target.value)} className="mt-2 h-10 min-w-52 rounded-md border bg-background px-3 text-sm"><option value="">Seçiniz</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><Button variant="outline" onClick={() => void load()}><RefreshCw className="size-4" /> Yenile</Button></div>
    {message ? <p className="mb-4 rounded-lg border bg-muted p-3 text-sm">{message}</p> : null}
    <section className="overflow-hidden rounded-xl border bg-card"><div className="flex items-center gap-2 border-b p-4 font-semibold"><ShieldCheck className="size-5 text-success" /> Şu an içeride <span className="ml-auto rounded-full bg-muted px-2 py-1 text-xs">{visits.length}</span></div><div className="divide-y">{visits.map((visit) => <article key={visit.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="size-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{visit.visitor_people?.full_name ?? "Ziyaretçi"}</p><p className="mt-1 text-xs text-muted-foreground">Giriş {new Date(visit.entry_at).toLocaleString("tr-TR")} · {visit.visit_reason ?? "Neden belirtilmedi"}</p><p className="mt-1 text-xs text-muted-foreground">Kimlik {maskTckn(visit.visitor_people?.tc_last4 ? `0000000${visit.visitor_people.tc_last4}` : null)} · Kart {visit.card_no ?? "—"}</p></div><Button variant="outline" disabled={busy === visit.id || !exitLocation} onClick={() => void exitVisit(visit)}><LogOut className="size-4" /> ÇIKIŞ YAP</Button></article>)}{!visits.length ? <p className="p-8 text-center text-sm text-muted-foreground">Şu anda içeride kayıt yok.</p> : null}</div></section>
  </AppShell>;
}
