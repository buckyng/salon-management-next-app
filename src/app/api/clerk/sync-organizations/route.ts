import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clerkClient } from '@/lib/clerk';

export async function POST() {
  try {
    // Fetch the list of organizations from Clerk
    const organizationsResponse =
      await clerkClient.organizations.getOrganizationList();

    // Safely access the organizations data
    const organizations = organizationsResponse.data;

    if (!organizations || organizations.length === 0) {
      return NextResponse.json(
        { message: 'No organizations found in Clerk' },
        { status: 404 }
      );
    }

    // Prepare upsert promises for Prisma
    const upsertPromises = organizations.map((org) => {
      // Safely extract and validate logoUrl
      const logoUrl =
        typeof org.publicMetadata?.logoUrl === 'string'
          ? org.publicMetadata.logoUrl
          : null;

      return prisma.organization.upsert({
        where: { id: org.id },
        update: {
          name: org.name,
          logoUrl,
        },
        create: {
          id: org.id,
          name: org.name,
          createdAt: new Date(org.createdAt),
          logoUrl: logoUrl || '',
          clerkId: org.id, 
        },
      });
    });

    // Execute all upserts concurrently
    await Promise.all(upsertPromises);

    return NextResponse.json({ message: 'Organizations synced successfully' });
  } catch (error) {
    console.error('Error syncing organizations:', error);
    return NextResponse.json(
      { error: 'Failed to sync organizations' },
      { status: 500 }
    );
  }
}
