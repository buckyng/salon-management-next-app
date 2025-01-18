import { createSupabaseClient } from '../client';

export async function handleLogout() {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error during logout:', error.message);
    throw error;
  }
}
