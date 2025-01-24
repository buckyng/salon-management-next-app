'use client';

import React from 'react';
import NewClientForm from './_components/NewClientForm';
import WelcomeBack from './_components/WelcomeBack';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import OrganizationLogo from '@/components/global/OrganizationLogo';
import { Loader2 } from 'lucide-react';
import { useCheckInLogic } from '@/lib/hooks/useCheckInLogic';

const CheckInPage = () => {
  const {
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
  } = useCheckInLogic();

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Section */}
      <div className="hidden lg:flex w-3/8  items-center justify-center">
        <OrganizationLogo
          logoSrc={activeGroup?.logo_url ?? ''}
          altText={`${activeGroup?.name || 'Organization'} Logo`}
        />
        <h1 className="text-4xl font-bold text-center">
          Welcome to {activeGroup?.name || 'Our Salon'}
        </h1>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-5/8 flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-6 py-10">
        <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {message ? (
            <h1 className="text-2xl text-center text-green-500">{message}</h1>
          ) : (
            <>
              {step === 1 && (
                <>
                  <h2 className="text-xl font-semibold text-center mb-4">
                    Please enter your Phone Number
                  </h2>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    className="w-full mb-4"
                    disabled={loading}
                    onChange={(e) => {
                      const input = e.target.value;
                      // Allow only digits and limit to 10 characters
                      if (/^\d{0,10}$/.test(input)) {
                        setPhoneNumber(input);
                      }
                    }}
                    maxLength={10} // Extra safeguard for 10 digits
                  />

                  <Button
                    onClick={handlePhoneSubmit}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'Check In'
                    )}
                  </Button>
                </>
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
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CheckInPage;
