/* OkulOS Firebase Cloud Messaging service worker. */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;
const config = {
  apiKey: params.get("apiKey") || "",
  authDomain: params.get("authDomain") || "",
  projectId: params.get("projectId") || "",
  storageBucket: params.get("storageBucket") || undefined,
  messagingSenderId: params.get("messagingSenderId") || "",
  appId: params.get("appId") || "",
};

if (config.apiKey && config.projectId && config.messagingSenderId && config.appId) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    self.registration.showNotification(notification.title || "OkulOS", {
      body: notification.body || data.message || "Yeni bir bildiriminiz var.",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: data.link || "/dashboard" },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/dashboard";
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clientsList) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(url);
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(url);
  })());
});
