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
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!firstName || !lastName) {
      toast.error('First and last names are required!');
      return;
    }

    // Validate phone number length
    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    if (!agreeToTerms) {
      toast.error('You must agree to the terms to proceed.');
      return;
    }

    // Start loading state
    setLoading(true);

    try {
      // Prepare client data
      const clientData: Partial<Tables<'clients'>> = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phoneNumber,
      };

      // Prepare group-specific details
      const groupDetails = {
        agree_to_terms: agreeToTerms,
      };

      // Pass data to the onSave handler
      await onSave(clientData, groupDetails);

      // Reset form state
      setFirstName('');
      setLastName('');
      setEmail('');
      setAgreeToTerms(false);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client. Please try again.');
    } finally {
      // End loading state
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 sm:px-8 lg:px-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto space-y-6 bg-white p-6 shadow-md rounded-lg"
      >
        {/* First Name Input */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name
          </label>
          <Input
            id="first_name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            required
            disabled={loading} // Disable input when loading
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Last Name Input */}
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name
          </label>
          <Input
            id="last_name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            required
            disabled={loading} // Disable input when loading
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter client email"
            disabled={loading} // Disable input when loading
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone Input */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-100 text-gray-500"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToPolicy"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
            disabled={loading} // Disable checkbox when loading
            className="h-5 w-5 text-blue-500 focus:ring-2 focus:ring-blue-500 rounded-md"
          />
          <div>
            <label
              htmlFor="agreeToPolicy"
              className="block text-sm font-medium text-gray-700"
            >
              Accept terms and conditions
            </label>
            <p className="text-sm text-gray-500">
              You agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full py-3 font-semibold text-white rounded-lg ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500'
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 /> : 'Check In'}
        </Button>
      </form>
    </div>
  );
};

export default NewClientForm;
