'use server';

import { createSupabaseClient } from '@/lib/supabase/server';
import { fetchUserData } from '@/lib/supabase/userUtils';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createSupabaseClient();

  try {
    const { authUser, dbUser } = await fetchUserData(supabase);
    return NextResponse.json({ authUser, dbUser });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
