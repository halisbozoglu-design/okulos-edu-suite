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
    const { tckn, institutionCode, email } = await req.json();
    if (typeof tckn !== "string" || !isValidTckn(tckn)) {
      return Response.json({ valid: false, reason: "INVALID_TCKN" }, { status: 400, headers: corsHeaders });
    }

    const suppliedCode = typeof institutionCode === "string" ? institutionCode.replace(/\D/g, "") : "";
    if (suppliedCode && !/^\d{5,10}$/.test(suppliedCode)) {
      return Response.json({ valid: false, reason: "INVALID_INSTITUTION_CODE" }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    let query = supabase
      .from("pre_registered_teachers")
      .select("id,email,institution_code")
      .eq("tckn", tckn)
      .eq("active", true);
    if (suppliedCode) query = query.eq("institution_code", suppliedCode);
    const { data: candidates, error } = await query.limit(2);
    if (error) throw error;
    if (!candidates?.length) return Response.json({ valid: false, reason: "NOT_FOUND" }, { headers: corsHeaders });
    if (!suppliedCode && candidates.length > 1) {
      return Response.json({ valid: false, reason: "INSTITUTION_CODE_REQUIRED" }, { headers: corsHeaders });
    }

    const data = candidates[0];
    const code = data.institution_code ?? suppliedCode;
    if (!code) return Response.json({ valid: false, reason: "INSTITUTION_CODE_REQUIRED" }, { headers: corsHeaders });

    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .select("institution_code,approval_status,status")
      .eq("institution_code", code)
      .maybeSingle();
    if (institutionError) throw institutionError;
    if (!institution || institution.status !== "active") {
      return Response.json({ valid: false, reason: "INSTITUTION_NOT_FOUND" }, { headers: corsHeaders });
    }
    if (institution.approval_status !== "approved") {
      return Response.json({ valid: false, reason: "INSTITUTION_NOT_APPROVED" }, { headers: corsHeaders });
    }

    if (typeof email === "string" && email.trim() && data.email) {
      const expected = data.email.trim().toLowerCase();
      const supplied = email.trim().toLowerCase();
      if (expected !== supplied) {
        return Response.json({ valid: false, reason: "EMAIL_MISMATCH" }, { headers: corsHeaders });
      }
    }

    return Response.json({ valid: true, emailLocked: Boolean(data.email), institutionCode: code }, { headers: corsHeaders });
  } catch {
    return Response.json({ valid: false, reason: "SERVER_ERROR" }, { status: 500, headers: corsHeaders });
  }
});
