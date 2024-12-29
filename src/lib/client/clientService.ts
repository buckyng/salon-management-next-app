import { SaveClientInput } from '../types';

export async function queryClientByPhone(
  organizationid: string,
  phone: string
): Promise<SaveClientInput | null> {
  try {
    const response = await fetch('/api/prisma/query-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organizationid, phone }),
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

interface SaveClientParams {
  organizationid: string;
  clientData: {
    firstname: string;
    lastname: string;
    phone: string;
    email?: string;
    agreetoterms: boolean;
  };
  clientId?: string; // Optional for updates
}

export async function saveClient({
  organizationid,
  clientData,
  clientId,
}: SaveClientParams): Promise<string> {
  try {
    const response = await fetch('/api/prisma/save-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationid,
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
