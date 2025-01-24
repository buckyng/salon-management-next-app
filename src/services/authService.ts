import { createSupabaseClient } from '@/lib/supabase/client';

export const updateUserProfile = async ({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string;
}): Promise<void> => {
  const supabase = await createSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    data: { name, avatar_url: avatarUrl },
  });

  if (error) {
    throw new Error('Failed to update profile.');
  }
};

export const changeUserPassword = async ({
  email,
  currentPassword,
  newPassword,
}: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  const supabase = await createSupabaseClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Current password is incorrect.');
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (passwordError) {
    throw new Error('Failed to update password.');
  }
};

export const logoutUser = async (): Promise<void> => {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.signOut();
  //remove all localStorage data
  localStorage.clear();

  if (error) {
    throw new Error('Failed to log out.');
  }
};
