'use client';

import React, { useState } from 'react';
import CashierPage from '../cashier/page';
import CheckInManagementPage from '../checkin/page';

const CashierCombinedPage = () => {
  const [dividerPosition, setDividerPosition] = useState(50); // Divider position in %

  const handleDrag = (clientX: number) => {
    const newDividerPosition = (clientX / window.innerWidth) * 100;
    setDividerPosition(Math.min(Math.max(newDividerPosition, 20), 80)); // Limit between 20% and 80%
  };

  const handleMouseDown = () => {
    const onMouseMove = (e: MouseEvent) => handleDrag(e.clientX);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = () => {
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleDrag(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cashier Page */}
      <div
        className="overflow-y-auto bg-white dark:bg-gray-800 shadow-md"
        style={{ width: `${dividerPosition}%` }}
      >
        <div className="h-full p-4 border-r border-gray-200 dark:border-gray-700">
          <CashierPage />
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-1 cursor-col-resize bg-gray-300 dark:bg-gray-700"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart} // Add touch support
      ></div>

      {/* Check-In Page */}
      <div
        className="overflow-y-auto bg-white dark:bg-gray-800 shadow-md"
        style={{ width: `${100 - dividerPosition}%` }}
      >
        <div className="h-full p-4">
          <CheckInManagementPage />
        </div>
      </div>
    </div>
  );
};

export default CashierCombinedPage;
