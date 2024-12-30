import { SaveClientInput, SaveClientParams } from '../types';

export async function queryClientByPhone(
  organizationId: string,
  phone: string
): Promise<SaveClientInput | null> {
  try {
    const response = await fetch('/api/prisma/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'queryByPhone', organizationId, phone }),
    });

    if (response.status === 404) {
      // Return null if no client is found
      return null;
    }

    if (!response.ok) {
      // Handle other HTTP errors
      throw new Error(`Query failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error querying client by phone:', error);
    throw error; // Rethrow unexpected errors
  }
}

export async function saveClient({
  organizationId,
  clientData,
  clientId,
}: SaveClientParams): Promise<string> {
  try {
    const response = await fetch('/api/prisma/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'saveClient',
        organizationId,
        clientData,
        clientId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error === 'Invalid organizationId') {
        throw new Error('The specified organization does not exist.');
      }
      throw new Error(error.message || 'Failed to save client.');
    }

    const { clientId: savedClientId } = await response.json();
    return savedClientId; // Return the saved client's ID
  } catch (error) {
    console.error('Error saving client:', error);
    throw error;
  }
}
