import { createSupabaseClient } from '../client';

export const updateGroupDetails = async ({
  groupId,
  logoUrl,
}: {
  groupId: string;
  logoUrl: string;
}): Promise<string | null> => {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('groups')
    .update({ logo_url: logoUrl })
    .eq('id', groupId);

  return error ? error.message : null;
};
