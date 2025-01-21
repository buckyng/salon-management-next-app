import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const date = searchParams.get('date');

    if (!groupId || !date) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sales')
      .select('id, amount, combo_num, note, created_at, user_id')
      .eq('group_id', groupId)
      .eq('created_date', date);

    if (error) {
      console.error('Error fetching sales:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error in /api/reports/owner/details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
