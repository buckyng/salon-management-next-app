import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseClient();

  // Fetch the currently authenticated user from auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  // Fetch the user from the `users` table using `auth_id`
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (dbError || !dbUser) {
    return NextResponse.json(
      { error: 'User not found in the database' },
      { status: 404 }
    );
  }

  // Fetch organization memberships for the user
  const { data: memberships, error: membershipsError } = await supabase
    .from('organizationmemberships')
    .select(
      `
      id,
      role,
      organizations (id, name)
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
}
