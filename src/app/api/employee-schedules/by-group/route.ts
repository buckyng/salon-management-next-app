import { NextRequest, NextResponse } from 'next/server';
import { listSchedulesByGroup } from '@/services/employeeScheduleService';

export async function GET(req: NextRequest) {
  const groupId = new URL(req.url).searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
  }

  const { data, error } = await listSchedulesByGroup(groupId);
  if (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}
