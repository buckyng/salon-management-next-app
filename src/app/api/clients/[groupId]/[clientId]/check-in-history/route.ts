import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/clients/[clientId]/check-in-history
 * Fetches check-in history for a specific client.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string; clientId: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const { groupId, clientId } = params;

    if (!clientId || !groupId) {
      return NextResponse.json(
        { error: 'Client ID && groupId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('check_ins')
      .select(
        `
        id, 
        client_id, 
        created_at        
      `
      )
      .eq('group_id', groupId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching check-in history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch check-in history' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
