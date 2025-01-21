import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');

    if (!groupId || !date || !employeeId) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sales')
      .select('id, amount, created_at, note, combo_num')
      .eq('group_id', groupId)
      .eq('created_date', date)
      .eq('user_id', employeeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sales for employee:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sales for the employee.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(
      'Unexpected error in /api/reports/sales-for-employee:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
