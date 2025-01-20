import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const reportData = await req.json();

    const { group_id, date } = reportData;

    if (!group_id || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: group_id or date' },
        { status: 400 }
      );
    }

    console.log('Saving EOD report:', reportData);

    const { error } = await supabase.from('eod_reports').insert(reportData);

    if (error) {
      console.error('Error saving EOD report:', error);
      return NextResponse.json(
        { error: 'Failed to save the EOD report' },
        { status: 500 }
      );
    }

    console.log('EOD Report saved successfully:', reportData);

    return NextResponse.json({ message: 'EOD report saved successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
