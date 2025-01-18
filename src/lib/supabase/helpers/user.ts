import { createSupabaseClient } from '../client';

type UpdateUserDetailsProps = {
  userId: string;
  name: string;
  avatarUrl: string;
};

export async function updateUserDetails({
  userId,
  name,
  avatarUrl,
}: UpdateUserDetailsProps) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      name,
      avatar_url: avatarUrl,
    })
    .eq('id', userId);

  return error;
}
