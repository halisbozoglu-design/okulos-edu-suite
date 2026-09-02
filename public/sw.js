const CACHE_NAME = "okulos-shell-v3";
const STATIC_SHELL = ["/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg", "/icons/icon-maskable.svg", "/icons/badge.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Authenticated route HTML is always network-only; no user-specific page is persisted offline.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => new Response(
      "<!doctype html><html lang='tr'><meta name='viewport' content='width=device-width,initial-scale=1'><body style='font-family:system-ui;padding:32px'><h2>OkulOS</h2><p>Bu ekran için internet bağlantısı gerekiyor. Bağlantı geldiğinde tekrar deneyin.</p></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    )));
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination) || url.pathname === "/manifest.webmanifest") {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })());
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() || "Yeni bir bildiriminiz var." }; }
  const title = data.title || "OkulOS";
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "Yeni bir bildiriminiz var.",
    icon: data.icon || "/icons/icon-192.svg",
    badge: data.badge || "/icons/badge.svg",
    tag: data.tag || "okulos",
    renotify: true,
    requireInteraction: Boolean(data.requireInteraction),
    timestamp: data.timestamp || Date.now(),
    data: { url: data.url || "/dashboard" },
    vibrate: [180, 80, 180],
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || "/dashboard";
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
