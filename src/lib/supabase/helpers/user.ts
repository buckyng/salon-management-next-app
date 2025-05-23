import { createSupabaseClient } from '../client';

type UpdateUserDetailsProps = {
  userId: string;
  name: string;
  avatarUrl: string;
  phone: string;
};

export async function updateUserDetails({
  userId,
  name,
  avatarUrl,
  phone
}: UpdateUserDetailsProps) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      name,
      avatar_url: avatarUrl,
      phone,
    })
    .eq('id', userId);

  return error;
}

/**
 * Fetch the name of a user based on their user ID.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the user's name or "Unknown User" if not found.
 */
export const fetchUserName = async (userId: string): Promise<string> => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error fetching user name for userId ${userId}:`, error);
    return 'Unknown User';
  }

  return data?.name || 'Unknown User';
};

