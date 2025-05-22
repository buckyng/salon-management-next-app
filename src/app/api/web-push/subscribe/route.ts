// src/app/api/web-push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { subscription, groupId, userId } = await req.json();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, group_id: groupId, subscription },
      { onConflict: 'user_id,group_id' }
    );

  if (error) {
    console.error('Subscribe error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
