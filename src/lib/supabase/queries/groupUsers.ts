import { Membership, Role } from '@/lib/types';
import { createSupabaseClient } from '../server';

// Fetch all members for a given group
export const fetchMemberships = async (
  groupId: string
): Promise<Membership[]> => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('group_users')
    .select('id, user_id, role, created_at, profiles(name, email)')
    .eq('group_id', groupId);

  if (error) {
    console.error('Error fetching memberships:', error);
    throw new Error('Failed to fetch memberships.');
  }

  // Transform the data to ensure `profiles` is a single object
  const transformedData = data.map((item) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  }));

  return transformedData as Membership[];
};

// Fetch available roles
export const fetchRoles = async (): Promise<Role[]> => {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.from('roles').select('name');

  if (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Failed to fetch roles.');
  }

  return data as Role[];
};

// Update role for a member
export const updateMemberRole = async (
  memberId: string,
  newRole: string
): Promise<void> => {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from('group_users')
    .update({ role: newRole })
    .eq('id', memberId);

  if (error) {
    console.error('Error updating member role:', error);
    throw new Error('Failed to update member role.');
  }
};

// Remove a member
export const removeMember = async (memberId: string): Promise<void> => {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from('group_users')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Error removing member:', error);
    throw new Error('Failed to remove member.');
  }
};
