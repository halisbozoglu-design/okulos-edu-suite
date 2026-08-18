import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, UploadCloud, Users } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { schoolClasses } from "@/data/mock";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Sınıf ve Öğrenci Yönetimi — OkulOS" },
      {
        name: "description",
        content:
          "e-Okul sınıf listelerini PDF/Excel olarak içe aktarın, program türlerini ve mevcutları tek ekranda yönetin.",
      },
      { property: "og:title", content: "Sınıf ve Öğrenci Yönetimi — OkulOS" },
      {
        property: "og:description",
        content: "e-Okul içe aktarma, şube-program eşleşmeleri ve 25 üstü mevcut uyarıları.",
      },
    ],
  }),
  component: ClassManagement,
});

const LIMIT = 25;

function ClassManagement() {
  return (
    <AppShell title="Sınıf Yönetimi" subtitle="e-Okul içe aktarma">
      <div className="rounded-xl border-2 border-dashed border-border bg-card px-4 py-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <UploadCloud className="size-6" />
        </div>
        <p className="mt-3 text-sm font-medium">e-Okul sınıf listesi yükleyin</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF veya Excel · en fazla 10 MB</p>
        <Button className="mt-4">Dosya Seç</Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Toplam Şube</p>
          <p className="mt-1 text-lg font-semibold">{schoolClasses.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Toplam Öğrenci</p>
          <p className="mt-1 text-lg font-semibold">
            {schoolClasses.reduce((a, c) => a + c.students, 0)}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Sınıf</th>
              <th className="px-3 py-2 text-left font-medium">Program</th>
              <th className="px-3 py-2 text-left font-medium">Mevcut</th>
              <th className="px-3 py-2 text-right font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {schoolClasses.map((c) => {
              const over = c.students > LIMIT;
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-3 py-2 font-medium">
                    {c.name} - {c.program}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary">{c.program}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Users className="size-3.5 text-muted-foreground" />
                      {c.students}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {over ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                        <AlertTriangle className="size-3.5" />
                        Grup bölünmeli
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Uygun</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {LIMIT} öğrenciyi aşan şubeler grup bölme için işaretlenir.
      </p>
    </AppShell>
  );
}