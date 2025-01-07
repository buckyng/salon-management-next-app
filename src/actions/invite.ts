'use server';
import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();
  const body = await request.json();

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { email, role } = parsed.data;

  // Check if the user already exists
  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    console.error('Error checking existing user:', userError);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  let userId = existingUser?.id;

  // If user doesn't exist, create a new user
  if (!userId) {
    const { data: newUser, error: newUserError } = await supabase.auth.admin
      .createUser({
        email,
        password: 'password', // Temporary password
      });

    if (newUserError) {
      console.error('Error creating user:', newUserError);
      return NextResponse.json({ error: newUserError.message }, { status: 500 });
    }

    userId = newUser?.id;
  }

  // Add the user to the organization
  const { data, error: membershipError } = await supabase
    .from('organizationmemberships')
    .insert({
      user_id: userId,
      role,
      organization_id: '<ACTIVE_ORG_ID>', // Replace with the active org ID context
    });

  if (membershipError) {
    console.error('Error adding user to organization:', membershipError);
    return NextResponse.json(
      { error: membershipError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'User invited successfully' });
}
