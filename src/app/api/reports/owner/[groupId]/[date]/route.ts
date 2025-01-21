import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string; date: string } }
) {
  const supabase = await createSupabaseClient();

  try {
    const { groupId, date } = params;

    const { data, error } = await supabase
      .from('sales')
      .select('user_id, user_name, SUM(amount) as total_sales')
      .eq('group_id', groupId)
      .eq('created_date', date);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch report details' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(
      'Unexpected error in /api/reports/owner/[groupId]/[date]',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
