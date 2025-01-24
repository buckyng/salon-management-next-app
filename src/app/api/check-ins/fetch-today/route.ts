import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Missing groupId in query parameters' },
        { status: 400 }
      );
    }

    const today = getCurrentLocalDate();

    const { data: checkIns, error } = await supabase
      .from('check_ins')
      .select(
        `
      *,
      clients(first_name, last_name, phone, client_group_details(number_of_visits, last_visit_rating))
      `
      )
      .eq('group_id', groupId)
      .eq('created_date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching check-ins:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Unexpected error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
