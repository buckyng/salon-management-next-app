import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params }: { params: { groupId: string; date: string } }
) {
  const supabase = await createSupabaseClient();

  const { groupId, date } = params;

  try {
    const { data, error } = await supabase
      .from('eod_reports')
      .select('*')
      .eq('group_id', groupId)
      .eq('date', date)
      .single();

    if (error) {
      console.error('Error fetching EOD report:', error);
      return NextResponse.json(
        { error: 'Failed to fetch EOD report data' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No EOD report found for the selected date' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching EOD report:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
