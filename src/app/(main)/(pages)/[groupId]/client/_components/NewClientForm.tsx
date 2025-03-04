'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tables } from '@/lib/database.types';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface NewClientFormProps {
  phoneNumber: string; // Pre-filled phone number
  onSave: (
    clientData: Partial<Tables<'clients'>>,
    groupDetails: { agree_to_terms: boolean }
  ) => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({
  phoneNumber,
  onSave,
}) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // Track the current step

  const handleNextStep = () => {
    if (step === 1 && !firstName) {
      toast.error('First name is required!');
      return;
    }
    if (step === 2 && !lastName) {
      toast.error('Last name is required!');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      toast.error('You must agree to the terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      const clientData: Partial<Tables<'clients'>> = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phoneNumber,
      };

      const groupDetails = { agree_to_terms: agreeToTerms };

      await onSave(clientData, groupDetails);

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setAgreeToTerms(false);
      setStep(1);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 bg-white dark:bg-gray-800 p-8 shadow-lg rounded-xl">
      {/* Step 1: First Name */}
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold text-center ">
            Please Enter First Name
          </h2>
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full text-lg px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            disabled={loading}
          />
          <Button
            onClick={handleNextStep}
            className="w-full text-lg font-semibold px-6 py-3"
            disabled={loading}
          >
            Next
          </Button>
        </>
      )}

      {/* Step 2: Last Name */}
      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold text-center">
            Please Enter Last Name
          </h2>
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full text-lg px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            disabled={loading}
          />
          <Button
            onClick={handleNextStep}
            className="w-full text-lg font-semibold px-6 py-3"
            disabled={loading}
          >
            Next
          </Button>
        </>
      )}

      {/* Step 3: Email (Optional) */}
      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold text-center">
            Please Enter Email (Optional)
          </h2>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-lg px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            disabled={loading}
          />
          <div className="flex justify-between mt-4">
            <Button
              onClick={handleNextStep}
              variant="secondary"
              className="text-lg px-6 py-3 font-semibold rounded-lg"
              disabled={loading}
            >
              Skip
            </Button>
            <Button
              onClick={() => setStep(step + 1)}
              disabled={loading}
              className="text-lg px-6 py-3  font-semibold rounded-lg"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Terms and Check In */}
      {step === 4 && (
        <>
          <h2 className="text-2xl font-bold text-center">
            Accept Terms and Conditions
          </h2>
          <div className="flex items-start space-x-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center">
              <Checkbox
                id="agreeToPolicy"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                disabled={loading}
                className="w-6 h-6 border-2 border-gray-500 dark:border-gray-400"
              />
            </div>
            <label
              htmlFor="agreeToPolicy"
              className="text-sm text-gray-800 dark:text-gray-200 leading-6"
            >
              By checking this box, you confirm that you have read and agree to
              our
              <a className="text-blue-600 font-medium underline ml-1">
                Terms of Service
              </a>
              <span className="mx-1">and</span>
              <a className="text-blue-600 font-medium underline ml-1">
                Privacy Policy
              </a>
              . You also consent to receive transactional emails related to your
              check-in. You can withdraw your consent for promotional emails at
              any time.
            </label>
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full text-lg px-6 py-3 bg-green-500 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Check In'}
          </Button>
        </>
      )}
    </div>
  );
};

export default NewClientForm;
