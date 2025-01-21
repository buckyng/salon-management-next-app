import { createSupabaseClient } from '../client';

export async function handleLogout() {
  const supabase = createSupabaseClient();

  try {
    // Sign out the user from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error.message);
      throw error;
    }

    // Clear all localStorage items
    localStorage.clear();
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}
