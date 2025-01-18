'use client';

import React from 'react';
import InfoBar from '@/components/infobar';
import { UserProvider } from '@/context/UserContext';

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  return (
    <UserProvider>
      <div className="flex overflow-hidden h-screen">
        <div className="w-full">
          <InfoBar />
          {props.children}
        </div>
      </div>
    </UserProvider>
  );
};

export default Layout;
