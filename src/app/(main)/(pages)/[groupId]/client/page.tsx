'use client';

import React, { useState } from 'react';
import NewClientForm from './_components/NewClientForm';
import WelcomeBack from './_components/WelcomeBack';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import OrganizationLogo from '@/components/global/OrganizationLogo';
import { useGroup } from '@/context/GroupContext';
import { Tables } from '@/lib/database.types';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

type Client = Tables<'clients'>;

const CheckInPage = () => {
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

    // Validate phone number length
    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true); // Start loading state
    try {
      const response = await fetch(
        `/api/clients/query-by-phone?groupId=${activeGroup.id}&phone=${phoneNumber}`
      );

      if (response.ok) {
        const clientData = await response.json();
        setClient(clientData);
      } else {
        setClient(null);
      }
      setStep(2);
    } catch (error) {
      console.error('Error querying client:', error);
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleClientSave = async (
    clientData: Partial<Client>,
    groupDetails: { agree_to_terms: boolean }
  ) => {
    setLoading(true); // Start loading state
    try {
      if (!activeGroup?.id) {
        throw new Error('Missing organizationId');
      }
      const response = await fetch('/api/clients/save-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroup.id,
          clientData,
          groupDetails,
        }),
      });

      const { clientId } = await response.json();
      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleCheckInExistingClient = async (updatedClient: Client) => {
    setLoading(true); // Start loading state
    try {
      if (!activeGroup?.id || !client) {
        throw new Error('Missing groupId or client');
      }

      const payload = {
        groupId: activeGroup.id,
        clientData: {
          id: client.id,
          first_name: updatedClient.first_name,
          last_name: updatedClient.last_name,
          phone: updatedClient.phone,
          email: updatedClient.email,
        },
        groupDetails: {
          agree_to_terms: true,
        },
      };

      const saveResponse = await fetch('/api/clients/save-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save client.');
      }

      const { clientId } = await saveResponse.json();
      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error during check-in:', error);
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleCheckIn = async (clientId: string) => {
    if (!clientId || !activeGroup?.id) {
      console.error('Missing clientId or organizationId.');
      return;
    }

    setLoading(true); // Start loading state
    try {
      const response = await fetch('/api/clients/save-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroup.id,
          clientId,
        }),
      });

      if (response.ok) {
        setMessage('Check-in successful! Redirecting...');
        setTimeout(() => {
          setMessage(null);
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      {message ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-500">{message}</h1>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Organization Logo */}
          <div className="flex items-center justify-center mb-8 w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56">
            <OrganizationLogo
              logoSrc={activeGroup?.logo_url ?? ''}
              altText={`${activeGroup?.name || 'Organization'} Logo`}
            />
          </div>

          {/* Welcome Text */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4">
            Welcome to {activeGroup?.name}
          </h1>
          <p className="text-center text-gray-500 text-base sm:text-lg max-w-xl">
            Please check in by entering your phone number below.
          </p>

          {/* Form Section */}
          <div className="max-w-md w-full mt-8">
            {step === 1 && (
              <Card className="p-6 shadow-lg">
                <h2 className="mb-4 text-xl sm:text-2xl font-semibold text-center">
                  Enter Phone Number
                </h2>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full text-base sm:text-lg"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading} // Disable input when loading
                />
                <Button
                  onClick={handlePhoneSubmit}
                  className="w-full mt-4 py-2 sm:py-3"
                  disabled={loading} // Disable button when loading
                >
                  {loading ? <Loader2 /> : 'Check In'}
                </Button>
              </Card>
            )}

            {step === 2 && client && (
              <WelcomeBack
                client={client}
                onUpdate={handleCheckInExistingClient}
              />
            )}

            {step === 2 && !client && (
              <NewClientForm
                phoneNumber={phoneNumber}
                onSave={handleClientSave}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
