// src/app/api/notifications/send-sms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { sendSMS } from '@/services/smsService';

export async function POST(req: NextRequest) {
  const { userId, message } = await req.json();
  if (!userId || !message) {
    return NextResponse.json(
      { error: 'Missing userId or message' },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseClient();
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', userId)
    .single();

  if (profErr || !profile?.phone) {
    console.error('Error fetching phone for', userId, profErr);
    return NextResponse.json(
      { error: 'User phone not found' },
      { status: 404 }
    );
  }

  try {
    await sendSMS(profile.phone, message);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Twilio SMS failed:', err);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
