import { ReportProvider } from '@/context/ReportContext';
import React from 'react';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <ReportProvider>
      <div>{children}</div>
    </ReportProvider>
  );
};

export default Layout;
