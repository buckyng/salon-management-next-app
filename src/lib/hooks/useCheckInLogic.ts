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

      // ✅ Automatically check in existing clients
      if (clientData) {
        await handleCheckIn(clientData.id);
      }
    } catch (error) {
      console.error('Error querying client:', error);
      toast.error('Failed to fetch client.');
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

  return {
    activeGroup,
    phoneNumber,
    setPhoneNumber,
    handlePhoneNumberChange,
    handlePhoneSubmit,
    handleClientSave,
    client,
    step,
    message,
    loading,
  };
};
