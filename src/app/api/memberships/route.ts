'use server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId'); // Get orgId from query params

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user details from the users table
    const { data: dbUser, error: dbUserError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (dbUserError || !dbUser) {
      return NextResponse.json(
        { error: 'Failed to fetch user from the database' },
        { status: 500 }
      );
    }

    // Verify the user has admin access to the organization
    const { data: membership, error: membershipError } = await supabase
      .from('organizationmemberships')
      .select('role')
      .eq('user_id', dbUser.id)
      .eq('organization_id', orgId)
      .eq('role', 'admin') // Ensure the user has the admin role
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You do not have admin access to this organization' },
        { status: 403 }
      );
    }

    // Fetch all users for the organization
    const { data: users, error: usersError } = await supabase
      .from('organizationmemberships')
      .select(
        `
        id,
        role,
        created_at,
        users (id, email, name),
        organizations (id, name)
      `
      )
      .eq('organization_id', orgId);

    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to fetch users for the organization' },
        { status: 500 }
      );
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching organization users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { id, role } = await req.json();

    if (!id || !role) {
      return NextResponse.json(
        { error: 'Missing membership ID or role' },
        { status: 400 }
      );
    }

    const { data: updatedMembership, error } = await supabase
      .from('organizationmemberships')
      .update({ role })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing membership ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('organizationmemberships')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete membership' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    console.error('Error deleting membership:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
