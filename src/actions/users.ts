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

    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return { errorMessage: getErrorMessage(error) };
  }
}
