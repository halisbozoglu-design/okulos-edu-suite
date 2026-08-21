import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGIN_THEME_CONFIG_KEY = "__login_theme_config";
const LOGIN_THEME_KEYS = new Set(["default", "aurora", "orbit", "waves"]);

type LoginThemeSchedule = {
  id: string;
  theme: string;
  tenantCode: string;
  startsAt: string;
  endsAt: string;
  priority: number;
  enabled: boolean;
  note?: string;
};

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function anonClient(authHeader?: string | null) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      ...(authHeader ? { global: { headers: { Authorization: authHeader } } } : {}),
    },
  );
}

function json(payload: unknown, status = 200) {
  return Response.json(payload, { status, headers: corsHeaders });
}

function isValidTckn(value: string) {
  if (!/^\d{11}$/.test(value) || value[0] === "0") return false;
  const d = value.split("").map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const tenth = ((odd * 7 - even) % 10 + 10) % 10;
  const eleventh = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10;
  return d[9] === tenth && d[10] === eleventh;
}

function normalizeSchedules(value: unknown): LoginThemeSchedule[] | null {
  if (!Array.isArray(value) || value.length > 200) return null;
  const result: LoginThemeSchedule[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const x = raw as Record<string, unknown>;
    const id = typeof x.id === "string" ? x.id.trim() : "";
    const theme = typeof x.theme === "string" ? x.theme.trim().toLowerCase() : "";
    const tenantCode = typeof x.tenantCode === "string" ? x.tenantCode.trim() : "";
    const startsAt = typeof x.startsAt === "string" ? x.startsAt : "";
    const endsAt = typeof x.endsAt === "string" ? x.endsAt : "";
    const priority = Number(x.priority);
    const enabled = x.enabled === true;
    const note = typeof x.note === "string" ? x.note.trim().slice(0, 240) : undefined;
    if (!id || id.length > 100 || !LOGIN_THEME_KEYS.has(theme) || !tenantCode || tenantCode.length > 64) return null;
    if (!Number.isFinite(Date.parse(startsAt)) || !Number.isFinite(Date.parse(endsAt)) || Date.parse(startsAt) > Date.parse(endsAt)) return null;
    if (!Number.isFinite(priority) || priority < -10000 || priority > 10000) return null;
    result.push({ id, theme, tenantCode, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), priority, enabled, ...(note ? { note } : {}) });
  }
  return result;
}

async function readThemeSchedules() {
  const admin = adminClient();
  const { data, error } = await admin
    .from("system_feature_catalog")
    .select("maintenance_message")
    .eq("feature_key", LOGIN_THEME_CONFIG_KEY)
    .maybeSingle();
  if (error || !data?.maintenance_message) return [] as LoginThemeSchedule[];
  try {
    const parsed = JSON.parse(data.maintenance_message) as { version?: number; schedules?: unknown };
    return normalizeSchedules(parsed?.schedules) ?? [];
  } catch {
    return [] as LoginThemeSchedule[];
  }
}

async function requireSuperAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) return null;
  const client = anonClient(authHeader);
  const token = authHeader.slice(7).trim();
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) return null;
  const { data: isSuper, error: roleError } = await client.rpc("is_super_admin");
  if (roleError || !isSuper) return null;
  return userData.user;
}

async function handleThemeAction(req: Request, body: Record<string, unknown>) {
  const action = body.action;

  if (action === "get-login-theme-config") {
    const tenantCode = typeof body.tenantCode === "string" ? body.tenantCode.trim() : "";
    const schedules = await readThemeSchedules();
    const visible = schedules.filter((x) => x.tenantCode === "*" || (tenantCode && x.tenantCode === tenantCode));
    return json({ ok: true, schedules: visible, server_time: new Date().toISOString() });
  }

  if (action === "get-login-theme-admin") {
    const user = await requireSuperAdmin(req);
    if (!user) return json({ ok: false }, 403);
    return json({ ok: true, schedules: await readThemeSchedules(), server_time: new Date().toISOString() });
  }

  if (action === "set-login-theme-config") {
    const user = await requireSuperAdmin(req);
    if (!user) return json({ ok: false }, 403);
    const schedules = normalizeSchedules(body.schedules);
    if (!schedules) return json({ ok: false, code: "INVALID_THEME_CONFIG" }, 400);

    const admin = adminClient();
    const { data: institutions, error: institutionError } = await admin.from("institutions").select("institution_code");
    if (institutionError) return json({ ok: false }, 500);
    const validTenantCodes = new Set((institutions ?? []).map((x: { institution_code: string }) => x.institution_code));
    const unknown = schedules.find((x) => x.tenantCode !== "*" && !validTenantCodes.has(x.tenantCode));
    if (unknown) return json({ ok: false, code: "UNKNOWN_TENANT", tenantCode: unknown.tenantCode }, 400);

    const payload = JSON.stringify({ version: 1, schedules });
    const { error } = await admin.from("system_feature_catalog").upsert({
      feature_key: LOGIN_THEME_CONFIG_KEY,
      parent_key: null,
      label: "Giriş Teması Yapılandırması",
      route_prefix: null,
      enabled: false,
      maintenance: false,
      maintenance_message: payload,
      sort_order: 99999,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "feature_key" });
    if (error) return json({ ok: false }, 500);
    return json({ ok: true, count: schedules.length });
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json() as Record<string, unknown>;
    if (typeof body.action === "string") {
      const themeResponse = await handleThemeAction(req, body);
      if (themeResponse) return themeResponse;
    }

    const identifier = body.identifier;
    const password = body.password;
    if (typeof identifier !== "string" || typeof password !== "string" || !identifier.trim() || !password) {
      return json({ ok: false }, 400);
    }

    const normalized = identifier.trim().toLowerCase();
    let email = normalized;

    if (!normalized.includes("@")) {
      if (!isValidTckn(normalized)) return json({ ok: false }, 401);
      const admin = adminClient();
      const { data, error } = await admin
        .from("profiles")
        .select("email")
        .eq("tckn", normalized)
        .not("email", "is", null)
        .maybeSingle();
      if (error || !data?.email) return json({ ok: false }, 401);
      email = data.email.trim().toLowerCase();
    }

    const authClient = anonClient();
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error || !data.session) return json({ ok: false }, 401);

    return json({
      ok: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch {
    return json({ ok: false }, 500);
  }
});
