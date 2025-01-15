'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { fetchUserData } from '@/lib/supabase/userUtils';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    const { dbUser } = await fetchUserData(supabase);

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in the database' },
        { status: 401 }
      );
    }

    // Fetch memberships for the organization

    console.log('Fetching memberships for organization:', orgId);
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_memberships')
      .select(
        `
        id,
        role_id,
        created_at,
        users (id, email, name),
        organizations (id, name),
        roles (name)
      `
      )
      .eq('organization_id', orgId);

    if (membershipsError) {
      return NextResponse.json(
        { error: 'Failed to fetch memberships for the organization' },
        { status: 500 }
      );
    }

    console.log('Fetched memberships:', memberships);

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
