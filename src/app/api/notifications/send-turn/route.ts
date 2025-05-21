import { NextRequest, NextResponse } from 'next/server';
import PushNotifications from '@pusher/push-notifications-server';

const beams = new PushNotifications({
  instanceId: process.env.BEAMS_INSTANCE_ID!,
  secretKey: process.env.BEAMS_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  const { employeeId } = await req.json();
  if (!employeeId) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 });
  }

  const publishRes = await beams.publishToInterests([`user-${employeeId}`], {
    web: {
      notification: {
        title: 'Service Turn',
        body: `Your next client is ready`,
      },
    },
  });

  return NextResponse.json({ publishId: publishRes.publishId });
}
