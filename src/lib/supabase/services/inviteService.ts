import { v4 as uuidv4 } from 'uuid';
import { createSupabaseClient } from '../server';

export const generateInviteLink = async (
  groupId: string,
  expiresInHours = 24
): Promise<string> => {
  const supabase = await createSupabaseClient();
  const inviteToken = uuidv4();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const { error } = await supabase
    .from('invite_links')
    .insert([
      { group_id: groupId, invite_token: inviteToken, expires_at: expiresAt },
    ]);

  if (error) {
    throw new Error(`Error creating invite link: ${error.message}`);
  }

  return `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invite?token=${inviteToken}`;
};

export const validateInviteToken = async (
  token: string
): Promise<{ groupId: string }> => {
  const supabase = await createSupabaseClient();

  const { data: invite, error } = await supabase
    .from('invite_links')
    .select('*')
    .eq('invite_token', token)
    .single();

  if (error || !invite) {
    throw new Error('Invalid or expired invite token.');
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new Error('Invite token has expired.');
  }

  return { groupId: invite.group_id };
};
