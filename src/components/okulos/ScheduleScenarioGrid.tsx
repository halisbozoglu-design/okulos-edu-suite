import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
type Row = {
  id: string;
  teacher_id: string;
  class_id: string;
  class_name: string;
  subject: string;
  weekday: number;
  period: number;
  locked: boolean;
};
const days: Record<number, string> = {
  1: "Pzt",
  2: "Sal",
  3: "Çar",
  4: "Per",
  5: "Cum",
  6: "Cmt",
  7: "Paz",
};
export function ScheduleScenarioGrid({ scenarioId }: { scenarioId: string }) {
  const [open, setOpen] = useState(false),
    [rows, setRows] = useState<Row[]>([]),
    [loading, setLoading] = useState(false),
    [classId, setClassId] = useState(""),
    [teacherId, setTeacherId] = useState("");
  useEffect(() => {
    if (!open || rows.length) return;
    setLoading(true);
    void supabase
      .from("schedule_scenario_rows")
      .select("id,teacher_id,class_id,class_name,subject,weekday,period,locked")
      .eq("scenario_id", scenarioId)
      .order("weekday")
      .order("period")
      .then((r: { error: unknown; data: unknown }) => {
        if (!r.error) setRows((r.data ?? []) as Row[]);
        setLoading(false);
      });
  }, [open, rows.length, scenarioId]);
  const classes = useMemo(
      () => Array.from(new Map(rows.map((x) => [x.class_id, x.class_name])).entries()),
      [rows],
    ),
    teachers = useMemo(() => Array.from(new Set(rows.map((x) => x.teacher_id))), [rows]),
    filtered = useMemo(
      () =>
        rows.filter(
          (x) => (!classId || x.class_id === classId) && (!teacherId || x.teacher_id === teacherId),
        ),
      [rows, classId, teacherId],
    ),
    periods = useMemo(() => Math.max(1, ...rows.map((x) => x.period)), [rows]),
    dayList = useMemo(
      () => Array.from(new Set(rows.map((x) => x.weekday))).sort((a, b) => a - b),
      [rows],
    );
  return (
    <div className="mt-3">
      <Button size="sm" variant="outline" className="w-full" onClick={() => setOpen((v) => !v)}>
        {open ? (
          <EyeOff aria-hidden="true" className="mr-1 size-4" />
        ) : (
          <Eye aria-hidden="true" className="mr-1 size-4" />
        )}
        {open ? "Program Önizlemesini Kapat" : "Programı Gör"}
      </Button>
      {open ? (
        <div className="mt-2 rounded-lg border bg-background p-2" aria-busy={loading}>
          {loading ? (
            <p
              role="status"
              aria-live="polite"
              className="p-3 text-center text-xs text-muted-foreground"
            >
              Program yükleniyor…
            </p>
          ) : (
            <>
              <div className="mb-2 grid gap-2 sm:grid-cols-2">
                <select
                  aria-label="Önizleme sınıf filtresi"
                  className="h-8 rounded border bg-background px-2 text-xs"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                >
                  <option value="">Tüm sınıflar</option>
                  {classes.map(([id, n]) => (
                    <option key={id} value={id}>
                      {n}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Önizleme öğretmen filtresi"
                  className="h-8 rounded border bg-background px-2 text-xs"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">Tüm öğretmenler</option>
                  {teachers.map((id) => (
                    <option key={id} value={id}>
                      {id.slice(0, 8)}…
                    </option>
                  ))}
                </select>
              </div>
              <div
                className="overflow-x-auto"
                tabIndex={0}
                aria-label="Senaryo ders programı tablosu; yatay kaydırılabilir"
              >
                <table className="w-full min-w-[520px] text-[10px]">
                  <caption className="sr-only">
                    Filtrelenmiş ders programı senaryo önizlemesi
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="border p-1">
                        Saat
                      </th>
                      {dayList.map((d) => (
                        <th key={d} scope="col" className="border p-1">
                          {days[d] ?? d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: periods }, (_, i) => i + 1).map((p) => (
                      <tr key={p}>
                        <th scope="row" className="border p-1 text-center font-semibold">
                          {p}
                        </th>
                        {dayList.map((d) => {
                          const slot = filtered.filter((x) => x.weekday === d && x.period === p);
                          return (
                            <td
                              key={d}
                              aria-label={`${days[d] ?? d}, ${p}. saat, ${slot.length} ders`}
                              className="min-w-24 border p-1 align-top"
                            >
                              {slot.map((x) => (
                                <div
                                  key={x.id}
                                  className={`mb-1 rounded px-1 py-0.5 ${x.locked ? "bg-muted font-semibold" : "bg-primary/5"}`}
                                  title={x.teacher_id}
                                  aria-label={`${x.class_name}, ${x.subject}${x.locked ? ", kilitli" : ""}`}
                                >
                                  {x.class_name} · {x.subject}
                                  {x.locked ? " 🔒" : ""}
                                </div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                role="status"
                aria-live="polite"
                className="mt-2 text-[10px] text-muted-foreground"
              >
                {filtered.length} ders · kilitli hücreler işaretli. Öğretmen kimliği yalnız
                filtre/teknik eşleştirme için gösterilir.
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
