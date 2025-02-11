import { Tables } from '@/lib/database.types';
import { EnrichedCheckIn } from '@/lib/types';

type Client = Tables<'clients'>;

export const fetchClientByPhone = async ({
  groupId,
  phone,
}: {
  groupId: string;
  phone: string;
}): Promise<Client | null> => {
  const response = await fetch(
    `/api/clients/query-by-phone?groupId=${groupId}&phone=${phone}`
  );

  if (!response.ok) {
    return null; // Return null if client not found
  }

  return await response.json();
};

export const saveClient = async ({
  groupId,
  clientData,
  groupDetails,
}: {
  groupId: string;
  clientData: Partial<Client>;
  groupDetails: { agree_to_terms: boolean };
}): Promise<string> => {
  const response = await fetch('/api/clients/save-client', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, clientData, groupDetails }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save client.');
  }

  const { clientId } = await response.json();
  return clientId;
};

export const checkInClient = async ({
  groupId,
  clientId,
}: {
  groupId: string;
  clientId: string;
}): Promise<void> => {
  const response = await fetch('/api/clients/save-check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, clientId }),
  });

  if (!response.ok) {
    throw new Error('Failed to check in client.');
  }
};

export const fetchCheckInsToday = async (
  groupId: string
): Promise<EnrichedCheckIn[]> => {
  const response = await fetch(`/api/check-ins/fetch-today?groupId=${groupId}`);
  if (!response.ok) throw new Error('Failed to fetch check-ins');
  return await response.json();
};

export const fetchClientById = async (groupId: string, clientId: string) => {
  const response = await fetch(
    `/api/clients/fetch-by-id?groupId=${groupId}&clientId=${clientId}`
  );
  if (!response.ok) throw new Error('Failed to fetch client');
  return await response.json();
};

export const fetchClientCheckInHistory = async (
  groupId: string,
  clientId: string
) => {
  try {
    const response = await fetch(
      `/api/clients/${groupId}/${clientId}/check-in-history`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch check-in history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching client check-in history:', error);
    return [];
  }
};

export const updateClientInfo = async ({
  clientId,
  updatedClient,
}: {
  clientId: string;
  updatedClient: { first_name: string; last_name: string; phone: string };
}): Promise<boolean> => {
  const response = await fetch(`/api/clients/update`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, updatedClient }),
  });

  if (!response.ok) {
    console.error('Failed to update client information.');
    return false;
  }

  return true;
};
