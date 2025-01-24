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
    <div className="container mx-auto px-6 py-10 sm:px-8 lg:px-10">
      <div className="max-w-md mx-auto space-y-6 bg-white dark:bg-gray-800 p-6 shadow-md rounded-lg">
        {/* Step 1: First Name */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-center">
              Please Enter First Name
            </h2>
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full"
              disabled={loading}
            />
            <Button
              onClick={handleNextStep}
              className="w-full mt-4"
              disabled={loading}
            >
              Next
            </Button>
          </>
        )}

        {/* Step 2: Last Name */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-center">
              Please Enter Last Name
            </h2>
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full"
              disabled={loading}
            />
            <Button
              onClick={handleNextStep}
              className="w-full mt-4"
              disabled={loading}
            >
              Next
            </Button>
          </>
        )}

        {/* Step 3: Email (Optional) */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-center">
              Please Enter Email (Optional)
            </h2>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={loading}
            />
            <div className="flex justify-between mt-4">
              <Button
                onClick={handleNextStep}
                variant="secondary"
                disabled={loading}
              >
                Skip
              </Button>
              <Button onClick={() => setStep(step + 1)} disabled={loading}>
                Next
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Terms and Check In */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold text-center">
              Accept Terms and Conditions
            </h2>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToPolicy"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                disabled={loading}
              />
              <label
                htmlFor="agreeToPolicy"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                By checking this box, you confirm that you have read and agree
                to our
                <a href="/terms" className="text-blue-500 underline">
                  Terms of Service
                </a>{' '}
                and
                <a href="/privacy" className="text-blue-500 underline">
                  Privacy Policy
                </a>
                . You also consent to receive transactional emails related to
                your check-in. You can withdraw your consent for promotional
                emails at any time.
              </label>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full mt-4 bg-green-500 text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Check In'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewClientForm;
