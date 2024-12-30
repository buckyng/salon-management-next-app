import { OrganizationProvider } from '@/context/OrganizationContext';
import React from 'react';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <OrganizationProvider>
      <div className="m-6">{children}</div>
    </OrganizationProvider>
  );
};

export default Layout;
