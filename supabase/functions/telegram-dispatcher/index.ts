import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405, headers: corsHeaders });

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers: corsHeaders });
  }

  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const url = Deno.env.get("SUPABASE_URL");
  if (!botToken || !url) {
    return Response.json({ error: "TELEGRAM_NOT_CONFIGURED" }, { status: 503, headers: corsHeaders });
  }

  try {
    const { userId, title, message } = await req.json();
    if (typeof userId !== "string" || typeof title !== "string" || typeof message !== "string") {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400, headers: corsHeaders });
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: integration, error } = await admin
      .from("telegram_integrations")
      .select("telegram_chat_id,enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!integration?.enabled || !integration.telegram_chat_id) {
      return Response.json({ ok: true, sent: false, reason: "NOT_LINKED" }, { headers: corsHeaders });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: integration.telegram_chat_id,
        text: `🔔 ${title}\n\n${message}\n\n— OkulOS Bildirim Botu`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Telegram sendMessage failed", detail);
      return Response.json({ error: "TELEGRAM_SEND_FAILED" }, { status: 502, headers: corsHeaders });
    }

    return Response.json({ ok: true, sent: true }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "DISPATCH_FAILED" }, { status: 500, headers: corsHeaders });
  }
});
