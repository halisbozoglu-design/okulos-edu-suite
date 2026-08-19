const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST" && req.method !== "GET") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers: corsHeaders });
  const publicKey = Deno.env.get("WEB_PUSH_VAPID_PUBLIC_KEY");
  if (!publicKey) return new Response(JSON.stringify({ error: "WEB_PUSH_NOT_CONFIGURED" }), { status: 503, headers: corsHeaders });
  return new Response(JSON.stringify({ publicKey }), { headers: corsHeaders });
});
