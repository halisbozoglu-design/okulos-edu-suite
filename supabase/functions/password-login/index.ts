import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidTckn(value: string) {
  if (!/^\d{11}$/.test(value) || value[0] === "0") return false;
  const d = value.split("").map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const tenth = ((odd * 7 - even) % 10 + 10) % 10;
  const eleventh = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10;
  return d[9] === tenth && d[10] === eleventh;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { identifier, password } = await req.json();
    if (typeof identifier !== "string" || typeof password !== "string" || !identifier.trim() || !password) {
      return Response.json({ ok: false }, { status: 400, headers: corsHeaders });
    }

    const normalized = identifier.trim().toLowerCase();
    let email = normalized;

    if (!normalized.includes("@")) {
      if (!isValidTckn(normalized)) {
        return Response.json({ ok: false }, { status: 401, headers: corsHeaders });
      }

      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      const { data, error } = await admin
        .from("profiles")
        .select("email")
        .eq("tckn", normalized)
        .not("email", "is", null)
        .maybeSingle();
      if (error || !data?.email) {
        return Response.json({ ok: false }, { status: 401, headers: corsHeaders });
      }
      email = data.email.trim().toLowerCase();
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return Response.json({ ok: false }, { status: 401, headers: corsHeaders });
    }

    return Response.json({
      ok: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    }, { headers: corsHeaders });
  } catch {
    return Response.json({ ok: false }, { status: 500, headers: corsHeaders });
  }
});
