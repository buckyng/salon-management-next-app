import { createSupabaseClient } from '../client';

type UpdateUserDetailsProps = {
  dbUserId: string;
  name: string;
  avatarUrl: string;
};

export async function updateUserDetails({
  dbUserId,
  name,
  avatarUrl,
}: UpdateUserDetailsProps) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('users')
    .update({
      name,
      avatar_url: avatarUrl,
    })
    .eq('id', dbUserId);

  return error;
}
