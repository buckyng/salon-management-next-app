// ① import the official Pusher worker
importScripts('https://js.pusher.com/beams/service-worker.js');

// ② forward every push payload to all open pages
self.addEventListener('push', (event) => {
  // extract the same JSON the official handler will use
  const payload = event.data?.json?.();
  if (!payload) return;

  event.waitUntil(
    (async () => {
      // show the notification as usual
      // (the imported service-worker.js already called showNotification)
      // now send a message to each client
      const all = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of all) {
        client.postMessage({ type: 'BEAMS_NOTIFICATION_RECEIVED', payload });
      }
    })()
  );
});