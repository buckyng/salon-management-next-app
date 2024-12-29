import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json(); // Parse the JSON body
    console.log('Request Body:', body); // Log the parsed body

    const { organizationid, phone } = body;

    if (!organizationid || !phone) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        phone,
        organizationid,
      },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        agreetoterms: true,
      },
    });

    if (!client) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json({
      firstName: client.firstname,
      lastName: client.lastname,
      email: client.email || undefined,
      agreeToTerms: client.agreetoterms,
    });
  } catch (error) {
    console.error('Error querying client by phone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
