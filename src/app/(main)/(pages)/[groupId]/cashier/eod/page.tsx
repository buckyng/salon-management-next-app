'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGroup } from '@/context/GroupContext';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';
import ReportCashier from '@/components/global/ReportCashier';
import { useEodReport } from '@/context/EodReportContext';
import LoadingSpinner from '@/components/global/LoadingSpinner';

const ReportCashierPage: React.FC = () => {
  const router = useRouter();
  const { activeGroup } = useGroup();
  const currentDate = getCurrentLocalDate();

  const { eodExists, checkAndSetEodExists } = useEodReport();

  useEffect(() => {
    if (activeGroup?.id) {
      checkAndSetEodExists(activeGroup.id, currentDate);
    }
  }, [activeGroup, currentDate, checkAndSetEodExists]);

  const handleSuccess = () => {
    if (!activeGroup?.id) return;
    // Update context instantly after submitting the report
    checkAndSetEodExists(activeGroup?.id || '', currentDate);
    router.push(`/${activeGroup?.id}/cashier`);
  };

  if (eodExists) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-2xl font-bold text-red-500 text-center">
          An End-of-Day Report for {currentDate} has already been submitted.
        </p>
      </div>
    );
  }

  if (!activeGroup?.id) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="top-0 z-10  p-4 shadow-md">
        <div className="container mx-auto text-center">
          <h1 className="text-xl font-bold">End of Day Report</h1>
          <p className="text-sm mt-1">Date: {currentDate}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow container mx-auto p-6 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <ReportCashier
            date={currentDate}
            groupId={activeGroup?.id || ''}
            onSubmitSuccess={handleSuccess}
          />
        </div>
      </main>
    </div>
  );
};

export default ReportCashierPage;
