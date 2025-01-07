'use server';
import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('roles')
      .select('name')
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      console.error('No roles found or data is null');
      return NextResponse.json({ error: 'No roles found' }, { status: 404 });
    }

    console.log('Roles Data:', data);

    const roles = data.map((role) => role.name);
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
