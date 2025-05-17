import { useState } from 'react';
import { useGroup } from '@/context/GroupContext';
import { Tables } from '@/lib/database.types';
import { toast } from 'react-toastify';
import {
  fetchClientByPhone,
  saveClient,
  checkInClient,
} from '@/services/clientService';

type Client = Tables<'clients'>;

export const useCheckInLogic = () => {
  const { activeGroup } = useGroup();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setPhoneNumber('');
    setClient(null);
    setStep(1);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !activeGroup?.id) return;

    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const clientData = await fetchClientByPhone({
        groupId: activeGroup.id,
        phone: phoneNumber,
      });

      setClient(clientData);

      if (clientData) {
        //if clientData is found, checkin the client
        handleCheckIn(clientData.id);
      } else {
        //if clientData is not found, set step to 2
        setStep(2);
      }
    } catch (error) {
      console.error('Error querying client:', error);
      toast.error('Failed to fetch client.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSave = async (
    clientData: Partial<Client>,
    groupDetails: { agree_to_terms: boolean }
  ) => {
    setLoading(true);
    try {
      if (!activeGroup?.id) {
        throw new Error('Missing organizationId');
      }

      const clientId = await saveClient({
        groupId: activeGroup.id,
        clientData,
        groupDetails,
      });

      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInExistingClient = async (updatedClient: Client) => {
    setLoading(true);
    try {
      if (!activeGroup?.id || !client) {
        throw new Error('Missing groupId or client');
      }

      const clientId = await saveClient({
        groupId: activeGroup.id,
        clientData: updatedClient,
        groupDetails: { agree_to_terms: true },
      });

      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Failed to check in client.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (clientId: string) => {
    if (!clientId || !activeGroup?.id) {
      console.error('Missing clientId or organizationId.');
      return;
    }

    setLoading(true);
    try {
      await checkInClient({ groupId: activeGroup.id, clientId });

      setMessage('Check-in successful! Redirecting...');
      setTimeout(() => {
        setMessage(null);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Failed to check in client.');
    } finally {
      setLoading(false);
    }
  };

  return {
    activeGroup,
    message,
    step,
    client,
    phoneNumber,
    loading,
    setPhoneNumber,
    handlePhoneSubmit,
    handleClientSave,
    handleCheckInExistingClient,
  };
};
