import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, organizationId, clientId } = body;

    // Validate required fields based on action
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    if (action === 'saveCheckin') {
      // Save a new check-in
      const currentDate = new Date(); // Current date-time
      const createdDate = new Date(currentDate.toISOString().split('T')[0]); // Midnight ISO-8601 format
      const checkIn = await prisma.checkIn.create({
        data: {
          clientId,
          organizationId,
          createdDate,
          isInService: false,
        },
      });

      // Increment the client's number of visits
      await prisma.client.update({
        where: { id: clientId },
        data: {
          numberOfVisits: {
            increment: 1,
          },
        },
      });
      return NextResponse.json(checkIn);
    }
  } catch (error) {
    console.error('Error saving check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
