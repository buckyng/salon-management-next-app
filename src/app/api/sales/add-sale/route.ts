import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { groupId, userId, amount, comboNum, note } = await req.json();

    if (!groupId || !userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const localDate = getCurrentLocalDate();

    const { error } = await supabase.from('sales').insert({
      group_id: groupId,
      user_id: userId,
      amount,
      combo_num: comboNum,
      created_date: localDate,
      note,
    });

    if (error) {
      console.error('Error inserting sale:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sale added successfully' });
  } catch (error) {
    console.error('Unexpected error adding sale:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
