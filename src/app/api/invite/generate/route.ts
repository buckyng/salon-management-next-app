// route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createSupabaseClient();
  const { groupId, email } = await req.json();

  if (!groupId || !email) {
    return NextResponse.json(
      { error: 'Group ID and email are required.' },
      { status: 400 }
    );
  }

  const inviteToken = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const { error } = await supabase
    .from('invite_links')
    .insert([
      {
        group_id: groupId,
        invite_token: inviteToken,
        email,
        expires_at: expiresAt,
      },
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invite?token=${inviteToken}`;
  // Send email (Use your email sending service here)
  await sendInviteEmail(email, inviteLink);

  return NextResponse.json({ message: 'Invitation sent successfully!' });
}

async function sendInviteEmail(email: string, inviteLink: string) {
  // Implement your email sending logic here (e.g., SendGrid, AWS SES)
  console.log(`Sending invite to ${email}: ${inviteLink}`);
}
