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

type Client = Tables<'clients'>;

const CheckInPage = () => {
  const { activeGroup } = useGroup();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setPhoneNumber('');
    setClient(null);
    setStep(1);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !activeGroup?.id) return;

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
    }
  };

  const handleClientSave = async (
    clientData: Partial<Client>,
    groupDetails: { agree_to_terms: boolean }
  ) => {
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
    }
  };

  const handleCheckInExistingClient = async (updatedClient: Client) => {
    try {
      if (!activeGroup?.id || !client) {
        throw new Error('Missing groupId or client');
      }

      // Construct the payload
      const payload = {
        groupId: activeGroup.id,
        clientData: {
          id: client.id, // Existing client ID
          first_name: updatedClient.first_name,
          last_name: updatedClient.last_name,
          phone: updatedClient.phone,
          email: updatedClient.email,
        },
        groupDetails: {
          agree_to_terms: true, // Default to true if not provided
        },
      };

      // Send the payload to save-client API
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
    }
  };

  const handleCheckIn = async (clientId: string) => {
    if (!clientId || !activeGroup?.id) {
      console.error('Missing clientId or organizationId.');
      return;
    }

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
    }
  };

  return (
    <div className="container px-4 mx-auto mt-10 sm:px-6 lg:px-8">
      {message ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-500">{message}</h1>
        </div>
      ) : (
        <div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16">
              <OrganizationLogo
                logoSrc={activeGroup?.logo_url || ''}
                altText={`${activeGroup?.name} Logo`}
              />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-center">
              Welcome to {activeGroup?.name}
            </h1>
            <p className="mt-2 text-center text-gray-500">
              Please check in by entering your phone number below.
            </p>
          </div>

          <div className="max-w-md mx-auto mt-8">
            {step === 1 && (
              <Card className="p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold">
                  Enter Phone Number
                </h2>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button onClick={handlePhoneSubmit} className="w-full mt-4">
                  Check In
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
