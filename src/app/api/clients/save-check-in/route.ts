import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const body = await req.json();
    const { groupId, clientId } = body;

    if (!groupId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();
    // Get local date in YYYY-MM-DD format
    const localDate = now.toLocaleDateString('en-CA'); // en-CA ensures ISO format YYYY-MM-DD

    const { error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        client_id: clientId,
        group_id: groupId,
        is_in_service: false,
        created_date: localDate,
      })
      .select('id')
      .single();

    if (checkInError) {
      console.error('Error saving check-in:', checkInError.message);
      return NextResponse.json(
        { error: checkInError.message },
        { status: 500 }
      );
    }

    // Increment the `number_of_visits` using the RPC function
    const { error: rpcError } = await supabase.rpc('increment_visits', {
      arg_client_id: clientId,
      arg_group_id: groupId,
    });

    if (rpcError) {
      console.error('Error incrementing number_of_visits:', rpcError.message);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Check-in saved and number_of_visits updated successfully.',
    });
  } catch (error) {
    console.error('Error saving check-in:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
