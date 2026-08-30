import { Label } from "@/components/ui/label";
import { type ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><Label>{label}</Label><div className="mt-1">{children}</div></div>;
}
