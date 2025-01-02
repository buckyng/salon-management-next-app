import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher-server';
import { CheckInClientDetails, FormattedCheckInResponse } from '@/lib/types';
import { getLocalDateRange } from '@/lib/utils/dateUtils';

const { startOfDay, endOfDay } = getLocalDateRange();

// Helper function to format check-in response
function formatCheckInResponse(
  checkIn: CheckInClientDetails
): FormattedCheckInResponse {
  return {
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
    })),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, organizationId, clientId, checkInId, isInService } = body;

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

      // Fetch formatted check-in with client details
      const savedCheckIn = await prisma.checkIn.findUnique({
        where: { id: checkIn.id },
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
                },
              },
            },
          },
        },
      });

      if (savedCheckIn) {
        const formattedCheckIn = formatCheckInResponse(savedCheckIn);

        // Trigger Pusher event for real-time updates
        await pusherServer.trigger(
          `organization-${organizationId}`,
          'check-in-added',
          formattedCheckIn
        );

        return NextResponse.json(formattedCheckIn);
      } else {
        console.error('Error: savedCheckIn is null');
        // Handle the null case appropriately
        return NextResponse.json(
          { error: 'savedCheckIn is null' },
          { status: 500 }
        );
      }
    }

    if (action === 'fetchCheckIns') {
      const checkIns = await prisma.checkIn.findMany({
        where: {
          organizationId,
          createdAt: {
            gte: startOfDay, // Start of local day in UTC
            lte: endOfDay, // End of local day in UTC
          },
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

      return NextResponse.json(checkIns.map(formatCheckInResponse));
    }

    if (action === 'updateCheckInService') {
      if (!checkInId || isInService === undefined || !organizationId) {
        return NextResponse.json(
          { error: 'Missing required parameters' },
          { status: 400 }
        );
      }

      // Update the check-in service status
      const updatedCheckIn = await prisma.checkIn.update({
        where: { id: checkInId },
        data: { isInService },
      });

      const detailedCheckIn = await prisma.checkIn.findUnique({
        where: { id: updatedCheckIn.id },
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

      if (detailedCheckIn) {
        const formattedCheckIn = formatCheckInResponse(detailedCheckIn);
        // Trigger Pusher event for real-time updates
        await pusherServer.trigger(
          `organization-${organizationId}`,
          'check-in-updated',
          {
            checkIn: formattedCheckIn,
          }
        );

        return NextResponse.json(formattedCheckIn);
      } else {
        console.error('Error: detailedCheckIn is null');
        // Handle the null case appropriately, e.g., return an error response or log
        return NextResponse.json(
          { error: 'detailedCheckIn is null' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error handling check-in action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
