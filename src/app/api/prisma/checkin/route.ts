import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const currentDate = new Date(); // Current date-time
const createdDate = new Date(currentDate.toISOString().split('T')[0]); // Midnight ISO-8601 format

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

    if (action === 'fetchCheckIns') {
      const checkIns = await prisma.checkIn.findMany({
        where: {
          organizationId,
          createdDate,
        },
        include: {
          Client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              numberOfVisits: true,
              lastVisitRating: true,
              CheckIn: {
                select: {
                  createdAt: true,
                  isInService: true,
                },
              },
            },
          },
        },
      });
      return NextResponse.json(
        checkIns.map((checkIn) => ({
          id: checkIn.id,
          createdAt: checkIn.createdAt,
          clientId: checkIn.clientId,
          clientName: `${checkIn.Client.firstName} ${checkIn.Client.lastName}`,
          clientPhone: checkIn.Client.phone,
          clientEmail: checkIn.Client.email,
          numberOfVisits: checkIn.Client.numberOfVisits || 0,
          lastCheckInRating: checkIn.Client.lastVisitRating || null,
          isInService: checkIn.isInService,
          checkInHistory: checkIn.Client.CheckIn.map((history) => ({
            createdAt: history.createdAt,
            isInService: history.isInService,
          })),
        }))
      );
    }
  } catch (error) {
    console.error('Error saving check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, organizationId, checkInId, isInService } = body;

    // Validate required fields based on action
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    if (action === 'updateCheckInService') {
      await prisma.checkIn.update({
        where: { id: checkInId },
        data: { isInService },
      });

      const checkIns = await prisma.checkIn.findMany({
        where: {
          organizationId,
          createdDate,
        },
        include: {
          Client: {
            select: {
              firstName: true,
              lastName: true,
              numberOfVisits: true,
              lastVisitRating: true,
            },
          },
        },
      });

      return NextResponse.json(
        checkIns.map((checkIn) => ({
          id: checkIn.id,
          createdAt: checkIn.createdAt,
          clientName: `${checkIn.Client.firstName} ${checkIn.Client.lastName}`,
          numberOfVisits: checkIn.Client.numberOfVisits || 0,
          lastCheckInRating: checkIn.Client.lastVisitRating || null,
          isInService: checkIn.isInService,
        }))
      );
    }
  } catch (error) {
    console.error('Error saving check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
