import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const phone = searchParams.get('phone');

    if (!groupId || !phone) {
      return NextResponse.json(
        { error: 'Missing groupId or phone' },
        { status: 400 }
      );
    }

    // Query the client by phone number within the specified group
    const { data: client, error } = await supabase
      .from('clients')
      .select(
        `
          id,
          first_name,
          last_name,
          email,
          phone,
          client_group_details!inner(number_of_visits, last_visit_rating)
        `
      )
      .eq('phone', phone)
      .eq('client_group_details.group_id', groupId)
      .maybeSingle(); // Use maybeSingle to handle cases where no match is found

    if (error) {
      console.error('Error querying client by phone:', error);
      return NextResponse.json(
        { error: 'Failed to query client' },
        { status: 500 }
      );
    }

    if (!client) {
      // If no client is found, return null
      return NextResponse.json(null, { status: 200 });
    }

    // Return the client data
    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error('Error querying client by phone:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
