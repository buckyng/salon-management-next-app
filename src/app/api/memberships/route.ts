'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import { fetchUserData } from '@/lib/supabase/userUtils';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    const { dbUser } = await fetchUserData(supabase);

    if (!orgId) {
      // Fetch all memberships for the current user
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_memberships')
        .select(
          `
          id,
          role_id,
          created_at,
          organizations (id, name),
          roles (name)
        `
        )
        .eq('user_id', dbUser.id);

      if (membershipsError) {
        return NextResponse.json(
          { error: 'Failed to fetch memberships' },
          { status: 500 }
        );
      }

      return NextResponse.json(memberships);
    }

    // Check the user's role for the organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select(
        `
        role_id,
        roles (name) -- Include role name
      `
      )
      .eq('user_id', dbUser.id)
      .eq('organization_id', orgId)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membership not found for the user' },
        { status: 403 }
      );
    }

    const isAdmin = membership.roles.name === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You do not have access to view this organization' },
        { status: 403 }
      );
    }

    // Admin users can fetch all memberships for the organization
    const { data: orgMemberships, error: orgMembershipsError } = await supabase
      .from('organization_memberships')
      .select(
        `
        id,
        role_id,
        created_at,
        users (id, email, name),
        organizations (id, name),
        roles (name)
      `
      )
      .eq('organization_id', orgId);

    if (orgMembershipsError) {
      return NextResponse.json(
        { error: 'Failed to fetch memberships for the organization' },
        { status: 500 }
      );
    }

    return NextResponse.json(orgMemberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { id, roleId } = await req.json();

    if (!id || !roleId) {
      return NextResponse.json(
        { error: 'Missing membership ID or role ID' },
        { status: 400 }
      );
    }

    const { data: updatedMembership, error } = await supabase
      .from('organization_memberships')
      .update({ role_id: roleId })
      .eq('id', id)
      .select(
        `
        id,
        role_id,
        created_at,
        roles (name) -- Include role name
      `
      )
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
      .from('organization_memberships')
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
