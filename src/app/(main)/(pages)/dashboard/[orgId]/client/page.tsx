'use client';

import React, { useState } from 'react';
import NewClientForm from './NewClientForm';
import WelcomeBack from './WelcomeBack';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SaveClientInput } from '@/lib/types';
import { useOrganization } from '@clerk/nextjs';
import { queryClientByPhone, saveClient } from '@/lib/client/clientService';
import { saveCheckIn } from '@/lib/client/checkInService';
import { toast } from 'react-toastify';

const CheckInPage = () => {
  const { organization } = useOrganization();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [client, setClient] = useState<SaveClientInput | null>(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const orgId = organization?.id;
  const organizationName = organization?.name;

  const resetForm = () => {
    setPhoneNumber('');
    setClient(null);
    setStep(1);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !orgId) return;

    try {
      const foundClient = await queryClientByPhone(orgId, phoneNumber);

      if (foundClient) {
        setClient(foundClient);
        setStep(2); // Proceed to next step
      } else {
        // Display a user-friendly message
        toast('No client found. Please enter your details.');
        setStep(2); // Redirect to a new client form or appropriate UI
      }
    } catch (error) {
      console.error('Error querying client:', error); // Log unexpected errors
    }
  };

  const handleClientSave = async (clientData: SaveClientInput) => {
    try {
      if (!orgId) {
        throw new Error('Missing organizationId');
      }
      const transformedClientData = {
        firstname: clientData.firstName,
        lastname: clientData.lastName,
        phone: clientData.phone,
        email: clientData.email,
        agreetoterms: clientData.agreeToTerms,
      };
      // Save new client and handle check-in
      const clientId = await saveClient({
        organizationid: orgId,
        clientData: transformedClientData,
      });
      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleCheckInExistingClient = async (
    updatedClient: SaveClientInput
  ) => {
    try {
      if (!orgId || !client) {
        throw new Error('Missing organizationId or client');
      }
      const transformedClientData = {
        firstname: updatedClient.firstName,
        lastname: updatedClient.lastName,
        phone: updatedClient.phone,
        email: updatedClient.email,
        agreetoterms: updatedClient.agreeToTerms,
      };
      // Save or update client and handle check-in
      const clientId = await saveClient({
        organizationid: orgId,
        clientId: client.id,
        clientData: transformedClientData,
      });
      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error during check-in:', error);
    }
  };

  const handleCheckIn = async (clientId?: string) => {
    const finalClientId = clientId || client?.id;

    if (!finalClientId || !orgId || !clientId) {
      console.error('Missing clientId or organizationId.');
      return;
    }

    try {
      await saveCheckIn({
        organizationId: orgId,
        clientId,
      });
      setMessage('Check-in successful! Redirecting...');
      const timeoutId = setTimeout(() => {
        setMessage(null);
        resetForm();
      }, 3000);
      return () => clearTimeout(timeoutId); // Cleanup timeout
    } catch (error) {
      console.error('Error during check-in:', error);
    }
  };

  const handlePhoneInput = (value: string) => {
    // Remove non-numeric characters
    const sanitizedValue = value.replace(/\D/g, '');

    // Limit to 10 digits
    if (sanitizedValue.length <= 10) {
      setPhoneNumber(sanitizedValue);
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
            {/* add Organization LOGO*/}
            <h1 className="mt-4 text-3xl font-bold text-center">
              Welcome to {organizationName}
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
                  onChange={(e) => handlePhoneInput(e.target.value)}
                />
                <div className="text-sm text-gray-500">
                  {phoneNumber.length < 10 &&
                    'Please enter a valid 10-digit phone number'}
                </div>
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
