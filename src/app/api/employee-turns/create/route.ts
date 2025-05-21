import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { groupId, userId } = await req.json();

    /* 🔹 validate body */
    if (!groupId || !userId) {
      return NextResponse.json(
        { error: 'groupId and userId are required' },
        { status: 400 }
      );
    }

    const localDate = getCurrentLocalDate();

    const payload = {
      group_id: groupId,
      user_id: userId,
      created_date: localDate,
    };

    /* 🔹 insert & return the new row */
    const { data, error } = await supabase
      .from('employee_turns')
      .insert(payload)
      .select('id, user_id, created_at, completed')
      .single();

    if (error) {
      console.error('Error creating turn:', error);
      return NextResponse.json(
        { error: 'Failed to create turn' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error in /api/employee-turns/create:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
