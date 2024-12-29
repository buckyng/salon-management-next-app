'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { SaveClientInput } from '@/lib/types';

import React, { useState } from 'react';

import { toast } from 'react-toastify';

interface NewClientFormProps {
  phoneNumber: string; // Pre-filled phone number
  onSave: (clientData: SaveClientInput) => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({
  phoneNumber,
  onSave,
}) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!firstName || !lastName) {
      toast.error('Name and email are required!');
      return;
    }
    if (!agreeToTerms) {
      toast.error('You must agree to the policy to proceed.');
      return;
    }

    onSave({ firstName, lastName, email, phone: phoneNumber, agreeToTerms }); // Pass phoneNumber as part of clientData
    setFirstName('');
    setLastName('');
    setEmail('');
    setAgreeToTerms(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter last name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <Input
          type="tel"
          value={phoneNumber}
          disabled
          className="cursor-not-allowed"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreeToPolicy"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="terms1"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Accept terms and conditions
          </label>
          <p className="text-sm text-muted-foreground">
            You agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Check In
      </Button>
    </form>
  );
};

export default NewClientForm;
