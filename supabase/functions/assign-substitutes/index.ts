import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64Url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToBytes(pem: string) {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const binary = atob(body);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getFirebaseAccessToken(serviceAccount: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const assertion = `${unsigned}.${base64Url(new Uint8Array(signature))}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`FCM OAuth failed: ${await response.text()}`);
  const json = await response.json();
  return json.access_token as string;
}

async function sendFcm(
  accessToken: string,
  projectId: string,
  token: string,
  assignment: { period: number; class_name: string; subject: string },
) {
  const body = `Bugün ${assignment.period}. ders ${assignment.class_name} sınıfına vekalet edeceksiniz. Dersi yürütün ve işlenen konuyu sınıf defterine kaydedin.`;
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: "OkulOS · Vekalet Görevi", body },
        data: {
          type: "substitute_assignment",
          period: String(assignment.period),
          className: assignment.class_name,
          subject: assignment.subject,
        },
        webpush: { fcm_options: { link: "/substitutes" } },
      },
    }),
  });
  return response.ok;
}

async function dispatchTelegram(
  url: string,
  serviceKey: string,
  assignment: { substitute_user_id: string; period: number; class_name: string; subject: string },
) {
  try {
    const response = await fetch(`${url}/functions/v1/telegram-dispatcher`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: assignment.substitute_user_id,
        title: "OkulOS · Vekalet Görevi",
        message: `Bugün ${assignment.period}. ders ${assignment.class_name} sınıfında ${assignment.subject} dersine vekalet edeceksiniz. Dersi yürütün ve işlenen konuyu sınıf defterine kaydedin.`,
      }),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return Boolean(result?.sent);
  } catch (error) {
    console.error("Telegram dispatcher unavailable", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers: corsHeaders });

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers: corsHeaders });

    const { date } = await req.json().catch(() => ({ date: null }));
    const dutyDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

    const { data: beforeRows } = await admin
      .from("substitute_assignments")
      .select("id,absence_lessons!inner(lesson_date)")
      .eq("absence_lessons.lesson_date", dutyDate);
    const beforeIds = new Set((beforeRows ?? []).map((row) => row.id));

    const { data: planned, error: planError } = await userClient.rpc("assign_substitutes_for_day", { p_date: dutyDate });
    if (planError) {
      const noCapacity = planError.message?.includes("NO_SUBSTITUTE_AVAILABLE");
      return Response.json(
        { error: noCapacity ? "NO_SUBSTITUTE_AVAILABLE" : "ASSIGNMENT_FAILED", detail: planError.message },
        { status: noCapacity ? 409 : 400, headers: corsHeaders },
      );
    }

    const newAssignments = (planned ?? []).filter((row: { assignment_id: string }) => !beforeIds.has(row.assignment_id));
    const firebaseRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    let notified = 0;
    let telegramNotified = 0;

    let accessToken: string | null = null;
    let serviceAccount: { client_email: string; private_key: string; project_id: string } | null = null;
    if (firebaseRaw && newAssignments.length) {
      serviceAccount = JSON.parse(firebaseRaw) as { client_email: string; private_key: string; project_id: string };
      accessToken = await getFirebaseAccessToken(serviceAccount);
    }

    for (const assignment of newAssignments) {
      let anyDelivery = false;

      if (accessToken && serviceAccount) {
        const { data: tokens } = await admin
          .from("fcm_tokens")
          .select("token")
          .eq("user_id", assignment.substitute_user_id);
        let sent = false;
        for (const item of tokens ?? []) {
          if (await sendFcm(accessToken, serviceAccount.project_id, item.token, assignment)) sent = true;
        }
        if (sent) {
          notified += 1;
          anyDelivery = true;
        }
      }

      if (await dispatchTelegram(url, serviceKey, assignment)) {
        telegramNotified += 1;
        anyDelivery = true;
      }

      if (anyDelivery) {
        await admin
          .from("substitute_assignments")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", assignment.assignment_id);
      }
    }

    return Response.json({
      ok: true,
      assignments: planned ?? [],
      newlyAssigned: newAssignments.length,
      notified,
      telegramNotified,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "ASSIGNMENT_FAILED" }, { status: 500, headers: corsHeaders });
  }
});
