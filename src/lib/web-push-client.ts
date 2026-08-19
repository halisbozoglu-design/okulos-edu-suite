import { supabase } from "@/lib/supabase";

export type PushSetupResult = { ok: true } | { ok: false; reason: string };

function base64UrlToUint8Array(base64Url: string) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | null) {
  if (!buffer) return "";
  let binary = "";
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function getPushCapability() {
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const publicKey = (import.meta.env as Record<string, string | undefined>).VITE_WEB_PUSH_VAPID_PUBLIC_KEY;
  return {
    supported,
    configured: Boolean(publicKey),
    permission: typeof Notification !== "undefined" ? Notification.permission : "denied",
    standalone: typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true),
  };
}

export async function registerPwaServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function getCurrentPushSubscription() {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await registerPwaServiceWorker();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function enableBrowserPush(): Promise<PushSetupResult> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return { ok: false, reason: "PUSH_NOT_SUPPORTED" };
  }

  const vapidPublicKey = (import.meta.env as Record<string, string | undefined>).VITE_WEB_PUSH_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return { ok: false, reason: "VAPID_PUBLIC_KEY_MISSING" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "NOTIFICATION_PERMISSION_DENIED" };

  const registration = await registerPwaServiceWorker();
  if (!registration) return { ok: false, reason: "SERVICE_WORKER_FAILED" };
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
    });
  }

  const p256dh = arrayBufferToBase64Url(subscription.getKey("p256dh"));
  const auth = arrayBufferToBase64Url(subscription.getKey("auth"));
  if (!p256dh || !auth) return { ok: false, reason: "SUBSCRIPTION_KEYS_MISSING" };

  const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "ios" : /Android/i.test(navigator.userAgent) ? "android" : "web";
  const { error } = await supabase.rpc("register_push_subscription", {
    p_endpoint: subscription.endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
    p_user_agent: navigator.userAgent,
    p_platform: platform,
  });
  if (error) return { ok: false, reason: "SUBSCRIPTION_SAVE_FAILED" };
  return { ok: true };
}

export async function disableBrowserPush(): Promise<PushSetupResult> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return { ok: true };
  const endpoint = subscription.endpoint;
  const { error } = await supabase.rpc("disable_push_subscription", { p_endpoint: endpoint });
  if (error) return { ok: false, reason: "SUBSCRIPTION_DISABLE_FAILED" };
  await subscription.unsubscribe();
  return { ok: true };
}
