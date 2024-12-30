import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, organizationId, phone, clientData, clientId } = body;

    // Validate required fields based on action
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    if (action === 'queryByPhone') {
      // Validate required fields for querying by phone
      if (!organizationId || !phone) {
        return NextResponse.json(
          { error: 'Missing parameters for queryByPhone' },
          { status: 400 }
        );
      }

      const client = await prisma.client.findFirst({
        where: {
          phone,
          organizationId,
        },
        select: {
          phone: true,
          firstName: true,
          lastName: true,
          email: true,
          agreeToTerms: true,
          id: true,
        },
      });

      if (!client) {
        return NextResponse.json(null, { status: 404 });
      }

      return NextResponse.json({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || undefined,
        agreeToTerms: client.agreeToTerms,
        phone: client.phone,
        id: client.id,
      });
    }

    if (action === 'saveClient') {
      // Validate required fields for saving a client
      if (!organizationId || !clientData) {
        return NextResponse.json(
          { error: 'Missing organizationId or clientData' },
          { status: 400 }
        );
      }

      // Validate that the organization exists
      const organizationExists = await prisma.organization.findUnique({
        where: { id: organizationId },
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
            organizationId,
          },
        });
        return NextResponse.json({ clientId: updatedClient.id });
      } else {
        // Create a new client
        const newClient = await prisma.client.create({
          data: {
            ...clientData,
            organizationId,
          },
        });

        return NextResponse.json({ clientId: newClient.id });
      }
    }

    // If action is not recognized
    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
