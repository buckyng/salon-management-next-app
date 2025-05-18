import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  upsertWeekday,
  deleteWeekday,
} from '@/services/employeeScheduleService';

const BodySchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  weekday: z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
  checked: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const body = BodySchema.parse(await req.json());

    const result = body.checked
      ? await upsertWeekday(body.groupId, body.userId, body.weekday)
      : await deleteWeekday(body.groupId, body.userId, body.weekday);

    if (result.error) {
      console.error('Schedule toggle error:', result.error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Invalid payload for toggle-weekday:', e);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
