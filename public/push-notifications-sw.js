// public/push-notifications-sw.js

// Listen for incoming push events
self.addEventListener('push', event => {
    let payload = {};
    try {
      payload = event.data.json();
    } catch (e) {
      console.error('Push event but no data', e);
    }
  
    const title = payload.title || 'Salon Management';
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/android-chrome-192x192.png',
      badge: payload.badge || '/android-chrome-192x192.png',
      data: {
        url: payload.url || '/'
      }
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // Handle notification clicks
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data.url;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
  
  // Optional: notify open pages (e.g. to show a toast) when a push arrives
  self.addEventListener('push', event => {
    let payload = {};
    try {
      payload = event.data.json();
    } catch {}
    event.waitUntil(
      clients.matchAll({ includeUncontrolled: true }).then(allClients => {
        allClients.forEach(client => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            payload
          });
        });
      })
    );
  });
  