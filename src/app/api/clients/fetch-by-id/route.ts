import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const groupId = searchParams.get('groupId');

    if (!clientId || !groupId) {
      return NextResponse.json(
        { error: 'Missing clientId or groupId in query parameters' },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from('clients')
      .select('*, client_group_details(number_of_visits, last_visit_rating)')
      .eq('id', clientId)
      .eq('client_group_details.group_id', groupId)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Unexpected error fetching client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
