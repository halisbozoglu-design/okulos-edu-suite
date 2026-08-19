import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { registerPwaServiceWorker } from "../lib/web-push-client";
import { usePermissions } from "../lib/permissions";
import { supabase } from "../lib/supabase";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sayfa bulunamadı</h2>
        <p className="mt-2 text-sm text-muted-foreground">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Ana sayfaya dön</Link></div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Sayfa yüklenemedi</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Tekrar dene</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground">Ana sayfa</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "OkulOS" },
      { name: "description", content: "Okul yönetimi, ders programı, nöbet, ek ders ve anlık bildirim sistemi" },
      { name: "application-name", content: "OkulOS" },
      { name: "theme-color", content: "#4f46e5" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "OkulOS" },
      { property: "og:title", content: "OkulOS" },
      { property: "og:description", content: "Okul yönetim sistemi" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icons/icon-192.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="tr"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

type RouteRule = { prefix: string; any: string[]; superOnly?: boolean };
const protectedRoutes: RouteRule[] = [
  { prefix: "/settings-permissions", any: ["permissions.manage"] },
  { prefix: "/settings-task-roles", any: ["permissions.manage"] },
  { prefix: "/personnel-admin", any: ["personnel.view", "personnel.manage"] },
  { prefix: "/calendar", any: ["settings.manage"] },
  { prefix: "/curriculum", any: ["curriculum.manage"] },
  { prefix: "/classes", any: ["classes.manage"] },
  { prefix: "/classrooms", any: ["classrooms.manage"] },
  { prefix: "/quran-groups", any: ["quran.manage"] },
  { prefix: "/norm-settings", any: ["norm.manage"] },
  { prefix: "/norm-analysis", any: ["norm.view", "norm.manage"] },
  { prefix: "/schedule-scenario-comparison", any: ["schedule.view", "schedule.generate", "schedule.apply"] },
  { prefix: "/schedule-optimization", any: ["schedule.rules"] },
  { prefix: "/schedule-rules", any: ["schedule.rules"] },
  { prefix: "/schedule-preparation", any: ["schedule.rules", "schedule.generate"] },
  { prefix: "/schedule-solver", any: ["schedule.generate", "schedule.apply"] },
  { prefix: "/room-assignment", any: ["schedule.generate", "classrooms.manage"] },
  { prefix: "/schedule-validation", any: ["schedule.view", "schedule.publish"] },
  { prefix: "/schedule-history", any: ["schedule.restore"] },
  { prefix: "/schedule-archive", any: ["schedule.publish"] },
  { prefix: "/schedule", any: ["schedule.view", "schedule.edit", "schedule.generate", "schedule.apply", "schedule.publish", "schedule.restore"] },
  { prefix: "/payroll-rules", any: ["payroll.edit"] },
  { prefix: "/payroll", any: ["payroll.view", "payroll.calculate", "payroll.edit", "payroll.approve", "payroll.publish"] },
  { prefix: "/substitutes", any: ["substitutes.view", "substitutes.manage"] },
  { prefix: "/duty-book", any: ["duty.view", "duty.manage"] },
  { prefix: "/settings", any: ["duty.view", "duty.manage", "duty.generate", "duty.lock", "permissions.manage", "settings.manage"] },
  { prefix: "/super-admin", any: [], superOnly: true },
];

function PermissionBoundary({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { codes, loading, error } = usePermissions();
  const [isSuper, setIsSuper] = useState(false);
  const [superChecked, setSuperChecked] = useState(false);

  const rule = useMemo(() => protectedRoutes
    .filter((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0] ?? null, [pathname]);

  useEffect(() => {
    let alive = true;
    if (!rule?.superOnly) { setSuperChecked(true); return; }
    setSuperChecked(false);
    void supabase.rpc("is_super_admin").then(({ data }: { data: unknown }) => {
      if (!alive) return;
      setIsSuper(Boolean(data));
      setSuperChecked(true);
    });
    return () => { alive = false; };
  }, [rule?.superOnly]);

  if (!rule) return <>{children}</>;
  if (loading || (rule.superOnly && !superChecked)) {
    return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="rounded-xl border bg-card px-5 py-4 text-sm text-muted-foreground">Görev ve yetkiler kontrol ediliyor…</div></div>;
  }

  const allowed = rule.superOnly ? isSuper : rule.any.some((code) => codes.has(code));
  if (!allowed) {
    return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="w-full max-w-lg rounded-2xl border bg-card p-6 text-center shadow-sm"><h1 className="text-lg font-semibold">Bu işlem için görev atanmamış</h1><p className="mt-2 text-sm text-muted-foreground">Bu modül, kullanıcıya atanmış görev ve işlem yetkileri dışında. Yetki gerekiyorsa okul yöneticiniz Ayarlar → Görev ve Yetki Atama bölümünden tanımlayabilir.</p>{error?<p className="mt-2 text-xs text-destructive">Yetki bilgisi okunamadı: {error}</p>:null}<div className="mt-5 flex justify-center gap-2"><Link to="/management" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Yönetim Merkezi</Link><Link to="/dashboard" className="rounded-md border px-4 py-2 text-sm font-medium">Ana Panel</Link></div></div></div>;
  }
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { void registerPwaServiceWorker(); }, []);
  return <QueryClientProvider client={queryClient}><PermissionBoundary><Outlet /></PermissionBoundary></QueryClientProvider>;
}