export type AppRole = "admin" | "manager" | "teacher";

export function maskNationalId(tckn: string | null | undefined, role: AppRole | string | null | undefined) {
  if (!tckn) return "—";
  if (role === "admin") return tckn;
  if (!/^\d{11}$/.test(tckn)) return "***********";
  return `${tckn.slice(0, 2)}*******${tckn.slice(-2)}`;
}

export function isProfileIncomplete(profile: { blood_type?: string | null } | null | undefined) {
  return !profile?.blood_type;
}
