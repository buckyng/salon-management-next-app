'use client';

import { useState, useEffect } from 'react';
import OneSignal, { IOneSignalOneSignal } from 'react-onesignal';

const OS = OneSignal as unknown as IOneSignalOneSignal;

export default function NotificationToggle() {
  const [status, setStatus] = useState<'loading' | 'enabled' | 'disabled'>(
    'loading'
  );

  /* keep button label in sync */
  useEffect(() => {
    const sub = OS?.User?.PushSubscription;
    if (!sub) return;

    const setFromSub = () => setStatus(sub.optedIn ? 'enabled' : 'disabled');

    setFromSub();
    sub.addEventListener('change', () => setFromSub());
  }, []);

  /* click handler */
  const handleEnable = async () => {
    try {
      /* if permission undecided → ask */
      if (Notification.permission === 'default') {
        await OS.Notifications.requestPermission();
      }
      /* if still not granted, tell user */
      if (Notification.permission !== 'granted') {
        alert(
          'Notifications are blocked. Please enable them in your browser settings.'
        );
        return;
      }
      /* subscribe if not already */
      if (!OS.User.PushSubscription.optedIn) {
        await OS.User.PushSubscription.optIn();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleEnable}
      disabled={status === 'enabled'}
      className="px-3 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
    >
      {status === 'enabled' ? 'Notifications Enabled' : 'Enable Notifications'}
    </button>
  );
}
