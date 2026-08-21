import { supabase } from "@/lib/supabase";

export type LoginThemeKey = "default" | "aurora" | "orbit" | "waves";

export type LoginTheme = {
  key: LoginThemeKey;
  label: string;
  description: string;
  accentClass: string;
  panelClass: string;
  animation: "none" | "aurora" | "orbit" | "waves";
};

export type LoginThemeSchedule = {
  id: string;
  theme: LoginThemeKey;
  tenantCode: string | "*";
  startsAt: string;
  endsAt: string;
  priority: number;
  enabled: boolean;
  note?: string;
};

export const LOGIN_THEME_CATALOG: LoginTheme[] = [
  { key: "default", label: "OkulOS Standart", description: "Sade kurumsal görünüm.", accentClass: "from-indigo-500 via-indigo-600 to-violet-700", panelClass: "bg-gradient-to-br from-slate-50 via-background to-indigo-50", animation: "none" },
  { key: "aurora", label: "Aurora", description: "Yumuşak hareketli ışık katmanları.", accentClass: "from-cyan-500 via-indigo-600 to-violet-700", panelClass: "bg-gradient-to-br from-cyan-50 via-background to-violet-50", animation: "aurora" },
  { key: "orbit", label: "Orbit", description: "Dönen, hafif halka animasyonu.", accentClass: "from-sky-500 via-blue-600 to-indigo-800", panelClass: "bg-gradient-to-br from-blue-50 via-background to-slate-100", animation: "orbit" },
  { key: "waves", label: "Dalgalar", description: "Yavaş kayan katmanlı dalga efekti.", accentClass: "from-violet-500 via-fuchsia-600 to-indigo-700", panelClass: "bg-gradient-to-br from-violet-50 via-background to-fuchsia-50", animation: "waves" },
];

const CACHE_KEY = "okulos.loginThemeSchedule.v2";
const TENANT_KEY = "okulos.lastTenantCode";

export function getLoginTheme(key: LoginThemeKey): LoginTheme {
  return LOGIN_THEME_CATALOG.find((x) => x.key === key) ?? LOGIN_THEME_CATALOG[0];
}

export function rememberTenantCode(code: string | null | undefined) {
  if (typeof window === "undefined" || !code) return;
  window.localStorage.setItem(TENANT_KEY, code);
}

export function resolveLoginTenantCode(): string | null {
  if (typeof window === "undefined") return null;
  const query = new URL(window.location.href).searchParams.get("tenant")?.trim();
  if (query) return query;
  return window.localStorage.getItem(TENANT_KEY);
}

export function readCachedLoginThemeSchedules(): LoginThemeSchedule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LoginThemeSchedule[];
    return Array.isArray(parsed) ? parsed.filter(isValidSchedule) : [];
  } catch {
    return [];
  }
}

function cacheSchedules(items: LoginThemeSchedule[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(items));
}

export async function fetchPublicLoginThemeSchedules(tenantCode = resolveLoginTenantCode()): Promise<LoginThemeSchedule[]> {
  const { data, error } = await supabase.functions.invoke("password-login", {
    body: { action: "get-login-theme-config", tenantCode: tenantCode ?? null },
  });
  if (!error && data?.ok && Array.isArray(data.schedules)) {
    const schedules = (data.schedules as LoginThemeSchedule[]).filter(isValidSchedule);
    cacheSchedules(schedules);
    return schedules;
  }
  return readCachedLoginThemeSchedules();
}

export async function fetchAdminLoginThemeSchedules(): Promise<LoginThemeSchedule[]> {
  const { data, error } = await supabase.functions.invoke("password-login", {
    body: { action: "get-login-theme-admin" },
  });
  if (error || !data?.ok || !Array.isArray(data.schedules)) throw new Error("Giriş teması ayarları okunamadı.");
  const schedules = (data.schedules as LoginThemeSchedule[]).filter(isValidSchedule);
  cacheSchedules(schedules);
  return schedules;
}

export async function saveAdminLoginThemeSchedules(items: LoginThemeSchedule[]): Promise<void> {
  const schedules = items.filter(isValidSchedule).slice(0, 200);
  const { data, error } = await supabase.functions.invoke("password-login", {
    body: { action: "set-login-theme-config", schedules },
  });
  if (error || !data?.ok) throw new Error("Giriş teması ayarları kaydedilemedi.");
  cacheSchedules(schedules);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("okulos-login-theme-change"));
}

export function resolveActiveLoginTheme(now = new Date(), tenantCode = resolveLoginTenantCode(), schedules = readCachedLoginThemeSchedules()): LoginTheme {
  const ts = now.getTime();
  const applicable = schedules
    .filter((x) => x.enabled)
    .filter((x) => x.tenantCode === "*" || (tenantCode && x.tenantCode === tenantCode))
    .filter((x) => {
      const start = Date.parse(x.startsAt);
      const end = Date.parse(x.endsAt);
      return Number.isFinite(start) && Number.isFinite(end) && start <= ts && ts <= end;
    })
    .sort((a, b) => {
      const tenantScoreA = a.tenantCode === tenantCode ? 1 : 0;
      const tenantScoreB = b.tenantCode === tenantCode ? 1 : 0;
      if (tenantScoreA !== tenantScoreB) return tenantScoreB - tenantScoreA;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return Date.parse(b.startsAt) - Date.parse(a.startsAt);
    });
  return getLoginTheme(applicable[0]?.theme ?? "default");
}

export function parseLoginThemeCommand(command: string): Omit<LoginThemeSchedule, "id"> | null {
  // örnek: tema aurora | tenant * | 2026-10-29 00:00 | 2026-10-29 23:59 | 100
  const parts = command.split("|").map((x) => x.trim()).filter(Boolean);
  if (parts.length < 4) return null;
  const themeMatch = parts[0].match(/^tema\s+(default|aurora|orbit|waves)$/i);
  const tenantMatch = parts[1].match(/^tenant\s+(.+)$/i);
  if (!themeMatch || !tenantMatch) return null;
  const startsAt = normalizeDateTime(parts[2]);
  const endsAt = normalizeDateTime(parts[3]);
  const priority = parts[4] ? Number(parts[4]) : 100;
  if (!startsAt || !endsAt || !Number.isFinite(priority) || Date.parse(startsAt) > Date.parse(endsAt)) return null;
  return {
    theme: themeMatch[1].toLowerCase() as LoginThemeKey,
    tenantCode: tenantMatch[1] === "*" ? "*" : tenantMatch[1],
    startsAt,
    endsAt,
    priority,
    enabled: true,
  };
}

export function toLocalDateTimeInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromLocalDateTimeInput(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeDateTime(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function isValidSchedule(x: LoginThemeSchedule) {
  return Boolean(
    x &&
    typeof x.id === "string" &&
    LOGIN_THEME_CATALOG.some((t) => t.key === x.theme) &&
    typeof x.tenantCode === "string" &&
    typeof x.startsAt === "string" &&
    typeof x.endsAt === "string" &&
    Number.isFinite(Date.parse(x.startsAt)) &&
    Number.isFinite(Date.parse(x.endsAt)) &&
    typeof x.priority === "number" &&
    Number.isFinite(x.priority) &&
    typeof x.enabled === "boolean"
  );
}
