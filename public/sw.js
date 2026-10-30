// public/sw.js
const CACHE_NAME = "irowa-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/home",
  "/offline",
  "/manifest.json",
  "/images/irowalogo.png",
  "/images/water-illustration.svg",
  "/images/irosin-map-placeholder.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: network first with offline fallback for navigational requests
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Avoid caching admin API requests or realtime websockets
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((cached) => {
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return caches.match("/offline");
        }
        return new Response("Network unavailable", { status: 503, statusText: "Offline" });
      });
    })
  );
});

// Push notification handling
self.addEventListener("push", (event) => {
  let data = { title: "IroWa Water Update", body: "New water source or advisory reported." };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/images/irowalogo.png",
    badge: "/images/irowalogo.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/home",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Push notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/home";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
