'use client';

import { useEffect, useState } from 'react';
import OneSignal, {
  IOneSignalOneSignal,
  SubscriptionChangeEvent,
} from 'react-onesignal';
import { toast } from 'react-toastify';

/* type-cast for full API */
const OS = OneSignal as unknown as IOneSignalOneSignal;

async function savePlayerId(id: string) {
  await fetch('/api/notifications/save-player', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: id }),
  }).catch(console.error);
}

type Status = 'loading' | 'prompt' | 'enabled' | 'blocked';

export default function NotificationToggle() {
  const [status, setStatus] = useState<Status>('loading');

  /* helper to recompute status */
  const updateStatus = () => {
    const perm = OS.Notifications.permissionNative; // 'default' | 'granted' | 'denied'
    const sub = OS.User.PushSubscription;

    if (perm === 'denied') return setStatus('blocked');
    if (perm === 'default') return setStatus('prompt');
    if (sub.optedIn) return setStatus('enabled');
    return setStatus('prompt');
  };

  useEffect(() => {
    /* wait until SDK is fully ready */
    OS.init({ appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID! }).finally(
      () => {
        updateStatus();

        /* react to future permission changes */
        OS.Notifications.addEventListener('permissionChange', updateStatus);

        /* react to subscription changes */
        OS.User.PushSubscription.addEventListener(
          'change',
          (ev: SubscriptionChangeEvent) => {
            if (ev.current.id) savePlayerId(ev.current.id);
            updateStatus();
          }
        );

        /* toast when foreground notification displays */
        OS.Notifications.addEventListener(
          'foregroundWillDisplay',
          ({ notification }) =>
            toast.info(notification.title ?? 'New notification')
        );
      }
    );
    // [] intentionally – run once
  }, []);

  const handleEnable = async () => {
    if (status !== 'prompt') return;

    try {
      /* ask browser permission if still undecided */
      if (Notification.permission === 'default') {
        await OS.Notifications.requestPermission();
      }
      /* if now granted, opt-in */
      if (Notification.permission === 'granted') {
        await OS.User.PushSubscription.optIn();
      } else {
        setStatus('blocked');
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* UI */
  if (status === 'loading') {
    return (
      <button className="px-3 py-2 bg-gray-400 rounded" disabled>
        Loading…
      </button>
    );
  }

  if (status === 'blocked') {
    return (
      <p className="text-red-600 text-sm">
        Notifications are blocked. Enable them in your browser’s
        site&nbsp;settings.
      </p>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={status === 'enabled'}
      className={`px-3 py-2 rounded ${
        status === 'enabled' ? 'bg-gray-400' : 'bg-blue-600 text-white'
      }`}
    >
      {status === 'enabled' ? 'Notifications Enabled' : 'Enable Notifications'}
    </button>
  );
}
