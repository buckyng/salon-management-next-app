'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useUser } from '@/context/UserContext';
import { useGroup } from '@/context/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addSale } from '@/services/saleService';
import { useEodReport } from '@/context/EodReportContext';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';

const AddSalePage = () => {
  const { user } = useUser();
  const { activeGroup } = useGroup();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [comboNum, setComboNum] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const currentDate = getCurrentLocalDate();

  const { eodExists, checkAndSetEodExists } = useEodReport();

  // Fetch and update the EOD status when component mounts
  useEffect(() => {
    if (activeGroup?.id) {
      checkAndSetEodExists(activeGroup.id, currentDate);
    }
  }, [activeGroup, currentDate, checkAndSetEodExists]);

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

    if (eodExists) {
      toast.error('End of Day report is submitted. No more sale can be added');
      return;
    }

    setLoading(true);
    try {
      await addSale({
        groupId: activeGroup.id,
        userId: user.id,
        amount: parseFloat(amount),
        comboNum: comboNum ? parseInt(comboNum, 10) : null,
        note: note || null,
      });

      toast.success('Sale added successfully!');
      router.push(`/${activeGroup.id}/employee`); // Navigate back to Employee Home Page
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('Failed to add sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeGroup?.id) {
    return <LoadingSpinner fullScreen />;
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
