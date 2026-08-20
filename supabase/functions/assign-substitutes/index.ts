import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function dispatchWebPush(
  url: string,
  authHeader: string,
  assignment: { substitute_user_id: string; period: number; class_name: string; subject: string },
) {
  try {
    const response = await fetch(`${url}/functions/v1/web-push-dispatcher`, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: assignment.substitute_user_id,
        title: "OkulOS · Vekalet Görevi",
        message: `Bugün ${assignment.period}. ders ${assignment.class_name} sınıfında ${assignment.subject} dersine vekalet edeceksiniz.`,
        url: "/substitutes",
        tag: `substitute-${assignment.period}-${assignment.class_name}`,
        requireInteraction: true,
      }),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return Number(result?.sent ?? 0) > 0;
  } catch (error) {
    console.error("Web Push dispatcher unavailable", error);
    return false;
  }
}

async function dispatchTelegram(
  url: string,
  serviceKey: string,
  assignment: { substitute_user_id: string; period: number; class_name: string; subject: string },
) {
  try {
    const response = await fetch(`${url}/functions/v1/telegram-dispatcher`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
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

    const { data: membership, error: membershipError } = await admin
      .from("institution_memberships")
      .select("institution_code")
      .eq("user_id", userData.user.id)
      .eq("active", true)
      .order("is_owner", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (membershipError || !membership?.institution_code) {
      return Response.json({ error: "TENANT_CONTEXT_REQUIRED" }, { status: 403, headers: corsHeaders });
    }
    const institutionCode = membership.institution_code;

    const { date } = await req.json().catch(() => ({ date: null }));
    const dutyDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

    const { data: beforeRows } = await admin
      .from("substitute_assignments")
      .select("id,absence_lessons!inner(lesson_date)")
      .eq("institution_code", institutionCode)
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
    let webPushNotified = 0;
    let telegramNotified = 0;

    for (const assignment of newAssignments) {
      let anyDelivery = false;
      if (await dispatchWebPush(url, authHeader, assignment)) {
        webPushNotified += 1;
        anyDelivery = true;
      }
      if (await dispatchTelegram(url, serviceKey, assignment)) {
        telegramNotified += 1;
        anyDelivery = true;
      }
      if (anyDelivery) {
        await admin
          .from("substitute_assignments")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", assignment.assignment_id)
          .eq("institution_code", institutionCode);
      }
    }

    return Response.json({ ok: true, assignments: planned ?? [], newlyAssigned: newAssignments.length, webPushNotified, telegramNotified }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "ASSIGNMENT_FAILED" }, { status: 500, headers: corsHeaders });
  }
});
