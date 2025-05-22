// src/lib/hooks/usePushSubscription.ts
'use client';

import { useState, useEffect } from 'react';

export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UsePushSubscriptionReturn {
  error?: string;
}

/**
 * On mount, if notifications are already granted and a subscription exists,
 * fetch it from the service worker and invoke your callback so you can re-save it.
 */
export function usePushSubscription(
  onSubscription: (sub: PushSubscriptionJSON) => Promise<void>
): UsePushSubscriptionReturn {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setError('Push notifications are not supported by this browser.');
      return;
    }

    // Only proceed if the user has already granted permission
    if (Notification.permission !== 'granted') {
      return;
    }

    let cancelled = false;

    navigator.serviceWorker
      .ready
      .then(async (registration) => {
        // check for an existing subscription
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;

        const json = subscription.toJSON() as PushSubscriptionJSON;
        if (!cancelled) {
          await onSubscription(json);
        }
      })
      .catch((err) => {
        console.error('Error checking existing subscription', err);
        setError('Failed to load existing subscription.');
      });

    return () => {
      cancelled = true;
    };
  }, [onSubscription]);

  return { error };
}
