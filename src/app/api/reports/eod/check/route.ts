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

    const { data, error } = await supabase.rpc('check_eod_report_exists', {
      group_id_input: groupId,
      date_input: date,
    });

    if (error) {
      console.error('Error calling check_eod_report_exists function:', error);
      return NextResponse.json(
        { error: 'Failed to check report existence' },
        { status: 500 }
      );
    }

    return NextResponse.json({ exists: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
