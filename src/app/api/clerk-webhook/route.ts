import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email_addresses, first_name, last_name, image_url } =
      body?.data;

    const email = email_addresses[0].email_address;
    console.log('👍', body);
    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        firstName: first_name,
        lastName: last_name,
        photoUrl: image_url,
      },
      create: {
        clerkId: id,
        email,
        firstName: first_name || '',
        lastName: last_name || '',
        photoUrl: image_url || '',
      },
    });

    return new NextResponse('User updated in database', { status: 200 });
  } catch (error) {
    console.error('Error updating database:', error);
  }
}
