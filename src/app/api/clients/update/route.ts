import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const { clientId, updatedClient } = await req.json();

    if (!clientId || !updatedClient) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseClient();

    const { error } = await supabase
      .from('clients')
      .update({
        first_name: updatedClient.first_name,
        last_name: updatedClient.last_name,
        phone: updatedClient.phone,
      })
      .eq('id', clientId);

    if (error) {
      console.error('Error updating client:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Unexpected error updating client:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
