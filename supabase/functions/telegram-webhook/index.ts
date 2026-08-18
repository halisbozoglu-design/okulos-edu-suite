import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendTelegram(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);

  const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (webhookSecret) {
    const supplied = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (supplied !== webhookSecret) return json({ ok: false }, 401);
  }

  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!botToken || !url || !serviceKey) return json({ ok: false }, 500);

  try {
    const update = await req.json();
    const message = update?.message;
    if (!message?.text || message?.chat?.type !== "private") return json({ ok: true });

    const match = String(message.text).trim().match(/^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{1,64})$/);
    if (!match) return json({ ok: true });

    const rawToken = match[1];
    const tokenHash = await sha256Hex(rawToken);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: link, error: linkError } = await admin
      .from("telegram_link_tokens")
      .select("id,user_id,expires_at,used_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (linkError || !link || link.used_at || new Date(link.expires_at).getTime() < Date.now()) {
      await sendTelegram(botToken, message.chat.id, "OkulOS bağlantı kodu geçersiz veya süresi dolmuş. Uygulamadaki profilinizden yeniden deneyin.");
      return json({ ok: true });
    }

    const { error: integrationError } = await admin
      .from("telegram_integrations")
      .upsert({
        user_id: link.user_id,
        telegram_chat_id: message.chat.id,
        enabled: true,
        linked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    if (integrationError) throw integrationError;

    await admin
      .from("telegram_link_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", link.id);

    await sendTelegram(botToken, message.chat.id, "OkulOS Telegram bildirimleri başarıyla aktifleştirildi. Bundan sonra görev ve kriz bildirimleri bu bot üzerinden iletilebilir.");
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ ok: true });
  }
});
