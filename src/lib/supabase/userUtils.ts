import { SupabaseClient, User } from '@supabase/supabase-js';

interface DbUser {
  id: string; // Primary key from the `public.users` table
  auth_id: string; // Auth ID linked to the Supabase `auth.users` table
  email?: string; // Additional fields if needed
  name?: string;
  created_at?: string; // Adjust according to your schema
}

interface FetchedUser {
  authUser: User; // Authenticated user from Supabase
  dbUser: DbUser; // User details from the `public.users` table
}

export async function fetchUserData(
  supabase: SupabaseClient
): Promise<FetchedUser> {
  // Fetch the authenticated user
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new Error('User not authenticated');
  }

  // Fetch user details from public.users
  const { data: dbUser, error: dbUserError } = await supabase
    .from('users')
    .select('id, auth_id, email, name, created_at') // Define fields explicitly
    .eq('auth_id', authUser.id)
    .single();

  if (dbUserError || !dbUser) {
    throw new Error('Failed to fetch user from the database');
  }

  return { authUser, dbUser };
}
