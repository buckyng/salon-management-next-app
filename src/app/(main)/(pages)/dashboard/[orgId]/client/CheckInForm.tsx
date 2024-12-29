'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

interface CheckInFormProps {
  onSubmit: (data: { phone: string }) => void;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ onSubmit }) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      toast.error('Phone number is required!');
      return;
    }

    onSubmit({ phone });
    setPhone('');
    toast.success('Checked in successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter client phone"
          required
        />
      </div>
      <Button type="submit">Check In</Button>
    </form>
  );
};

export default CheckInForm;
