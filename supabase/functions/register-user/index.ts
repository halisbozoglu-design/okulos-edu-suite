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

function isStrongPassword(password: string) {
  return password.length >= 10 &&
    /[a-zçğıöşü]/.test(password) &&
    /[A-ZÇĞİÖŞÜ]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(password);
}

function isAllowedRedirect(value: unknown) {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { tckn, email, phone, password, redirectTo } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = typeof phone === "string" ? phone.replace(/\D/g, "") : "";

    if (typeof tckn !== "string" || !isValidTckn(tckn)) {
      return Response.json({ ok: false, code: "INVALID_IDENTITY" }, { status: 400, headers: corsHeaders });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return Response.json({ ok: false, code: "INVALID_EMAIL" }, { status: 400, headers: corsHeaders });
    }
    if (!/^05\d{9}$/.test(normalizedPhone)) {
      return Response.json({ ok: false, code: "INVALID_PHONE" }, { status: 400, headers: corsHeaders });
    }
    if (typeof password !== "string" || !isStrongPassword(password)) {
      return Response.json({ ok: false, code: "WEAK_PASSWORD" }, { status: 400, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: pre, error: preError } = await admin
      .from("pre_registered_teachers")
      .select("id,email")
      .eq("tckn", tckn)
      .eq("active", true)
      .maybeSingle();
    if (preError) throw preError;
    if (!pre) return Response.json({ ok: false, code: "NOT_PRE_REGISTERED" }, { status: 403, headers: corsHeaders });
    if (pre.email && pre.email.trim().toLowerCase() !== normalizedEmail) {
      return Response.json({ ok: false, code: "EMAIL_MISMATCH" }, { status: 403, headers: corsHeaders });
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
    });
    if (createError || !created.user) {
      return Response.json({ ok: false, code: "REGISTRATION_FAILED" }, { status: 400, headers: corsHeaders });
    }

    await admin.from("pre_registered_teachers").update({ email: normalizedEmail }).eq("id", pre.id);

    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: otpError } = await anon.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
        ...(isAllowedRedirect(redirectTo) ? { emailRedirectTo: redirectTo } : {}),
      },
    });

    if (otpError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return Response.json({ ok: false, code: "OTP_SEND_FAILED" }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch {
    return Response.json({ ok: false, code: "SERVER_ERROR" }, { status: 500, headers: corsHeaders });
  }
});
