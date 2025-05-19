import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

/**
 * Body → { employeeId: string }
 * Returns → 200 { ok: true }  |  4 xx / 5 xx { error: '…' }
 */
export async function POST(req: NextRequest) {
  /* 1 ▸ Validate request JSON */
  const { employeeId } = await req.json();
  if (!employeeId) {
    return NextResponse.json({ error: 'employeeId required' }, { status: 400 });
  }

  /* 2 ▸ Read employee’s device IDs */
  const supabase = await createSupabaseClient();
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('onesignal_ids')
    .eq('id', employeeId)
    .single();

  if (profErr) {
    console.error('DB error:', profErr);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
  if (!profile || !profile.onesignal_ids?.length) {
    return NextResponse.json(
      { error: 'No registered devices' },
      { status: 404 }
    );
  }

  /* 3 ▸ Send push via OneSignal REST */
  const body = {
    app_id: process.env.ONESIGNAL_APP_ID,
    include_player_ids: profile.onesignal_ids,
    headings: { en: 'Service Turn' },
    contents: { en: 'Your next client is ready!' },
  };

  const r = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.ONESIGNAL_REST_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const resp: { invalid_player_ids?: string[] } = await r.json();

  /* 4 ▸ Prune stale device IDs, if any */
  if (resp.invalid_player_ids?.length) {
    await supabase
      .from('profiles')
      .update({
        onesignal_ids: profile.onesignal_ids.filter(
          (id: string) => !resp.invalid_player_ids!.includes(id)
        ),
      })
      .eq('id', employeeId);
  }

  if (!r.ok) {
    console.error('OneSignal REST error:', resp);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
