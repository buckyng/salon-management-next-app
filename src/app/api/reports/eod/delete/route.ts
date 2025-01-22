import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createSupabaseClient();
  const { group_id, date } = await req.json();

  if (!group_id || !date) {
    return NextResponse.json(
      { error: 'Missing required fields: group_id or date' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('eod_reports')
    .delete()
    .eq('group_id', group_id)
    .eq('date', date);

  if (error) {
    return NextResponse.json(
      { error: `Failed to delete EOD report: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'EOD report deleted successfully' });
}
