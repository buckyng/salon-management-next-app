// src/lib/hooks/useBeams.ts
'use client';

import { useEffect } from 'react';
import { Client as BeamsClient } from '@pusher/push-notifications-web';

declare global {
  interface Window {
    beamsClient?: BeamsClient;
  }
}

export default function useBeams(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    let stopped = false;

    (async () => {
      try {
        // 1️⃣ register your service worker
        const swReg = await navigator.serviceWorker.register(
          '/push-notifications-sw.js'
        );

        // 2️⃣ create the client
        const beams = new BeamsClient({
          instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID!,
          serviceWorkerRegistration: swReg,
          // allowLocalhostAsSecureOrigin: true, // uncomment if testing on localhost
        });

        // 3️⃣ *first* start()
        await beams.start();

        // 4️⃣ *then* add interests
        await beams.addDeviceInterest(`user-${userId}`);

        // 5️⃣ expose for cleanup
        window.beamsClient = beams;
      } catch (e) {
        console.error('Beams initialization failed:', e);
      }
    })();

    return () => {
      if (window.beamsClient && !stopped) {
        void window.beamsClient.stop();
        delete window.beamsClient;
        stopped = true;
      }
    };
  }, [userId]);
}
