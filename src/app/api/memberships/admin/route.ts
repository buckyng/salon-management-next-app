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

    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_memberships')
      .select(
        `
        id,        
        created_at,
      `
      )
      .eq('organization_id', orgId);

    if (membershipsError) {
      console.error('Failed to fetch memberships:', membershipsError.message);
      return NextResponse.json(
        { error: 'Failed to fetch memberships for the organization' },
        { status: 500 }
      );
    }


    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
