'use client';

import React from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import OrganizationLogo from '@/components/global/OrganizationLogo';
import { Loader2 } from 'lucide-react';
import { useCheckInLogic } from '@/lib/hooks/useCheckInLogic';
import { useGroup } from '@/context/GroupContext';

const CheckInPage = () => {
  const {
    phoneNumber,
    handlePhoneNumberChange,
    handlePhoneSubmit,
    step,
    loading,
  } = useCheckInLogic();

  const { activeGroup } = useGroup();

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section */}
      <div className="flex flex-col w-full md:w-1/3 lg:w-3/8 bg-gray-50 dark:bg-gray-800 p-6">
        <div className="flex flex-col items-center space-y-6 w-full">
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
      <div className="w-full md:w-2/3 lg:w-5/8 flex bg-gray-100 dark:bg-gray-900 px-6 py-10">
        <div className="max-w-md w-full mx-auto">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <>
              {step === 1 && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100 px-4 sm:px-6">
                    Please enter your phone number to check in
                  </h2>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    className="w-full mb-4"
                    disabled={loading}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    maxLength={10}
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
                </div>
              )}
            </>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
