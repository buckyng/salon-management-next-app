import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    if (!groupId || !employeeId || !date) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sales')
      .select('created_at, amount, note')
      .eq('group_id', groupId)
      .eq('user_id', employeeId)
      .eq('created_date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching detailed sales:', error);
      return NextResponse.json(
        { error: 'Failed to fetch detailed sales' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
