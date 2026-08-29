import { STORAGE_KEY, type MuhakkikCase } from "./types";

export function loadCases(): MuhakkikCase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MuhakkikCase[];
    return Array.isArray(parsed) ? parsed : [];
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
  const stamped = { ...next, updatedAt: new Date().toISOString() };
  if (i < 0) return [stamped, ...cases];
  const copy = cases.slice();
  copy[i] = stamped;
  return copy;
}
