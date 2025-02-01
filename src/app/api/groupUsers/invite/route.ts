'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseClient } from '@/lib/supabase/server';

// Schema for validating the request body
const inviteSchema = z.object({
  email: z.string().email(),
  groupId: z.string().uuid(), // Ensure valid UUID for the group ID
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

    // If the user does not exist, call the edge function to create a new user
    if (!userId) {
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // Securely use service role key
        },
        body: JSON.stringify({ email, password: process.env.TEMP_PASSWORD }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from create-user edge function:', errorData);
        return NextResponse.json(
          { error: errorData.message || 'Failed to create user' },
          { status: 500 }
        );
      }

      const result = await response.json();

      userId = result.userId;

      if (!userId) {
        console.error('No userId returned from create-user function');
        return NextResponse.json(
          { error: 'Failed to retrieve user ID from create-user function' },
          { status: 500 }
        );
      }
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
