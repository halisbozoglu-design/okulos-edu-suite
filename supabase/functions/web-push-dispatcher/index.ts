import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

type Body = {
  userId: string;
  title: string;
  message: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers: corsHeaders });

    const body = await req.json() as Body;
    if (!body.userId || !body.title || !body.message) {
      return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), { status: 400, headers: corsHeaders });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublic = Deno.env.get("WEB_PUSH_VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("WEB_PUSH_VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("WEB_PUSH_VAPID_SUBJECT") || "mailto:admin@okulos.local";

    if (!vapidPublic || !vapidPrivate) {
      return new Response(JSON.stringify({ error: "WEB_PUSH_VAPID_NOT_CONFIGURED" }), { status: 503, headers: corsHeaders });
    }

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: caller, error: callerError } = await userClient.auth.getUser();
    if (callerError || !caller.user) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers: corsHeaders });

    const isSelf = body.userId === caller.user.id;
    if (!isSelf) {
      const { data: profile } = await userClient.from("profiles").select("role,is_super_admin").eq("user_id", caller.user.id).maybeSingle();
      if (!profile || (!profile.is_super_admin && !["admin","manager"].includes(profile.role))) {
        return new Response(JSON.stringify({ error: "NOT_AUTHORIZED" }), { status: 403, headers: corsHeaders });
      }
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: subscriptions, error: subError } = await admin
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth")
      .eq("user_id", body.userId)
      .eq("active", true);
    if (subError) throw subError;

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
    const payload = JSON.stringify({
      title: body.title,
      body: body.message,
      icon: "/icons/icon-192.svg",
      badge: "/icons/badge.svg",
      url: body.url || "/dashboard",
      tag: body.tag || "okulos",
      requireInteraction: Boolean(body.requireInteraction),
      timestamp: Date.now(),
    });

    let sent = 0;
    let removed = 0;
    for (const item of subscriptions ?? []) {
      try {
        await webpush.sendNotification({ endpoint: item.endpoint, keys: { p256dh: item.p256dh, auth: item.auth } }, payload, { TTL: 60 * 60 * 12, urgency: "high" });
        sent += 1;
      } catch (error) {
        const statusCode = Number((error as { statusCode?: number }).statusCode ?? 0);
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").update({ active: false, updated_at: new Date().toISOString() }).eq("id", item.id);
          removed += 1;
        } else console.error("Web push delivery failed", error);
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, removed }), { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "WEB_PUSH_FAILED" }), { status: 500, headers: corsHeaders });
  }
});
