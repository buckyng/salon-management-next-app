import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string; date: string; employeeId: string } }
) {
  const supabase = await createSupabaseClient();

  try {
    const { groupId, date, employeeId } = params;

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('group_id', groupId)
      .eq('created_date', date)
      .eq('user_id', employeeId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(
      'Unexpected error in /api/reports/owner/[groupId]/[date]/[employeeId]',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
