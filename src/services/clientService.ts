import { Tables } from '@/lib/database.types';

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
