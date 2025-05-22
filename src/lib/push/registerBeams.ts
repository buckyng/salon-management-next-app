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
  if (window.beamsClient) {
    console.log('[Beams] already initialized');
    return window.beamsClient;
  }

  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported');
  }

  console.log('[Beams] registering SW...');
  const registration = await navigator.serviceWorker.register(
    '/service-worker.js'
  );
  await navigator.serviceWorker.ready;
  console.log('[Beams] SW ready:', registration);

  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('Notification permission denied');
    }
  } else if (Notification.permission !== 'granted') {
    throw new Error('Notifications are blocked');
  }

  const beams = new BeamsClient({
    instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID!,
    serviceWorkerRegistration: registration,
  });

  // ① .start()
  try {
    console.log('[Beams] calling start()…');
    await beams.start();
    console.log('[Beams] start() OK');
  } catch (err) {
    console.error('[Beams] start() failed:', err);
    throw new Error('Beams SDK failed to start: ' + (err as Error).message);
  }

  // ② .addDeviceInterest()
  try {
    console.log('[Beams] adding interest:', `user-${userId}`);
    await beams.addDeviceInterest(`user-${userId}`);
    console.log('[Beams] addDeviceInterest() OK');
  } catch (err) {
    console.error('[Beams] addDeviceInterest() failed:', err);
    throw new Error(
      'Could not add Device Interest. SDK not registered with Beams.'
    );
  }

  window.beamsClient = beams;
  return beams;
}
