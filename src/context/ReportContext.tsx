'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EodReport } from '@/lib/types';

interface ReportContextProps {
  selectedReport: EodReport | null;
  setSelectedReport: (report: EodReport) => void;
}

const ReportContext = createContext<ReportContextProps | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [selectedReport, setSelectedReport] = useState<EodReport | null>(null);

  return (
    <ReportContext.Provider value={{ selectedReport, setSelectedReport }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};
