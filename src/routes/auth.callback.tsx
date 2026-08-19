import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Giriş doğrulanıyor — OkulOS" }] }),
  component: AuthCallback,
});

const SUPER_ADMIN_EMAIL = "halisbozoglu@yahoo.com";

async function finishLogin(navigate: ReturnType<typeof useNavigate>) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Oturum kullanıcısı alınamadı.");

  if ((userData.user.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL) {
    const { error: claimError } = await supabase.rpc("claim_super_admin_profile");
    if (claimError) throw new Error("Süper Admin profili doğrulanamadı.");
  }

  const { data: isSuperAdmin, error: roleError } = await supabase.rpc("is_super_admin");
  if (roleError) throw new Error("Kullanıcı yetkisi okunamadı.");
  await navigate({ to: isSuperAdmin ? "/super-admin" : "/dashboard", replace: true });
}

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      try {
        const url = new URL(window.location.href);
        const queryCode = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (queryCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(queryCode);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (verifyError) throw verifyError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error("Giriş bağlantısı geçersiz veya süresi dolmuş.");
        }

        if (!cancelled) await finishLogin(navigate);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Giriş bağlantısı doğrulanamadı.");
      }
    }

    void complete();
    return () => { cancelled = true; };
  }, [navigate]);

  return <main className="grid min-h-screen place-items-center bg-background px-4">
    <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
      {error ? <>
        <AlertCircle className="mx-auto size-9 text-destructive" />
        <h1 className="mt-3 text-lg font-semibold">Giriş tamamlanamadı</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <a href="/" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Giriş ekranına dön</a>
      </> : <>
        <Loader2 className="mx-auto size-9 animate-spin text-primary" />
        <h1 className="mt-3 text-lg font-semibold">Giriş doğrulanıyor</h1>
        <p className="mt-2 text-sm text-muted-foreground">Güvenli oturum kuruluyor, lütfen bekleyin.</p>
      </>}
    </section>
  </main>;
}
