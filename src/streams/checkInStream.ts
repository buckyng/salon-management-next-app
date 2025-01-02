import prisma from '@/lib/prisma';

export async function startCheckInStream(onEvent: (event: any) => void) {
  const stream = await prisma.checkIn.stream();

  (async () => {
    for await (const event of stream) {
      console.log('Check-In event received:', event);
      onEvent(event);
    }
  })().catch((err) => {
    console.error('Error streaming Check-In events:', err);
  });
}
