import prisma from '@/lib/prisma';
import { SaveCheckInParams } from '../types';

export async function saveCheckIn({
  organizationId,
  clientId,
}: SaveCheckInParams) {
  try {
    // Save a new check-in
    await prisma.checkIn.create({
      data: {
        clientid: clientId,
        organizationid: organizationId,
        createddate: new Date().toISOString().split('T')[0], // Store only the date (e.g., "YYYY-MM-DD")
        isinservice: false, // Default value for `isinservice`
      },
    });

    // Increment the client's number of visits
    await prisma.client.update({
      where: { id: clientId },
      data: {
        numberofvisits: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw new Error('Failed to save check-in.');
  }

  try {
    const response = await fetch('/api/prisma/save-checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        clientId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save check-in.');
    }
    console.log('Check-in saved successfully');
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
}
