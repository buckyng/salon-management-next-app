import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseClient();

  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch roles:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch roles.' },
        { status: 500 }
      );
    }

    return NextResponse.json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);

    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
