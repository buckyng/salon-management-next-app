import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { organizationid, clientData, clientId } = await request.json();

    if (!organizationid || !clientData) {
      return NextResponse.json(
        { error: 'Missing organizationId or clientData' },
        { status: 400 }
      );
    }

    // Validate that the organization exists
    const organizationExists = await prisma.organization.findUnique({
      where: { id: organizationid },
    });

    if (!organizationExists) {
      return NextResponse.json(
        { error: 'Invalid organizationId' },
        { status: 400 }
      );
    }

    if (clientId) {
      // Update existing client
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: {
          ...clientData,
          organizationid,
        },
      });
      return NextResponse.json({ clientId: updatedClient.id });
    } else {
      // Create a new client
      const newClient = await prisma.client.create({
        data: {
          ...clientData,
          organizationid,
        },
      });

      return NextResponse.json({ clientId: newClient.id });
    }
  } catch (error) {
    console.error('Error saving client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
