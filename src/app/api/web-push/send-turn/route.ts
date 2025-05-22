// src/app/api/web-push/send-turn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createSupabaseClient } from '@/lib/supabase/server';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_SUBJECT}`,
  process.env.VAPID_PUBLIC!,
  process.env.VAPID_PRIVATE!
);

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('No subscription for', userId, error);
    return NextResponse.json({ error: 'No subscription' }, { status: 404 });
  }

  console.log('Sending push to', userId, data.subscription);

  try {
    await webpush.sendNotification(
      data.subscription,
      JSON.stringify({
        title: 'Your turn is up!',
        body: `Turn is ready`,
        icon: '/android-chrome-192x192.png',
      })
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push failed:', err);
    return NextResponse.json({ error: 'Push failed' }, { status: 500 });
  }
}
