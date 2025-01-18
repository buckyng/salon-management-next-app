import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required.' },
        { status: 400 }
      );
    }

    // Fetch memberships for the given group
    const { data: memberships, error } = await supabase
      .from('group_users')
      .select(
        `
        id,
        user_id,
        role,
        created_at,
        profiles (
          name,
          email
        )
      `
      )
      .eq('group_id', groupId);

    if (error) {
      console.error('Failed to fetch memberships:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch memberships for the group.' },
        { status: 500 }
      );
    }

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
