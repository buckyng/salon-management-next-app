'use client';

import { useEffect, useState } from 'react';

export type PushSubscriptionJSON = ReturnType<PushSubscription['toJSON']>;

export function usePushSubscription(
  onChange: (sub: PushSubscriptionJSON) => Promise<void>
) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('Push API not supported in this browser');
      return;
    }

    let reg: ServiceWorkerRegistration;

    navigator.serviceWorker
      .register('/notification-sw.js')
      .then((r) => {
        reg = r;
        return Notification.requestPermission();
      })
      .then((permission) => {
        if (permission !== 'granted') throw new Error('Permission denied');
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        if (sub) return sub;
        // replace with your VAPID public key:
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC!;
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      })
      .then((sub) => onChange(sub.toJSON()))
      .catch((err) => setError((err as Error).message));

    // no teardown needed
  }, [onChange]);

  return { error };
}

// utility to decode your VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const raw = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const buf = atob(raw);
  return Uint8Array.from([...buf].map((c) => c.charCodeAt(0)));
}
