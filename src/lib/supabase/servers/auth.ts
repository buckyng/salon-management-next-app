'use server';

import { createSupabaseClient } from '@/lib/supabase/server';
import { getErrorMessage } from '@/lib/utils';

export async function login(formData: FormData) {
  try {
    const { auth } = await createSupabaseClient();

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const { error } = await auth.signInWithPassword(data);

    // Handle errors during authentication
    if (error) {
      console.error('Login error:', error.message);
      return { errorMessage: getErrorMessage(error) };
    }

    // Successful login
    return { errorMessage: null };
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return { errorMessage: getErrorMessage(error) };
  }
}

export async function sendPasswordResetEmail(
  email: string
): Promise<{ errorMessage?: string }> {
  const supabase = await createSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  });

  if (error) {
    return { errorMessage: error.message };
  }

  return {};
}

export async function resetPassword(
  newPassword: string,
  code: string
): Promise<{ errorMessage?: string }> {
  const supabase = await createSupabaseClient();

  const { error: CodeError } = await supabase.auth.exchangeCodeForSession(code);

  if (CodeError) {
    return { errorMessage: CodeError.message };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { errorMessage: error.message };
  }

  return {};
}
