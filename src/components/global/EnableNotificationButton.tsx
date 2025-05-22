// src/components/global/EnableNotificationsButton.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface EnableNotificationsButtonProps {
  userId: string;
  groupId: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const safe = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(safe);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Renders a button that prompts for notification permission and,
 * on click, registers the service worker and subscribes for push.
 */
export const EnableNotificationsButton: React.FC<
  EnableNotificationsButtonProps
> = ({ userId, groupId }) => {
  const [subscribed, setSubscribed] = useState(false);

  const handleClick = () => {
    // Must call this directly in the click handler so Safari treats it as a user gesture
    Notification.requestPermission().then((permission) => {
      if (permission !== 'granted') {
        toast.error('You must allow notifications to subscribe.');
        return;
      }

      (async () => {
        if (!('serviceWorker' in navigator)) {
          toast.error('Service Workers not supported in this browser.');
          return;
        }

        // Wait for the already-registered worker (Next-PWA auto-injects this in prod)
        const registration = await navigator.serviceWorker.ready;

        // Subscribe with your VAPID public key
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC;
        if (!vapidKey)
          throw new Error('Missing NEXT_PUBLIC_VAPID_PUBLIC env var');
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        // Send it to your backend for storage
        const res = await fetch('/api/web-push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, userId, groupId }),
        });
        if (!res.ok) throw new Error('Failed to save subscription on server');

        toast.success('Notifications enabled!');
        setSubscribed(true);
      })().catch((err) => {
        console.error('Enable notifications failed', err);
        toast.error('Failed to enable notifications.');
      });
    });
  };

  return (
    <Button onClick={handleClick} disabled={subscribed}>
      {subscribed ? '🔔 Subscribed' : '🔔 Enable Notifications'}
    </Button>
  );
};
