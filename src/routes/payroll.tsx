import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, ChevronRight, FileSpreadsheet, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/payroll")({
  head: () => ({
    meta: [
      { title: "Ek Ders Puantaj Tablosu — OkulOS" },
      {
        name: "description",
        content:
          "Aylık ek ders saatlerini gün gün takip edin, gündüz/nöbet/rehberlik kırılımını görün ve KBS için dışa aktarın.",
      },
    ],
  }),
  component: PayrollGrid,
});

type Category = "gunduz" | "nobet" | "rehberlik";
type MatrixRow = {
  teacher_id: string;
  full_name: string | null;
  role: string;
  work_date: string;
  category: Category;
  hours: number;
  kbs_data_type: string;
  approved: boolean;
};
type TeacherGrid = {
  id: string;
  name: string;
  role: string;
  daily: Record<Category, number[]>;
  approved: boolean;
};
type KbsRow = {
  tckn: string;
  full_name: string;
  data_type: string;
  hours: number;
  explanation: string;
};

const subRows: { key: Category; label: string }[] = [
  { key: "gunduz", label: "Gündüz" },
  { key: "nobet", label: "Nöbet" },
  { key: "rehberlik", label: "Rehberlik" },
];

function istanbulYearMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  return parts.slice(0, 7);
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function PayrollGrid() {
  const [period, setPeriod] = useState(istanbulYearMonth);
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [year, month] = period.split("-").map(Number);
  const dayCount = new Date(year, month, 0).getDate();
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount]);

  const loadMatrix = useCallback(async () => {
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("payroll_month_matrix", {
      p_year: year,
      p_month: month,
    });
    if (rpcError) {
      setError("Ek ders matrisi yüklenemedi. Yetkinizi ve Supabase migration durumunu kontrol edin.");
      return;
    }
    setRows((data ?? []) as MatrixRow[]);
  }, [year, month]);

  useEffect(() => {
    void loadMatrix();
  }, [loadMatrix]);

  const teachers = useMemo<TeacherGrid[]>(() => {
    const map = new Map<string, TeacherGrid>();
    for (const row of rows) {
      if (!map.has(row.teacher_id)) {
        map.set(row.teacher_id, {
          id: row.teacher_id,
          name: row.full_name ?? "Öğretmen",
          role: row.role,
          daily: {
            gunduz: Array(dayCount).fill(0),
            nobet: Array(dayCount).fill(0),
            rehberlik: Array(dayCount).fill(0),
          },
          approved: true,
        });
      }
      const item = map.get(row.teacher_id)!;
      const day = Number(row.work_date.slice(8, 10));
      if (day >= 1 && day <= dayCount) item.daily[row.category][day - 1] += Number(row.hours ?? 0);
      item.approved = item.approved && Boolean(row.approved);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [rows, dayCount]);

  function toggle(id: string) {
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function recalculate() {
    setBusy(true);
    setError(null);
    setMessage(null);
    const { error: rpcError } = await supabase.rpc("recalculate_payroll_month", {
      p_year: year,
      p_month: month,
    });
    setBusy(false);
    if (rpcError) {
      setError("Hesaplama tamamlanamadı. Personel ek ders kuralları, takvim veya yetkileri kontrol edin.");
      return;
    }
    setMessage("Aylık ek ders matrisi yeniden hesaplandı.");
    await loadMatrix();
  }

  async function approveMonth() {
    setBusy(true);
    setError(null);
    setMessage(null);
    const { data, error: rpcError } = await supabase.rpc("approve_payroll_month", {
      p_year: year,
      p_month: month,
    });
    setBusy(false);
    if (rpcError) {
      setError("Ay onaylanamadı.");
      return;
    }
    setMessage(`${Number(data ?? 0)} ek ders satırı onaylandı.`);
    await loadMatrix();
  }

  async function exportKbs() {
    setBusy(true);
    setError(null);
    setMessage(null);
    const { data, error: rpcError } = await supabase.rpc("kbs_payroll_export", {
      p_year: year,
      p_month: month,
    });
    setBusy(false);
    if (rpcError) {
      setError("KBS aktarım verisi oluşturulamadı.");
      return;
    }
    const exportRows = (data ?? []) as KbsRow[];
    if (!exportRows.length) {
      setError("KBS çıktısı için önce hesaplamayı onaylayın.");
      return;
    }
    const header = ["TCKN", "Ad Soyad", "Veri Tipi", "Saat", "Açıklama"];
    const csv = [
      header.map(csvEscape).join(";"),
      ...exportRows.map((r) =>
        [r.tckn, r.full_name, r.data_type, r.hours, r.explanation].map(csvEscape).join(";"),
      ),
    ].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `OkulOS-KBS-${period}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("KBS aktarım CSV dosyası oluşturuldu. Veri tiplerini MEBBİS çıktısıyla karşılaştırmadan KBS'ye yüklemeyin.");
  }

  return (
    <AppShell title="Ek Ders Puantajı" subtitle={`${period} · Supabase hesaplama`}>
      <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
        <input
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button variant="outline" className="gap-2" onClick={recalculate} disabled={busy}>
            <RefreshCw className={cn("size-4", busy && "animate-spin")} />
            Hesapla
          </Button>
          <Button variant="secondary" className="gap-2" onClick={approveMonth} disabled={busy || !rows.length}>
            <CheckCircle2 className="size-4" />
            Ayı Onayla
          </Button>
          <Button className="gap-2" onClick={exportKbs} disabled={busy || !rows.length}>
            <FileSpreadsheet className="size-4" />
            KBS CSV Aktar
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Hesaplama; haftalık ders yükü, personelin aylık karşılığı ders saati, onaylı devamsızlıklar, onaylı vekaletler, nöbet, rehberlik ve kurum takvimindeki resmî tatil/idari izin kurallarını birlikte değerlendirir.
      </div>

      {message ? <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{message}</div> : null}
      {error ? <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-max border-collapse text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 w-10 bg-muted/95 px-2 py-2 text-left font-medium">#</th>
              <th className="sticky left-10 z-10 min-w-[150px] bg-muted/95 px-3 py-2 text-left font-medium">Öğretmen</th>
              <th className="sticky left-[190px] z-10 min-w-[130px] border-r border-border bg-muted/95 px-3 py-2 text-left font-medium">Görev</th>
              {days.map((d) => <th key={d} className="w-9 px-2 py-2 text-center font-medium">{d}</th>)}
              <th className="px-3 py-2 text-center font-medium">Top.</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((row, idx) => {
              const expanded = open.includes(row.id);
              const totals = days.map((_, i) => row.daily.gunduz[i] + row.daily.nobet[i] + row.daily.rehberlik[i]);
              return (
                <Fragment key={row.id}>
                  <tr className="border-t border-border">
                    <td className="sticky left-0 z-10 bg-card px-2 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="sticky left-10 z-10 bg-card px-3 py-2">
                      <button type="button" onClick={() => toggle(row.id)} className="flex items-center gap-1.5 font-medium">
                        {expanded ? <ChevronDown className="size-4 text-primary" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                        <span className="truncate">{row.name}</span>
                      </button>
                    </td>
                    <td className="sticky left-[190px] z-10 border-r border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                      {row.approved ? "Onaylı" : "Taslak"}
                    </td>
                    {totals.map((v, i) => (
                      <td key={i} className={cn("px-2 py-2 text-center tabular-nums", v === 0 && "text-muted-foreground/40")}>{v || 0}</td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold tabular-nums">{totals.reduce((a, b) => a + b, 0)}</td>
                  </tr>
                  {expanded && subRows.map((sub) => (
                    <tr key={`${row.id}-${sub.key}`} className="border-t border-border bg-muted/30">
                      <td className="sticky left-0 z-10 bg-muted/60 px-2 py-1.5" />
                      <td className="sticky left-10 z-10 bg-muted/60 px-3 py-1.5 pl-9 text-xs text-muted-foreground">{sub.label}</td>
                      <td className="sticky left-[190px] z-10 border-r border-border bg-muted/60 px-3 py-1.5" />
                      {row.daily[sub.key].map((v, i) => (
                        <td key={i} className={cn("px-2 py-1.5 text-center text-xs tabular-nums", v === 0 ? "text-muted-foreground/40" : "text-foreground")}>{v}</td>
                      ))}
                      <td className="px-3 py-1.5 text-center text-xs font-medium tabular-nums">{row.daily[sub.key].reduce((a, b) => a + b, 0)}</td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
            {!teachers.length ? (
              <tr><td colSpan={dayCount + 4} className="px-4 py-8 text-center text-sm text-muted-foreground">Bu ay için hesaplanmış ek ders kaydı yok. “Hesapla” ile matrisi oluşturun.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        KBS çıktısı yalnızca onaylanmış satırlardan oluşturulur. Resmî ödeme öncesinde MEBBİS Ek Ders Modülü ile veri tipi ve saat toplamları birebir doğrulanmalıdır.
      </p>
    </AppShell>
  );
}
