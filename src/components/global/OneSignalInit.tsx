'use client';

import { useEffect } from 'react';
import OneSignal, {
  IOneSignalOneSignal,
  IInitObject,
  SubscriptionChangeEvent,
} from 'react-onesignal';
import { toast } from 'react-toastify';

/*──────────────── typed cast ────────────────*/
const OS = OneSignal as unknown as IOneSignalOneSignal;

/*──────────────── helper ────────────────*/
const savePlayerId = async (id: string) =>
  fetch('/api/notifications/save-player', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: id }),
  }).catch(console.error);

/*──────────────── component ────────────────*/
export default function OneSignalInit() {
  useEffect(() => {
    /* step ④ – guard so we init exactly once */
    const w = window as Window & { __osInit?: boolean };
    if (w.__osInit) return;
    w.__osInit = true;

    (async () => {
      /* step ② – tell SDK the exact file name you placed in /public */
      const opts: IInitObject = {
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true,
      };

      await OS.init(opts);

      /* ask permission if undecided */
      if (OS.Notifications.permissionNative === 'default') {
        await OS.Notifications.requestPermission();
      }

      /* save current id */
      const id = OS.User.PushSubscription.id;
      if (id) savePlayerId(id);

      /* keep DB in sync */
      OS.User.PushSubscription.addEventListener(
        'change',
        (ev: SubscriptionChangeEvent) =>
          ev.current.id && savePlayerId(ev.current.id)
      );

      /* foreground toast */
      OS.Notifications.addEventListener(
        'foregroundWillDisplay',
        ({ notification }) =>
          toast.info(notification.title ?? 'New notification')
      );
    })();
  }, []);

  return null; // no visible UI
}
