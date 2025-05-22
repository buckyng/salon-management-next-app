// public/notification-sw.js

// 1) Import Workbox’s precache logic
importScripts('/sw.js');

// 2) Import Pusher Beams (or your own push) handler
importScripts('https://js.pusher.com/beams/service-worker.js');

// 3) Forward push payloads into open pages for in-app toast
self.addEventListener('push', (event) => {
  const payload = event.data?.json?.();
  if (!payload) return;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of all) {
        client.postMessage({ type: 'BEAMS_NOTIFICATION_RECEIVED', payload });
      }
    })()
  );
});
