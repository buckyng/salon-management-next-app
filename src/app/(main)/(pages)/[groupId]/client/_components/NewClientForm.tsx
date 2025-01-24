'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tables } from '@/lib/database.types';
import { Loader2 } from 'lucide-react';
import React, { useState, useRef } from 'react';
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

  const formRef = useRef<HTMLDivElement>(null);

  // Scroll input into view on focus
  const handleFocus = (id: string) => {
    const element = document.getElementById(id);
    if (element && formRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!firstName || !lastName) {
      toast.error('First and last names are required!');
      return;
    }

    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

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
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container mx-auto px-6 py-10 sm:px-8 lg:px-10 overflow-y-auto"
      ref={formRef}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto space-y-6 bg-white dark:bg-gray-800 p-6 shadow-md rounded-lg"
      >
        {/* First Name Input */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            First Name
          </label>
          <Input
            id="first_name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onFocus={() => handleFocus('first_name')}
            placeholder="Enter first name"
            required
            disabled={loading}
            className="w-full"
          />
        </div>

        {/* Last Name Input */}
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Last Name
          </label>
          <Input
            id="last_name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onFocus={() => handleFocus('last_name')}
            placeholder="Enter last name"
            required
            disabled={loading}
            className="w-full"
          />
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => handleFocus('email')}
            placeholder="Enter client email"
            disabled={loading}
            className="w-full"
          />
        </div>

        {/* Phone Input */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            disabled
            className="w-full cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-500"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToPolicy"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
            disabled={loading}
          />
          <div>
            <label
              htmlFor="agreeToPolicy"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Accept terms and conditions
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By checking this box, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full py-3 font-semibold rounded-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'hover:bg-blue-600 text-white'
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Check In'}
        </Button>
      </form>
    </div>
  );
};

export default NewClientForm;
