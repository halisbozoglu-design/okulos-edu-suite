import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isoWeekday: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

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

    const { hasMedicalReport = false, note = null } = await req.json();
    const normalizedNote = typeof note === "string" && note.trim() ? note.trim() : null;
    const now = new Date();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const weekdayLabel = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Istanbul",
      weekday: "short",
    }).format(now);
    const weekday = isoWeekday[weekdayLabel];
    if (!weekday) throw new Error("WEEKDAY_RESOLUTION_FAILED");

    const { data: report, error: reportError } = await admin
      .from("crisis_reports")
      .upsert({
        teacher_id: userData.user.id,
        report_date: today,
        has_medical_report: Boolean(hasMedicalReport),
        note: normalizedNote,
        status: "open",
      }, { onConflict: "teacher_id,report_date" })
      .select("id")
      .single();
    if (reportError) throw reportError;

    const { data: absence, error: absenceError } = await admin
      .from("absences")
      .upsert({
        crisis_report_id: report.id,
        teacher_id: userData.user.id,
        absence_date: today,
        has_medical_report: Boolean(hasMedicalReport),
        note: normalizedNote,
        status: "open",
      }, { onConflict: "teacher_id,absence_date" })
      .select("id")
      .single();
    if (absenceError) throw absenceError;

    const { data: schedule, error: scheduleError } = await admin
      .from("teacher_schedule")
      .select("period,class_id,class_name,subject")
      .eq("teacher_id", userData.user.id)
      .eq("weekday", weekday)
      .order("period");
    if (scheduleError) throw scheduleError;

    if (schedule?.length) {
      const { error: lessonsError } = await admin.from("absence_lessons").upsert(
        schedule.map((lesson) => ({
          crisis_report_id: report.id,
          teacher_id: userData.user.id,
          lesson_date: today,
          period: lesson.period,
          class_id: lesson.class_id ?? null,
          class_name: lesson.class_name,
          subject: lesson.subject,
        })),
        { onConflict: "teacher_id,lesson_date,period" },
      );
      if (lessonsError) throw lessonsError;
    }

    const { data: rotation } = await admin
      .from("duty_rotation")
      .select("vice_principal_id")
      .eq("duty_date", today)
      .maybeSingle();

    let dutyVicePrincipal = null;
    if (rotation?.vice_principal_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name,phone")
        .eq("user_id", rotation.vice_principal_id)
        .maybeSingle();
      dutyVicePrincipal = profile;
    }

    return Response.json(
      {
        ok: true,
        reportId: report.id,
        absenceId: absence.id,
        lessonCount: schedule?.length ?? 0,
        dutyVicePrincipal,
        instruction: "Devamsızlığınızı MEBBİS üzerinden de bildiriniz ve nöbetçi müdür yardımcısını bilgilendiriniz.",
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "REPORT_FAILED" }, { status: 500, headers: corsHeaders });
  }
});
