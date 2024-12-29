import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clerkClient } from '@/lib/clerk';

export async function POST(request: Request) {
  try {
    const { organizationid } = await request.json();

    if (!organizationid) {
      return NextResponse.json(
        { error: 'Missing organizationId' },
        { status: 400 }
      );
    }

    const membershipsResponse =
      await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: organizationid,
      });

    // Extract the `data` array from the response
    const memberships = membershipsResponse.data;

    const upsertPromises = memberships.map((membership) => {
      // Safely check if publicUserData exists
      if (!membership.publicUserData || !membership.publicUserData.userId) {
        console.warn(
          `Skipping membership with missing publicUserData: ${JSON.stringify(
            membership
          )}`
        );
        return Promise.resolve();
      }
      prisma.organizationMembership.upsert({
        where: {
          userid_organizationid: {
            userid: membership.publicUserData.userId,
            organizationid,
          },
        },
        update: {
          role: membership.role,
        },
        create: {
          userid: membership.publicUserData.userId,
          organizationid,
          role: membership.role,
        },
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ message: 'Memberships synced successfully' });
  } catch (error) {
    console.error('Error syncing memberships:', error);
    return NextResponse.json(
      { error: 'Failed to sync memberships' },
      { status: 500 }
    );
  }
}
