import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const qp = new URL(req.url).searchParams;
  const groupId = qp.get('groupId');
  const date = qp.get('date'); // YYYY-MM-DD

  if (!groupId || !date)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('employee_turns')
    .select('id, user_id, created_at, completed')
    .eq('group_id', groupId)
    .eq('created_date', date)
    .order('created_at', { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
