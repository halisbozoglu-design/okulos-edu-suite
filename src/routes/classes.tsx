import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, UploadCloud, Users } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { parseEokulFile, type EokulStudentRow } from "@/lib/eokul-import";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Sınıf ve Öğrenci Yönetimi — OkulOS" },
      {
        name: "description",
        content: "e-Okul sınıf listelerini PDF/Excel olarak içe aktarın, program türlerini ve mevcutları Supabase üzerinden yönetin.",
      },
    ],
  }),
  component: ClassManagement,
});

type ClassSummary = {
  id: string;
  class_name: string;
  program_type: string | null;
  composite_key: string | null;
  split_threshold: number;
  student_count: number;
  needs_split: boolean;
  suggested_group_count: number;
};

function ClassManagement() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<EokulStudentRow[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadClasses = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("class_roster_summary")
      .select("id,class_name,program_type,composite_key,split_threshold,student_count,needs_split,suggested_group_count")
      .order("class_name");
    if (loadError) {
      setError("Sınıf verileri yüklenemedi.");
      return;
    }
    setClasses((data ?? []) as ClassSummary[]);
  }, []);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  const totalStudents = useMemo(
    () => classes.reduce((sum, item) => sum + Number(item.student_count || 0), 0),
    [classes],
  );

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("FILE_TOO_LARGE");
      const rows = await parseEokulFile(file);
      if (!rows.length) throw new Error("EMPTY_IMPORT");
      setSelectedFile(file);
      setPreview(rows);
    } catch (parseError) {
      console.error(parseError);
      setSelectedFile(null);
      setPreview([]);
      setError("Dosya okunamadı. e-Okul listesinin PDF/Excel düzenini ve gerekli sütunları kontrol edin.");
    } finally {
      setBusy(false);
    }
  }

  async function importRoster() {
    if (!selectedFile || !preview.length) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    const ext = selectedFile.name.split(".").pop()?.toLowerCase() ?? "";
    const { data, error: importError } = await supabase.rpc("import_eokul_roster", {
      p_file_name: selectedFile.name,
      p_file_type: ext,
      p_rows: preview,
    });
    setBusy(false);

    if (importError) {
      setError("İçe aktarma tamamlanamadı. Yetkinizi veya satır verilerini kontrol edin.");
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    setSuccess(`${result?.imported_students ?? preview.length} öğrenci, ${result?.affected_classes ?? 0} sınıfa aktarıldı.`);
    setPreview([]);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    await loadClasses();
  }

  return (
    <AppShell title="Sınıf Yönetimi" subtitle="e-Okul içe aktarma">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className="w-full rounded-xl border-2 border-dashed border-border bg-card px-4 py-8 text-center transition-colors hover:border-primary/50"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          {busy ? <Loader2 className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
        </div>
        <p className="mt-3 text-sm font-medium">e-Okul sınıf listesi yükleyin</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF veya Excel · en fazla 10 MB · sürükleyip bırakabilirsiniz</p>
        <span className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Dosya Seç</span>
      </button>

      {preview.length ? (
        <section className="mt-4 rounded-xl border border-primary/20 bg-primary-soft p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{selectedFile?.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{preview.length} öğrenci satırı doğrulandı. İlk 5 kayıt önizlemede gösteriliyor.</p>
              <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
                <table className="min-w-[620px] w-full text-xs">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr><th className="px-3 py-2 text-left">No</th><th className="px-3 py-2 text-left">Ad Soyad</th><th className="px-3 py-2 text-left">Sınıf</th><th className="px-3 py-2 text-left">Program</th></tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, index) => (
                      <tr key={`${row.schoolNumber}-${index}`} className="border-t border-border">
                        <td className="px-3 py-2">{row.schoolNumber}</td>
                        <td className="px-3 py-2">{row.fullName}</td>
                        <td className="px-3 py-2 font-medium">{row.className}</td>
                        <td className="px-3 py-2">{row.programType || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex gap-2">
                <Button onClick={importRoster} disabled={busy} className="flex-1">{busy ? "Aktarılıyor..." : "Supabase'e Aktar"}</Button>
                <Button variant="outline" onClick={() => { setPreview([]); setSelectedFile(null); }}>İptal</Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {error ? <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      {success ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm text-primary"><CheckCircle2 className="size-4" />{success}</div> : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Toplam Şube</p>
          <p className="mt-1 text-lg font-semibold">{classes.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Toplam Öğrenci</p>
          <p className="mt-1 text-lg font-semibold">{totalStudents}</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Sınıf</th>
              <th className="px-3 py-2 text-left font-medium">Program</th>
              <th className="px-3 py-2 text-left font-medium">Mevcut</th>
              <th className="px-3 py-2 text-right font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="whitespace-nowrap px-3 py-2 font-medium">{item.composite_key ?? item.class_name}</td>
                <td className="px-3 py-2"><Badge variant="secondary">{item.program_type || "Genel"}</Badge></td>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-1.5 tabular-nums"><Users className="size-3.5 text-muted-foreground" />{item.student_count}</span></td>
                <td className="px-3 py-2 text-right">
                  {item.needs_split ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><AlertTriangle className="size-3.5" />{item.suggested_group_count} gruba bölünmeli</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Uygun</span>
                  )}
                </td>
              </tr>
            ))}
            {!classes.length ? <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">Henüz içe aktarılmış sınıf bulunmuyor.</td></tr> : null}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Composite sınıf anahtarı sınıf + program türünden otomatik üretilir. 25 öğrenciyi aşan sınıflar grup bölme için işaretlenir.</p>
    </AppShell>
  );
}
