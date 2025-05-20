'use client';

import { useEffect } from 'react';
import { Client as BeamsClient } from '@pusher/push-notifications-web';

/**
 * Subscribe browser to the logged-in user’s Beams interest.
 */
export default function useBeams(userId: string | null, readyCb?: () => void) {
  useEffect(() => {
    if (!userId) return;

    /* cleanup holder */
    let stop: (() => void) | undefined;

    (async () => {
      /* register the SW first */
      const swReg = await navigator.serviceWorker.register(
        '/push-notifications-sw.js'
      );

      /* initialise Beams */
      const beams = new BeamsClient({
        instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID!,
        serviceWorkerRegistration: swReg,
      });

      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          console.warn('Notifications not granted');
          return; // abort subscribing until they allow
        }
      }

      await beams.start();
      await beams.addDeviceInterest(`user-${userId}`);

      stop = () => {
        void beams.stop();
      };

      readyCb?.();
    })().catch(console.error);

    /* React-compliant synchronous cleanup */
    return () => {
      if (stop) stop();
    };
  }, [userId, readyCb]);
}
