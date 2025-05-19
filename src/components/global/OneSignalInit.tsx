'use client';

import { useEffect } from 'react';
import OneSignal, {
  IOneSignalOneSignal,
  IInitObject,
  SubscriptionChangeEvent,
} from 'react-onesignal';
import { toast } from 'react-toastify';

/* Extend Window once, local to this module */
type InitFlagWindow = Window & { __osInit?: boolean };
const w = window as InitFlagWindow;

/* Cast OneSignal default export to full API */
const OS = OneSignal as unknown as IOneSignalOneSignal;

/* helper */
const savePlayerId = async (id: string) =>
  fetch('/api/notifications/save-player', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: id }),
  }).catch(console.error);

export default function OneSignalInit() {
  useEffect(() => {
    if (w.__osInit) return; // already initialised
    w.__osInit = true;

    (async () => {
      const opts: IInitObject = {
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true,
      };

      await OS.init(opts);

      if (OS.Notifications.permissionNative === 'default') {
        await OS.Notifications.requestPermission();
      }

      const id = OS.User.PushSubscription.id;
      if (id) savePlayerId(id);

      OS.User.PushSubscription.addEventListener(
        'change',
        (ev: SubscriptionChangeEvent) => {
          if (ev.current.id) savePlayerId(ev.current.id);
        }
      );

      OS.Notifications.addEventListener(
        'foregroundWillDisplay',
        ({ notification }) =>
          toast.info(notification.title ?? 'New notification')
      );
    })();
  }, []);

  return null;
}
