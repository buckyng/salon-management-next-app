import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET || '';
  if (!SIGNING_SECRET) {
    throw new Error(
      'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  // Process webhook payload
  try {
    const { type, data } = evt;

    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = data;
        const email = email_addresses[0]?.email_address || '';

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
        console.log(`Processed user event: ${type}`);
        break;
      }
      case 'user.deleted': {
        const { id } = data;

        const existingUser = await prisma.user.findUnique({
          where: { clerkId: id },
        });

        if (existingUser) {
          await prisma.user.delete({
            where: { clerkId: id },
          });
          console.log(`Processed user deletion for Clerk ID: ${id}`);
        } else {
          console.warn(`User with Clerk ID ${id} does not exist.`);
        }
        break;
      }

      case 'organization.created':
      case 'organization.updated': {
        const { id, name, created_at, image_url } = data;

        await prisma.organization.upsert({
          where: { clerkId: id },
          update: {
            name,
            logoUrl: image_url || '',
          },
          create: {
            clerkId: id,
            name,
            createdAt: new Date(created_at),
            logoUrl: image_url || '',
          },
        });
        console.log(`Processed organization event: ${type}`);
        break;
      }

      case 'organization.deleted': {
        const { id } = data;

        const existingOrg = await prisma.organization.findUnique({
          where: { clerkId: id },
        });

        if (existingOrg) {
          await prisma.organization.delete({
            where: { clerkId: id },
          });
          console.log(`Processed organization deletion for Clerk ID: ${id}`);
        } else {
          console.warn(`Organization with Clerk ID ${id} does not exist.`);
        }
        break;
      }

      default:
        console.warn(`Unhandled event type: ${type}`);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Error: Failed to process webhook', {
      status: 500,
    });
  }
}
