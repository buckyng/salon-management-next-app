import { SaveCheckInParams } from '../types';

export async function saveCheckIn({
  organizationId,
  clientId,
}: SaveCheckInParams) {
  try {
    const response = await fetch('/api/prisma/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'saveCheckin',
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
