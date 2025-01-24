'use server';

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const isDevelopment = process.env.NODE_ENV === 'development';
const tempPassword = '12345678Temp';

// Schema for validating the request body
const inviteSchema = z.object({
  email: z.string().email(),
  groupId: z.string().uuid(), // Ensure valid UUID for the organization ID
});

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();
  const body = await request.json();

  // Validate the request body against the schema
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { groupId, email } = parsed.data;

  try {
    // Check if the user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
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
      const { data: newUser, error: newUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password: tempPassword, // Use a temporary password
          email_confirm: !isDevelopment,
        });

      if (newUserError) {
        console.error('Error creating user:', newUserError);
        return NextResponse.json(
          { error: newUserError.message },
          { status: 500 }
        );
      }

      userId = newUser.user?.id;
    }

    // Add the user to the organization
    const role = 'employee'; // Default role for new members

    const { error: membershipError } = await supabase
      .from('group_users')
      .insert({
        user_id: userId,
        role,
        group_id: groupId,
      });

    if (membershipError) {
      console.error('Error adding user to organization:', membershipError);
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'User invited successfully' });
  } catch (error: unknown) {
    console.error('Unexpected error inviting user:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
