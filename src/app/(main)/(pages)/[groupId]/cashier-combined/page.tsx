'use client';

import React from 'react';
import CashierPage from '../cashier/page';
import CheckInManagementPage from '../checkin/page';

const CashierCombinedPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Cashier Page */}
      <div className="flex-1 overflow-auto border-r border-gray-200">
        <CashierPage />
      </div>

      {/* Check-In Page */}
      <div className="flex-1 overflow-auto">
        <CheckInManagementPage />
      </div>
    </div>
  );
};

export default CashierCombinedPage;
