import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId'); // required
    const weekday = searchParams.get('weekday'); // monday…sunday (lowercase)

    if (!groupId || !weekday) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    /* 1 ▸ Which users are scheduled today? */
    const { data: schedules, error: schErr } = await supabase
      .from('employee_schedules')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('weekday', weekday);

    if (schErr) {
      console.error('Error fetching schedules:', schErr);
      return NextResponse.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      );
    }

    const userIds = (schedules ?? []).map((s) => s.user_id);
    if (userIds.length === 0) return NextResponse.json([]); // nobody scheduled

    /* 2 ▸ Pull their profile info */
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);

    if (profErr) {
      console.error('Error fetching profiles:', profErr);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    return NextResponse.json(profiles ?? []);
  } catch (err) {
    console.error('Unexpected error in /api/employee-turns/employees:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
