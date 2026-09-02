import { Link } from "@tanstack/react-router";
import { BadgeCheck, BookOpenCheck, DoorOpen, MapPin, ShieldCheck } from "lucide-react";

const items = [
  { to: "/security/visitors/check-in", label: "Hızlı giriş", icon: DoorOpen },
  { to: "/security/visitors/inside", label: "İçeride", icon: BadgeCheck },
  { to: "/security/visitors/ledger", label: "Ziyaretçi defteri", icon: BookOpenCheck },
  { to: "/security/locations", label: "Noktalar", icon: MapPin },
  { to: "/security/student-duty", label: "Öğrenci nöbeti", icon: ShieldCheck },
] as const;

export function SecuritySectionNav({ active }: { active: string }) {
  return <nav aria-label="Güvenlik ve ziyaretçi" className="mb-5 overflow-x-auto rounded-xl border bg-card p-1">
    <div className="flex min-w-max gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.to;
        return <Link key={item.to} to={item.to} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
          <Icon className="size-4" />{item.label}
        </Link>;
      })}
    </div>
  </nav>;
}
