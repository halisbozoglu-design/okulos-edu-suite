import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OkulOS — Okul Yönetim Sistemi Kaydı" },
      {
        name: "description",
        content:
          "OkulOS ile öğretmen kaydınızı tamamlayın, nöbet ve ek ders bildirimlerini anında alın.",
      },
      { property: "og:title", content: "OkulOS — Okul Yönetim Sistemi Kaydı" },
      {
        property: "og:description",
        content: "Mobil öncelikli eğitim ERP sistemi: kayıt, nöbet, ek ders ve vekalet yönetimi.",
      },
    ],
  }),
  component: AuthScreen,
});

function AuthScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">OkulOS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personel kaydınızı tamamlayarak sisteme katılın.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="tckn">T.C. Kimlik No (Son 4 Hane)</Label>
              <Input id="tckn" inputMode="numeric" maxLength={4} placeholder="1234" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" placeholder="ad.soyad@meb.k12.tr" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kan Grubu</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "AB", "0"].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rh Faktörü</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">Rh (+) Pozitif</SelectItem>
                    <SelectItem value="-">Rh (−) Negatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link to="/dashboard">Kaydı Tamamla & Bildirimleri Aç</Link>
            </Button>
          </form>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Bilgileriniz yalnızca acil durum ve nöbet organizasyonu için kullanılır.
          </p>
        </div>
      </div>
    </div>
  );
}