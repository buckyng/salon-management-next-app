'use client';

import React from 'react';
import InfoBar from '@/components/infobar';
import { UserProvider } from '@/context/UserContext';
import OneSignalInit from '@/components/global/OneSignalInit';

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  return (
    <UserProvider>
      <div className="flex flex-col h-screen">
        {/* Fixed InfoBar */}
        <header className="sticky top-0 z-10 bg-white shadow-md dark:bg-gray-900">
          <InfoBar />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <OneSignalInit />
          {props.children}
        </main>
      </div>
    </UserProvider>
  );
};

export default Layout;
