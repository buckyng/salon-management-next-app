'use client';

import React from 'react';
import NewClientForm from './_components/NewClientForm';

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
  } = useCheckInLogic();

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col w-3/8 items-center justify-center space-y-4 bg-gray-50 dark:bg-gray-800 p-6">
        <div className="flex flex-col items-center space-y-6">
          <OrganizationLogo
            logoSrc={activeGroup?.logo_url ?? ''}
            altText={`${activeGroup?.name || 'Organization'} Logo`}
          />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
            Welcome to {activeGroup?.name || 'Our Salon'}
          </h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-12 lg:py-16">
        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-6 sm:p-8 md:p-10 lg:p-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {message ? (
            <h1 className="text-xl sm:text-2xl md:text-3xl text-center text-green-500">
              {message}
            </h1>
          ) : (
            <>
              {step === 1 && (
                <>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-4 md:mb-6 text-gray-800 dark:text-gray-100">
                    Please enter your Phone Number
                  </h2>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    className="w-full text-base sm:text-lg md:text-xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 border-2 border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    className="w-full text-base sm:text-lg md:text-xl px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-bold"
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
