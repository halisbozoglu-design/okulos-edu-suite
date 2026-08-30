import { STORAGE_KEY, clampStep, type MuhakkikCase } from "./types";

export function loadCases(): MuhakkikCase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MuhakkikCase[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => ({ ...c, currentStep: clampStep(c.currentStep), actorRole: c.actorRole || "muhakkik" }));
  } catch {
    return [];
  }
}

export function saveCases(cases: MuhakkikCase[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function upsertCase(cases: MuhakkikCase[], next: MuhakkikCase): MuhakkikCase[] {
  const i = cases.findIndex((c) => c.id === next.id);
  const stamped = { ...next, updatedAt: new Date().toISOString(), currentStep: clampStep(next.currentStep) };
  if (i < 0) return [stamped, ...cases];
  const copy = cases.slice();
  copy[i] = stamped;
  return copy;
}
