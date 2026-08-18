import { Fragment, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, FileSpreadsheet } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { payrollRows } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payroll")({
  head: () => ({
    meta: [
      { title: "Ek Ders Puantaj Tablosu — OkulOS" },
      {
        name: "description",
        content:
          "Aylık ek ders saatlerini gün gün takip edin, gündüz/nöbet/rehberlik kırılımını görün ve KBS için dışa aktarın.",
      },
      { property: "og:title", content: "Ek Ders Puantaj Tablosu — OkulOS" },
      {
        property: "og:description",
        content: "1-31 gün kırılımıyla ek ders puantajı ve KBS Excel çıktısı.",
      },
    ],
  }),
  component: PayrollGrid,
});

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const subRows = [
  { key: "gunduz", label: "Gündüz" },
  { key: "nobet", label: "Nöbet" },
  { key: "rehberlik", label: "Rehberlik" },
] as const;

function PayrollGrid() {
  const [open, setOpen] = useState<number[]>([1]);
  const toggle = (id: number) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <AppShell title="Ek Ders Puantajı" subtitle="Ağustos 2026">
      <Button className="w-full gap-2 sm:w-auto">
        <FileSpreadsheet className="size-4" />
        Excel'e Aktar (KBS)
      </Button>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-max border-collapse text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 w-10 bg-muted/95 px-2 py-2 text-left font-medium">
                #
              </th>
              <th className="sticky left-10 z-10 min-w-[150px] bg-muted/95 px-3 py-2 text-left font-medium">
                Öğretmen
              </th>
              <th className="sticky left-[190px] z-10 min-w-[130px] border-r border-border bg-muted/95 px-3 py-2 text-left font-medium">
                Görev
              </th>
              {days.map((d) => (
                <th key={d} className="w-9 px-2 py-2 text-center font-medium">
                  {d}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-medium">Top.</th>
            </tr>
          </thead>
          <tbody>
            {payrollRows.map((row, idx) => {
              const expanded = open.includes(row.id);
              const totals = days.map(
                (_, i) =>
                  (row.daily.gunduz[i] ?? 0) +
                  (row.daily.nobet[i] ?? 0) +
                  (row.daily.rehberlik[i] ?? 0),
              );
              return (
                <Fragment key={row.id}>
                  <tr className="border-t border-border">
                    <td className="sticky left-0 z-10 bg-card px-2 py-2 text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="sticky left-10 z-10 bg-card px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggle(row.id)}
                        className="flex items-center gap-1.5 font-medium"
                      >
                        {expanded ? (
                          <ChevronDown className="size-4 text-primary" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                        <span className="truncate">{row.name}</span>
                      </button>
                    </td>
                    <td className="sticky left-[190px] z-10 border-r border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                      {row.role}
                    </td>
                    {totals.map((v, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-2 py-2 text-center tabular-nums",
                          v === 0 && "text-muted-foreground/40",
                        )}
                      >
                        {v}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold tabular-nums">
                      {totals.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                  {expanded &&
                    subRows.map((sub) => (
                      <tr key={`${row.id}-${sub.key}`} className="border-t border-border bg-muted/30">
                        <td className="sticky left-0 z-10 bg-muted/60 px-2 py-1.5" />
                        <td className="sticky left-10 z-10 bg-muted/60 px-3 py-1.5 pl-9 text-xs text-muted-foreground">
                          {sub.label}
                        </td>
                        <td className="sticky left-[190px] z-10 border-r border-border bg-muted/60 px-3 py-1.5" />
                        {row.daily[sub.key].map((v, i) => (
                          <td
                            key={i}
                            className={cn(
                              "px-2 py-1.5 text-center text-xs tabular-nums",
                              v === 0 ? "text-muted-foreground/40" : "text-foreground",
                            )}
                          >
                            {v}
                          </td>
                        ))}
                        <td className="px-3 py-1.5 text-center text-xs font-medium tabular-nums">
                          {row.daily[sub.key].reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Satırı genişletmek için öğretmen adına dokunun. Tablo yatay olarak kaydırılabilir.
      </p>
    </AppShell>
  );
}