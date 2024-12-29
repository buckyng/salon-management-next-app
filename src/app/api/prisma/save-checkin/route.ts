import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { organizationId, clientId } = await request.json();

    if (!organizationId || !clientId) {
      return NextResponse.json(
        { error: 'Missing organizationId or clientId' },
        { status: 400 }
      );
    }

    // Save a new check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        clientid: clientId,
        organizationid: organizationId,
        createddate: new Date().toISOString().split('T')[0],
        isinservice: false,
      },
    });

    // Increment the client's number of visits
    await prisma.client.update({
      where: { id: clientId },
      data: {
        numberofvisits: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error('Error saving check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error'},
      { status: 500 }
    );
  }
}
