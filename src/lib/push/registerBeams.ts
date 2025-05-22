// src/lib/push/registerBeams.ts
import { Client as BeamsClient } from '@pusher/push-notifications-web';

declare global {
  interface Window {
    beamsClient?: BeamsClient;
  }
}

export async function registerBeamsForUser(
  userId: string
): Promise<BeamsClient> {
  // 1️⃣ Don’t re-init if we already have one
  if (window.beamsClient) {
    console.log('[Beams] already initialized');
    return window.beamsClient;
  }

  // 2️⃣ Must have service workers
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported in this browser');
  }

  // 3️⃣ Register our SW (must be /service-worker.js)
  console.log('[Beams] registering service worker...');
  const registration = await navigator.serviceWorker.register(
    '/service-worker.js'
  );
  console.log('[Beams] service worker registered:', registration);

  // 4️⃣ Wait until the SW is active
  await navigator.serviceWorker.ready;
  console.log('[Beams] service-worker ready');

  // 5️⃣ Ask permission if needed
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('User denied notification permission');
    }
  } else if (Notification.permission !== 'granted') {
    throw new Error('Notifications are blocked');
  }

  // 6️⃣ Instantiate & start the Beams SDK
  const beams = new BeamsClient({
    instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID!,
    serviceWorkerRegistration: registration,
  });
  console.log('[Beams] calling start()');
  await beams.start();
  console.log('[Beams] start() succeeded');

  // 7️⃣ Subscribe to the user interest
  console.log('[Beams] adding interest:', `user-${userId}`);
  await beams.addDeviceInterest(`user-${userId}`);
  console.log('[Beams] addDeviceInterest() succeeded');

  // 8️⃣ Store globally for cleanup
  window.beamsClient = beams;
  return beams;
}
