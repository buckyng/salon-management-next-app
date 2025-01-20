import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!groupId || !employeeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    const startTimestamp = startOfDay(parseISO(startDate)).toISOString();
    const endTimestamp = endOfDay(parseISO(endDate)).toISOString();

    const { data: sales, error } = await supabase
      .from('sales')
      .select('created_at, amount')
      .eq('group_id', groupId)
      .eq('user_id', employeeId)
      .gte('created_at', startTimestamp)
      .lte('created_at', endTimestamp);

    if (error) {
      console.error('Error fetching sales data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Process the data to group by date and calculate total sales
    const salesByDate: Record<string, number> = {};
    sales.forEach((sale) => {
      const date = new Date(sale.created_at).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD
      if (!salesByDate[date]) salesByDate[date] = 0;
      salesByDate[date] += sale.amount;
    });

    const result = Object.keys(salesByDate).map((date) => ({
      date,
      totalSales: salesByDate[date],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
