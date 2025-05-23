import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { turnId } = await req.json();
    if (!turnId) {
      return NextResponse.json({ error: 'Missing turnId' }, { status: 400 });
    }

    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('employee_turns')
      .update({ completed: false })
      .eq('id', turnId);

    if (error) throw error;
    return NextResponse.json({ message: 'Turn reverted' });
  } catch (err) {
    console.error('Error undoing turn:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
