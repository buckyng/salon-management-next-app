import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { playerId } = await req.json();
  if (!playerId)
    return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(); // current session
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  /* 🔹  INSERT the id into the array column */
  const { error } = await supabase.rpc('add_unique_player_id', {
    uid: user.id,
    pid: playerId,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
