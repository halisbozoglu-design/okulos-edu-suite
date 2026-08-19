import { supabase } from "@/lib/supabase";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId: string;
  appId: string;
};

export type PushSetupResult = { ok: true; token: string } | { ok: false; reason: string };

function getConfig(): FirebaseConfig | null {
  const env = import.meta.env as Record<string, string | undefined>;
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.messagingSenderId || !config.appId) return null;
  return config as FirebaseConfig;
}

export function getPushCapability() {
  const config = getConfig();
  return {
    supported: typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window,
    configured: Boolean(config && (import.meta.env as Record<string,string|undefined>).VITE_FIREBASE_VAPID_KEY),
    permission: typeof Notification !== "undefined" ? Notification.permission : "denied",
  };
}

function swUrl(config: FirebaseConfig) {
  const params = new URLSearchParams({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
  if (config.storageBucket) params.set("storageBucket", config.storageBucket);
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

export async function enableBrowserPush(): Promise<PushSetupResult> {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return { ok: false, reason: "PUSH_NOT_SUPPORTED" };
  const config = getConfig();
  const vapidKey = (import.meta.env as Record<string,string|undefined>).VITE_FIREBASE_VAPID_KEY;
  if (!config || !vapidKey) return { ok: false, reason: "FIREBASE_CLIENT_CONFIG_MISSING" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "NOTIFICATION_PERMISSION_DENIED" };

  const registration = await navigator.serviceWorker.register(swUrl(config), { scope: "/" });
  await navigator.serviceWorker.ready;

  const appUrl = "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  const messagingUrl = "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";
  const appModule = await import(/* @vite-ignore */ appUrl) as { initializeApp: (config: FirebaseConfig) => unknown };
  const messagingModule = await import(/* @vite-ignore */ messagingUrl) as {
    getMessaging: (app: unknown) => unknown;
    getToken: (messaging: unknown, options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration }) => Promise<string>;
  };
  const app = appModule.initializeApp(config);
  const messaging = messagingModule.getMessaging(app);
  const token = await messagingModule.getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return { ok: false, reason: "FCM_TOKEN_EMPTY" };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, reason: "NOT_AUTHENTICATED" };
  const { error } = await supabase.from("fcm_tokens").upsert({
    user_id: auth.user.id,
    token,
    platform: "web",
    updated_at: new Date().toISOString(),
  }, { onConflict: "token" });
  if (error) return { ok: false, reason: "TOKEN_SAVE_FAILED" };
  return { ok: true, token };
}

export async function disableBrowserPush() {
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user) await supabase.from("fcm_tokens").delete().eq("user_id", auth.user.id).eq("platform", "web");
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const reg of regs) if (reg.active?.scriptURL.includes("firebase-messaging-sw.js")) await reg.unregister();
  return true;
}
