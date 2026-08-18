import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, CalendarClock, LayoutGrid, Table2, Users, Settings, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { isProfileIncomplete, maskNationalId } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const nav = [
  { to: "/dashboard", label: "Panel", icon: LayoutGrid },
  { to: "/substitutes", label: "Vekalet", icon: Users },
  { to: "/payroll", label: "Ek Ders", icon: Table2 },
  { to: "/classes", label: "Sınıflar", icon: CalendarClock },
  { to: "/settings", label: "Ayarlar", icon: Settings },
] as const;

type Profile = {
  user_id: string;
  tckn: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "manager" | "teacher";
  blood_type: string | null;
  phone: string | null;
  emergency_contact: string | null;
};

export function AppShell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("user_id,tckn,email,full_name,role,blood_type,phone,emergency_contact")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (!active || !data) return;
      const next = data as Profile;
      setProfile(next);
      setBloodType(next.blood_type ?? "");
      setPhone(next.phone ?? "");
      setEmergencyContact(next.emergency_contact ?? "");
    })();
    return () => {
      active = false;
    };
  }, []);

  const incomplete = isProfileIncomplete(profile);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        blood_type: bloodType || null,
        phone: phone || null,
        emergency_contact: emergencyContact || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.user_id);
    setSaving(false);
    if (error) return;
    setProfile({ ...profile, blood_type: bloodType || null, phone: phone || null, emergency_contact: emergencyContact || null });
    setProfileOpen(false);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight">{title}</p>
            {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            <button
              type="button"
              aria-label="Profil bilgilerini düzenle"
              onClick={() => setProfileOpen(true)}
              className="relative grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            >
              <UserRound className="size-5" />
              {incomplete ? (
                <span className="absolute -right-1 -top-1 grid size-5 animate-pulse place-items-center rounded-full bg-red-600 text-[11px] font-bold leading-none text-white ring-2 ring-card">!</span>
              ) : null}
            </button>
            <button type="button" aria-label="Bildirimler" className="relative grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <ul className="mx-auto grid max-w-5xl grid-cols-5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link to={item.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil Bilgileri</DialogTitle>
            <DialogDescription>Eksik temel bilgilerinizi hızlıca tamamlayın.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">T.C. Kimlik No</p>
              <p className="font-medium tabular-nums">{maskNationalId(profile?.tckn, profile?.role)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood-type">Kan Grubu</Label>
              <select
                id="blood-type"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Seçiniz</option>
                {["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-"].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Telefon</Label>
              <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-contact">Acil Durum İletişim</Label>
              <Input id="emergency-contact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
            </div>

            <Button className="w-full" onClick={saveProfile} disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
