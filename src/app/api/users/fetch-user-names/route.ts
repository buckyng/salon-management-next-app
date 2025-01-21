import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const userIds = searchParams.get('userIds')?.split(',');

    if (!userIds || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required query parameter: userIds' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);

    if (error) {
      console.error('Error fetching user names:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user names.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error in /api/users/fetch-user-names:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
