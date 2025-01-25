import { validateInviteToken } from '@/lib/supabase/services/inviteService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const { groupId } = await validateInviteToken(token);
    return NextResponse.json({ groupId });
  } catch (error) {
    console.error('Unexpected error validate invite link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
