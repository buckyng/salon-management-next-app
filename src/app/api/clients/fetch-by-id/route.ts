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

    // Use server-side join to fetch client details along with group-specific details
    const { data: client, error } = await supabase
      .from('clients')
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        email,
        created_at,
        updated_at,
        client_group_details!inner (
          number_of_visits,
          last_visit_rating
        )
      `
      )
      .eq('id', clientId)
      .eq('client_group_details.group_id', groupId)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to a simpler structure for the frontend
    const transformedClient = {
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      phone: client.phone,
      email: client.email,
      created_at: client.created_at,
      updated_at: client.updated_at,
      number_of_visits: client.client_group_details?.[0]?.number_of_visits || 0,
      last_visit_rating:
        client.client_group_details?.[0]?.last_visit_rating || null,
    };

    return NextResponse.json(transformedClient);
  } catch (error) {
    console.error('Unexpected error fetching client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
