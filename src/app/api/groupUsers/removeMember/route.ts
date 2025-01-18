import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required.' },
        { status: 400 }
      );
    }

    // Remove the member from the group
    const { error } = await supabase.from('group_users').delete().eq('id', memberId);

    if (error) {
      console.error('Failed to remove member:', error.message);
      return NextResponse.json(
        { error: 'Failed to remove member.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Member removed successfully.' });
  } catch (error) {
    console.error('Error removing member:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
