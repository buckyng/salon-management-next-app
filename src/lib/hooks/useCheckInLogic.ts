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

  const handlePhoneNumberChange = (input: string) => {
    // Allow only digits and limit to 10 characters
    if (/^\d{0,10}$/.test(input)) {
      setPhoneNumber(input);
    }
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
      setStep(2);

      // Automatically check in existing client
      if (clientData) {
        await autoCheckInExistingClient(clientData);
      }
    } catch (error) {
      console.error('Error querying client:', error);
      toast.error('Failed to fetch client.');
    } finally {
      setLoading(false);
    }
  };

  const autoCheckInExistingClient = async (existingClient: Client) => {
    try {
      if (!activeGroup?.id || !existingClient) {
        throw new Error('Missing groupId or client');
      }

      const clientId = await saveClient({
        groupId: activeGroup.id,
        clientData: existingClient,
        groupDetails: { agree_to_terms: true },
      });

      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error during auto check-in:', error);
      toast.error('Failed to automatically check in client.');
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
    phoneNumber,
    setPhoneNumber,
    handlePhoneNumberChange,
    handlePhoneSubmit,
    client,
    step,
    message,
    loading,
  };
};
