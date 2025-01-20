'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useUser } from '@/context/UserContext';
import { useGroup } from '@/context/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AddSalePage = () => {
  const { user } = useUser();
  const { activeGroup } = useGroup();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [comboNum, setComboNum] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeGroup?.id) {
      toast.error('Group ID is missing.');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to add a sale.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than 0.');
      return;
    }

    setLoading(true); // Start loading state
    try {
      await fetch('/api/sales/add-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroup.id,
          userId: user.id,
          amount: parseFloat(amount),
          comboNum: comboNum ? parseInt(comboNum, 10) : null,
          note: note || null,
        }),
      });

      toast.success('Sale added successfully!');
      router.push(`/${activeGroup.id}/employee`); // Navigate back to Employee Home Page
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('Failed to add sale. Please try again.');
    } finally {
      setLoading(false); // End loading state
    }
  };

  if (!activeGroup?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4 px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-center sm:text-2xl mb-4">
        Add Sale
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter sale amount"
            required
            disabled={loading} // Disable input when loading
          />
        </div>

        {/* Combo Number */}
        <div>
          <label className="block text-sm font-medium">Combo Number</label>
          <Input
            type="text"
            value={comboNum}
            onChange={(e) => setComboNum(e.target.value)}
            placeholder="Enter combo number (optional)"
            disabled={loading} // Disable input when loading
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium">Note</label>
          <Input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter any additional notes (optional)"
            disabled={loading} // Disable input when loading
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

export default AddSalePage;
