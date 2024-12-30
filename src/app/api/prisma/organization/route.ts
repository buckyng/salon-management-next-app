import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, clerkId } = body;

    // Validate required fields based on action
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    if (action === 'getDbOrganizationId') {
      if (!clerkId) {
        return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
      }
      const organization = await prisma.organization.findUnique({
        where: { clerkId },
        select: { id: true },
      });

      if (!organization) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ dbOrganizationId: organization.id });
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
