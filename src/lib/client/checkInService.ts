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

export const fetchCheckIns = async (organizationId: string) => {
  try {
    const response = await fetch(`/api/prisma/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'fetchCheckIns', organizationId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch check-ins');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
};

export const updateCheckInService = async (
  organizationId: string,
  checkInId: string,
  isInService: boolean
) => {
  try {
    const response = await fetch(`/api/prisma/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateCheckInService',
        organizationId,
        checkInId,
        isInService,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update check-in');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating check-in:', error);
    return [];
  }
};
