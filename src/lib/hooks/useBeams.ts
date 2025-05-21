// src/lib/hooks/useBeams.ts
'use client';

import { useEffect } from 'react';
import { Client as BeamsClient } from '@pusher/push-notifications-web';

declare global {
  interface Window {
    beamsClient?: BeamsClient;
  }
  interface Navigator {
    /** iOS “Add to Home Screen” standalone flag */
    standalone?: boolean;
  }
}

/**
 * Subscribe this browser to user-specific Beams interest, but only
 * if the environment really supports Web Push (and for Safari, only
 * when running as an installed PWA).
 */
export default function useBeams(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    // 1️⃣ Basic Web Push feature‐detect
    const supportsWebPush =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    if (!supportsWebPush) {
      console.warn('[Beams] Web Push not supported in this browser');
      return;
    }

    // 2️⃣ Safari PWA check: only run if "standalone" mode
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true;
    if (isSafari && !isStandalone) {
      console.warn(
        '[Beams] Safari push only works in an installed PWA (display-mode: standalone)'
      );
      return;
    }

    // 3️⃣ Don’t re-init if we already have a client in window
    if (window.beamsClient) {
      console.log('[Beams] already initialized');
      return;
    }

    let beams: BeamsClient;

    (async () => {
      try {
        // 4️⃣ Instantiate
        beams = new BeamsClient({
          instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID!,
        });

        // 5️⃣ Request permission if needed
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            console.warn('[Beams] user denied notification permission');
            return;
          }
        }

        // 6️⃣ Start (this registers the SW under /service-worker.js)
        await beams.start();
        console.log('[Beams] start() succeeded');

        // 7️⃣ Subscribe to the per-user interest
        await beams.addDeviceInterest(`user-${userId}`);
        console.log('[Beams] subscribed to interest:', `user-${userId}`);

        // 8️⃣ Expose for cleanup (e.g. on logout)
        window.beamsClient = beams;
      } catch (err) {
        console.error('[Beams] init/subscription error:', err);
      }
    })();

    return () => {
      beams?.stop();
      delete window.beamsClient;
    };
  }, [userId]);
}
