import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { turnId } = await req.json();

    /* 🔸 Validate body */
    if (!turnId) {
      return NextResponse.json(
        { error: 'turnId is required' },
        { status: 400 }
      );
    }

    /* 🔸 Mark the turn as completed */
    const { data, error } = await supabase
      .from('employee_turns')
      .update({ completed: true })
      .eq('id', turnId)
      .select('id, user_id, created_at, completed')
      .single();

    if (error) {
      console.error('Error completing turn:', error);
      return NextResponse.json(
        { error: 'Failed to complete turn' },
        { status: 500 }
      );
    }

    /* Return the updated row so the UI can reflect the change */
    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error in /api/employee-turns/complete:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
