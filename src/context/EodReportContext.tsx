// src/context/EodReportContext.tsx
'use client';

import { checkEodReportExists } from '@/services/reportService';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface EodReportContextProps {
  eodExists: boolean;
  setEodExists: (exists: boolean) => void;
  checkAndSetEodExists: (groupId: string, date: string) => Promise<void>;
}

const EodReportContext = createContext<EodReportContextProps | undefined>(
  undefined
);

export const useEodReport = () => {
  const context = useContext(EodReportContext);
  if (!context) {
    throw new Error('useEodReport must be used within an EodReportProvider');
  }
  return context;
};

export const EodReportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [eodExists, setEodExists] = useState(false);

  // Fetch and update the EOD existence state
  const checkAndSetEodExists = useCallback(
    async (groupId: string, date: string) => {
      try {
        const exists = await checkEodReportExists({ groupId, date });
        setEodExists(exists);
      } catch (error) {
        console.error('Error checking EOD report existence:', error);
      }
    },
    []
  );

  return (
    <EodReportContext.Provider
      value={{ eodExists, setEodExists, checkAndSetEodExists }}
    >
      {children}
    </EodReportContext.Provider>
  );
};
