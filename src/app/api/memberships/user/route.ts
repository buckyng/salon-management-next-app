'use server';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { fetchUserData } from '@/lib/supabase/userUtils';

export async function GET() {
  const supabase = await createSupabaseClient();

  try {
    const { dbUser } = await fetchUserData(supabase);

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in the database' },
        { status: 401 }
      );
    }

    // Fetch all memberships for the current user
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_memberships')
      .select(
        `
        id,
        role_id,
        created_at,
        organizations (id, name),
        roles (name)
      `
      )
      .eq('user_id', dbUser.id);

    if (membershipsError) {
      return NextResponse.json(
        { error: 'Failed to fetch memberships' },
        { status: 500 }
      );
    }

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching user memberships:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
