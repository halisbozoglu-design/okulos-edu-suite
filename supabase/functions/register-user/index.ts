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

  let createdUserId: string | null = null;
  try {
    const { tckn, institutionCode, email, phone, password, redirectTo } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
    const suppliedCode = typeof institutionCode === "string" ? institutionCode.replace(/\D/g, "") : "";

    if (typeof tckn !== "string" || !isValidTckn(tckn)) {
      return Response.json({ ok: false, code: "INVALID_IDENTITY" }, { status: 400, headers: corsHeaders });
    }
    if (suppliedCode && !/^\d{5,10}$/.test(suppliedCode)) {
      return Response.json({ ok: false, code: "INVALID_INSTITUTION_CODE" }, { status: 400, headers: corsHeaders });
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

    let preQuery = admin
      .from("pre_registered_teachers")
      .select("id,email,full_name,role,institution_code")
      .eq("tckn", tckn)
      .eq("active", true);
    if (suppliedCode) preQuery = preQuery.eq("institution_code", suppliedCode);
    const { data: candidates, error: preError } = await preQuery.limit(2);
    if (preError) throw preError;
    if (!candidates?.length) return Response.json({ ok: false, code: "NOT_PRE_REGISTERED" }, { status: 403, headers: corsHeaders });
    if (!suppliedCode && candidates.length > 1) {
      return Response.json({ ok: false, code: "INSTITUTION_CODE_REQUIRED" }, { status: 409, headers: corsHeaders });
    }

    const pre = candidates[0];
    const code = pre.institution_code ?? suppliedCode;
    if (!code) return Response.json({ ok: false, code: "INSTITUTION_CODE_REQUIRED" }, { status: 409, headers: corsHeaders });

    const { data: institution, error: institutionError } = await admin
      .from("institutions")
      .select("institution_code,status,approval_status")
      .eq("institution_code", code)
      .maybeSingle();
    if (institutionError) throw institutionError;
    if (!institution || institution.status !== "active") {
      return Response.json({ ok: false, code: "INSTITUTION_NOT_FOUND" }, { status: 404, headers: corsHeaders });
    }
    if (institution.approval_status !== "approved") {
      return Response.json({ ok: false, code: "INSTITUTION_NOT_APPROVED" }, { status: 403, headers: corsHeaders });
    }
    if (pre.email && pre.email.trim().toLowerCase() !== normalizedEmail) {
      return Response.json({ ok: false, code: "EMAIL_MISMATCH" }, { status: 403, headers: corsHeaders });
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: { institution_code: code, school_personnel_registration: true },
    });
    if (createError || !created.user) {
      return Response.json({ ok: false, code: "REGISTRATION_FAILED" }, { status: 400, headers: corsHeaders });
    }
    createdUserId = created.user.id;

    const membershipRole = pre.role === "admin" ? "principal" : pre.role === "manager" ? "vice_principal" : "teacher";
    const { error: profileError } = await admin.from("profiles").upsert({
      user_id: created.user.id,
      tckn,
      email: normalizedEmail,
      full_name: pre.full_name,
      role: pre.role,
      phone: normalizedPhone,
      institution_code: code,
    }, { onConflict: "user_id" });
    if (profileError) throw profileError;

    const { error: membershipError } = await admin.from("institution_memberships").upsert({
      institution_code: code,
      user_id: created.user.id,
      membership_role: membershipRole,
      is_owner: false,
      active: true,
    }, { onConflict: "institution_code,user_id" });
    if (membershipError) throw membershipError;

    await admin.from("pre_registered_teachers").update({ email: normalizedEmail }).eq("id", pre.id).eq("institution_code", code);

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

    if (otpError) throw otpError;
    return Response.json({ ok: true, institutionCode: code }, { headers: corsHeaders });
  } catch (error) {
    console.error("register-user", error);
    if (createdUserId) {
      try {
        const admin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        await admin.auth.admin.deleteUser(createdUserId);
      } catch (cleanupError) {
        console.error("register-user cleanup", cleanupError);
      }
    }
    return Response.json({ ok: false, code: "SERVER_ERROR" }, { status: 500, headers: corsHeaders });
  }
});
