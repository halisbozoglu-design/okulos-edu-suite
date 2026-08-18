import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { tckn } = await req.json();
    if (typeof tckn !== "string" || !/^\d{11}$/.test(tckn)) {
      return Response.json({ valid: false }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await supabase
      .from("pre_registered_teachers")
      .select("id")
      .eq("tckn", tckn)
      .eq("active", true)
      .maybeSingle();

    if (error) throw error;

    return Response.json({ valid: Boolean(data) }, { headers: corsHeaders });
  } catch {
    return Response.json({ valid: false }, { status: 500, headers: corsHeaders });
  }
});
