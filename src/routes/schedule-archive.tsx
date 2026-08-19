import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Archive, CalendarCheck2, FileLock2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/schedule-archive")({
  head: () => ({ meta: [{ title: "Ders Programı Yayın ve Arşiv — OkulOS" }] }),
  component: ScheduleArchive,
});

type HistoryRow = {
  publication_id: string;
  effective_from: string;
  effective_to: string | null;
  academic_year: string | null;
  title: string;
  note: string | null;
  schedule_hash: string;
  row_count: number;
  published_at: string;
  same_day_revision_no: number;
};

function currentAcademicYear() {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function ScheduleArchive() {
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [academicYear, setAcademicYear] = useState(currentAcademicYear());
  const [title, setTitle] = useState("Haftalık Ders Programı");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_schedule_publication_history");
    if (error) { setMessage("Program arşivi yüklenemedi."); return; }
    setHistory((data ?? []) as HistoryRow[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function publish() {
    setBusy(true); setMessage(null);
    const { data, error } = await supabase.rpc("publish_current_schedule", {
      p_effective_from: effectiveFrom,
      p_academic_year: academicYear,
      p_title: title,
      p_note: note || undefined,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message.includes("EMPTY_SCHEDULE") ? "Boş ders programı yayınlanamaz." : "Program yayınlanamadı. Yetki ve program verilerini kontrol edin.");
      return;
    }
    setMessage(`Program kullanıma alındı ve değiştirilemez arşiv kaydı oluşturuldu. Kayıt: ${String(data).slice(0, 8)}…`);
    setNote("");
    await load();
  }

  return <AppShell title="Ders Programı Yayın & Arşiv" subtitle="Kullanıma alınan her sürüm değiştirilemez ispat kaydı olarak saklanır">
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950">
      <div className="flex items-start gap-2"><FileLock2 className="mt-0.5 size-4 shrink-0" /><div><b>Taslak program değiştirilebilir.</b> Ancak öğretmenlerin kullanmaya başlayacağı program “Yayınla / Kullanıma Al” işlemiyle dondurulur. Yeni program yayınlandığında önceki sürüm silinmez; yürürlük tarihi, yayın zamanı ve içerik özetiyle ispat kaydı olarak kalır.</div></div>
    </div>

    <section className="mt-5 rounded-xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 font-semibold"><CalendarCheck2 className="size-4" /> Mevcut Programı Kullanıma Al</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="space-y-2"><Label>Yürürlük Başlangıç Tarihi</Label><Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} /></div>
        <div className="space-y-2"><Label>Eğitim-Öğretim Yılı</Label><Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} /></div>
        <div className="space-y-2"><Label>Program Başlığı</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Açıklama / Değişiklik Nedeni</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn. 2. dönem program değişikliği" /></div>
      </div>
      <Button onClick={() => void publish()} disabled={busy} className="mt-4 w-full gap-2"><FileLock2 className="size-4" />{busy ? "Arşivleniyor..." : "Yayınla / Kullanıma Al ve Arşivle"}</Button>
      {message ? <p className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">{message}</p> : null}
    </section>

    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold"><Archive className="size-4" /> Program Geçmişi</h2><Button variant="outline" size="sm" onClick={() => void load()} className="gap-2"><RefreshCw className="size-4" /> Yenile</Button></div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-[860px] w-full text-sm"><thead><tr className="border-b bg-muted/40"><th className="p-3 text-left">Başlangıç</th><th className="p-3 text-left">Bitiş</th><th className="p-3 text-left">Sürüm</th><th className="p-3 text-left">Başlık</th><th className="p-3 text-left">Satır</th><th className="p-3 text-left">Yayın Zamanı</th><th className="p-3 text-left">İçerik Özeti</th><th className="p-3 text-left">Not</th></tr></thead>
          <tbody>{history.length ? history.map((h) => <tr key={h.publication_id} className="border-b last:border-0"><td className="p-3 font-medium">{new Date(`${h.effective_from}T00:00:00`).toLocaleDateString("tr-TR")}</td><td className="p-3">{h.effective_to ? new Date(`${h.effective_to}T00:00:00`).toLocaleDateString("tr-TR") : "Aktif / son sürüm"}</td><td className="p-3">{h.same_day_revision_no > 1 ? `Aynı gün revizyon ${h.same_day_revision_no}` : "Ana sürüm"}</td><td className="p-3">{h.title}</td><td className="p-3">{h.row_count}</td><td className="p-3">{new Date(h.published_at).toLocaleString("tr-TR")}</td><td className="p-3 font-mono text-xs">{h.schedule_hash.slice(0, 12)}…</td><td className="p-3">{h.note ?? "—"}</td></tr>) : <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Henüz kullanıma alınmış program sürümü yok.</td></tr>}</tbody></table>
      </div>
    </section>
  </AppShell>;
}
