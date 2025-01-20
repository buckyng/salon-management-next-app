import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const date = searchParams.get('date');
    const paid = searchParams.get('paid');

    if (!groupId || !date) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('sales')
      .select(
        'id, amount, combo_num, note, created_at, user_id, paid, profiles(name)'
      )
      .eq('group_id', groupId)
      .eq('created_date', date);

    if (paid !== null) {
      const isPaid = paid === 'true';
      query = query.eq('paid', isPaid);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sales:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
