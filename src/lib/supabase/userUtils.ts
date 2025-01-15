import { SupabaseClient, User } from '@supabase/supabase-js';
import { Tables } from '../database.types';

interface FetchedUser {
  authUser: User; // Authenticated user from Supabase
  dbUser: Tables<'users'>; // User details from the `public.users` table
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

  console.log('authUser:', authUser);

  // Fetch user details from public.users
  const { data: dbUser, error: dbUserError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single();

  if (dbUserError || !dbUser) {
    throw new Error('Failed to fetch user from the database');
  }

  console.log('dbUser:', dbUser);

  return { authUser, dbUser };
}
