import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { memberId, newRole } = await req.json();

    if (!memberId || !newRole) {
      return NextResponse.json(
        { error: 'Member ID and new role are required.' },
        { status: 400 }
      );
    }

    // Update the role of the member
    const { error } = await supabase
      .from('group_users')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      console.error('Failed to update role:', error.message);
      return NextResponse.json(
        { error: 'Failed to update member role.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Role updated successfully.' });
  } catch (error) {
    console.error('Error updating role:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
