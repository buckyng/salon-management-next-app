import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const body = await req.json();
    const { checkInId, groupId, isInService } = body;

    if (!checkInId || groupId === undefined || isInService === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('check_ins')
      .update({ is_in_service: isInService })
      .eq('id', checkInId)
      .eq('group_id', groupId);

    if (error) {
      console.error('Error updating service status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Service status updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error updating service status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
