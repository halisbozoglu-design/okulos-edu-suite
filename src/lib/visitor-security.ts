import { isValidTckn } from "@/lib/auth-validation";

export type IdentityMethod = "camera_live" | "manual";
export type VisitorSource = "camera_live" | "manual" | "student_lookup" | "phone_lookup";
export type RestrictionDecision = "allow" | "deny" | "approval_required";

export type IdentityReading = {
  tckn: string;
  fullName: string;
  maskedTckn: string;
};

export function normalizeTurkishText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr-TR");
}

export function maskTckn(value: string | null | undefined) {
  if (!value || !/^\d{11}$/.test(value)) return "—";
  return `${value.slice(0, 2)}*******${value.slice(-2)}`;
}

export function normalizeIdentityName(value: string) {
  return normalizeTurkishText(value).replace(/[^A-ZÇĞİÖŞÜ' -]/gi, "").trim();
}

export function createIdentityReading(tckn: string, fullName: string): IdentityReading | null {
  const normalizedTckn = tckn.replace(/\D/g, "");
  const name = normalizeIdentityName(fullName);
  if (!isValidTckn(normalizedTckn) || name.length < 3) return null;
  return { tckn: normalizedTckn, fullName: name, maskedTckn: maskTckn(normalizedTckn) };
}

export function extractIdentityReading(ocrText: string) {
  const normalized = normalizeTurkishText(ocrText);
  const tcknMatch = normalized.replace(/\s/g, "").match(/\d{11}/)?.[0] ?? "";
  if (!isValidTckn(tcknMatch)) return null;
  const lines = normalized.split(/[\r\n]+/).map((line) => line.replace(/[^A-ZÇĞİÖŞÜ' -]/gi, "").trim()).filter((line) => line.length >= 3);
  const ignored = new Set(["TURKIYE CUMHURIYETI", "KIMLIK KARTI", "REPUBLIC OF TURKEY", "IDENTITY CARD"]);
  const fullName = lines.find((line) => !ignored.has(line) && !/^(AD|SOYAD|SURNAME|NAME)$/.test(line)) ?? "";
  return createIdentityReading(tcknMatch, fullName);
}

export function isStableIdentityReadings(readings: IdentityReading[]) {
  if (readings.length < 2) return false;
  const [previous, current] = readings.slice(-2);
  return Boolean(previous && current && previous.tckn === current.tckn && previous.fullName === current.fullName);
}

export function resolveRestriction(decisions: RestrictionDecision[]) {
  if (decisions.includes("deny")) return "deny" as const;
  if (decisions.includes("approval_required")) return "approval_required" as const;
  return "allow" as const;
}

export function canCompleteCheckIn(physicalIdSeen: boolean, identityVerified: boolean, fullName: string, locationId: string) {
  return physicalIdSeen && identityVerified && fullName.trim().length >= 3 && Boolean(locationId);
}

export function canExitVisit(status: string) {
  return status === "inside";
}

export function visitorStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_approval: "Onay bekliyor",
    inside: "İçeride",
    exited: "Çıkış yaptı",
    cancelled: "İptal",
    rejected: "Reddedildi",
  };
  return labels[status] ?? status;
}

export function identityMethodLabel(method: IdentityMethod) {
  return method === "camera_live" ? "Canlı kamera" : "Manuel doğrulama";
}
