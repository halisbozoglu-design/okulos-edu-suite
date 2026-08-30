import type { LucideIcon } from "lucide-react";

export function StatWidget({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm shadow-slate-950/[0.02] transition-shadow hover:shadow-md hover:shadow-primary/5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0 text-primary" />
        <span className="truncate text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
