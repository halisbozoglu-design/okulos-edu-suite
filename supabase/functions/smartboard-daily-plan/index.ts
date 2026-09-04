import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-smartboard-device-key, x-smartboard-secret, x-institution-code",
};

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const institutionCode = req.headers.get("x-institution-code")?.trim();
  const deviceKey = req.headers.get("x-smartboard-device-key")?.trim();
  const secret = req.headers.get("x-smartboard-secret") ?? "";
  if (!institutionCode || !deviceKey || secret.length < 24) {
    return Response.json({ error: "DEVICE_AUTH_REQUIRED" }, { status: 401, headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !service) return Response.json({ error: "SERVER_CONFIG" }, { status: 500, headers: corsHeaders });

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const credentialHash = await sha256Hex(secret);
  const { data: device, error: deviceError } = await admin
    .from("smartboard_integration_devices")
    .select("id,institution_code,smartboard_device_key,credential_sha256,enabled,expires_at")
    .eq("institution_code", institutionCode)
    .eq("smartboard_device_key", deviceKey)
    .maybeSingle();

  if (deviceError || !device || !device.enabled || device.credential_sha256 !== credentialHash) {
    return Response.json({ error: "DEVICE_AUTH_FAILED" }, { status: 401, headers: corsHeaders });
  }
  if (device.expires_at && new Date(device.expires_at).getTime() <= Date.now()) {
    return Response.json({ error: "DEVICE_CREDENTIAL_EXPIRED" }, { status: 401, headers: corsHeaders });
  }

  const requested = new URL(req.url).searchParams.get("date");
  const todayTr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const day = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : todayTr;

  const { data: plan, error: planError } = await admin.rpc("smartboard_daily_plan", {
    p_institution_code: institutionCode,
    p_device_key: deviceKey,
    p_day: day,
  });
  if (planError) {
    console.error("smartboard_daily_plan", planError.message);
    return Response.json({ error: "PLAN_RESOLUTION_FAILED" }, { status: 500, headers: corsHeaders });
  }

  await admin
    .from("smartboard_integration_devices")
    .update({ last_seen_at: new Date().toISOString(), last_plan_date: day, updated_at: new Date().toISOString() })
    .eq("id", device.id);

  return Response.json(
    { ok: true, plan },
    {
      headers: {
        ...corsHeaders,
        "Cache-Control": "private, max-age=30",
        "X-SmartBoard-Plan-Date": day,
      },
    },
  );
});
