'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGroup } from '@/context/GroupContext';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';
import { useCheckEodReport } from '@/lib/hooks/useCheckEodReport';
import ReportCashier from '@/components/global/ReportCashier';

const ReportCashierPage: React.FC = () => {
  const router = useRouter();
  const { activeGroup } = useGroup();
  const currentDate = getCurrentLocalDate();

  const { eodExists, isEodLoading } = useCheckEodReport({
    groupId: activeGroup?.id || null,
    date: currentDate,
  });

  const handleSuccess = () => {
    router.push(`/${activeGroup?.id}/cashier`);
  };

  if (isEodLoading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (eodExists) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-2xl font-bold text-red-500 text-center">
          An End-of-Day Report for {currentDate} has already been submitted.
        </p>
      </div>
    );
  }

  if (!activeGroup) {
    return <p>Loading group...</p>;
  }

  return (
    <div className="container mx-auto h-full overflow-y-auto">
      <ReportCashier
        date={currentDate}
        groupId={activeGroup.id}
        onSubmitSuccess={handleSuccess}
      />
    </div>
  );
};

export default ReportCashierPage;
