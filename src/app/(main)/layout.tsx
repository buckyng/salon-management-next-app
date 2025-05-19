'use client';

import React from 'react';
import InfoBar from '@/components/infobar';
import { useUser } from '@/context/UserContext';
import useBeams from '@/lib/hooks/useBeams';
import useBeamsMessages from '@/lib/hooks/useBeamsMessages';

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  const { user } = useUser();
  useBeams(user?.id ?? null);
  useBeamsMessages();

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed InfoBar */}
      <header className="sticky top-0 z-10 bg-white shadow-md dark:bg-gray-900">
        <InfoBar />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        {props.children}
      </main>
    </div>
  );
};

export default Layout;
