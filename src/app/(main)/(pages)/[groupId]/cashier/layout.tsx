'use client';

import React from 'react';
import { useGroup } from '@/context/GroupContext';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';
import { useCheckEodReport } from '@/lib/hooks/useCheckEodReport';

const CashierLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeGroup } = useGroup();
  const currentDate = getCurrentLocalDate();

  const { eodExists, isEodLoading } = useCheckEodReport({
    groupId: activeGroup?.id || null,
    date: currentDate,
  });

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

  return <>{children}</>;
};

export default CashierLayout;
