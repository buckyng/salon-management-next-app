import { createSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, groupId, token } = await req.json();

    if (!email || !password || !groupId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseClient();

    // Validate the invite token
    const { data: invite, error: inviteError } = await supabase
      .from('invite_links')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite token' },
        { status: 400 }
      );
    }

    // Register the user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Extract user from the data
    const { user } = data || {};

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User is not authenticated or missing an ID.' },
        { status: 400 }
      );
    }

    const { error: tenantError } = await supabase
      .from('group_users')
      .insert([{ group_id: groupId, user_id: user.id, role: 'employee' }]);

    if (tenantError) {
      return NextResponse.json({ error: tenantError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in /api/register:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
