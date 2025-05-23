'use client';

import React, { ReactNode } from 'react';
import { GroupProvider } from '@/context/GroupContext';
import BottomNavBar from '@/components/global/bottom-nav-bar';
import { EodReportProvider } from '@/context/EodReportContext';

const Layout = ({
  children,
  params,
}: {
  children: ReactNode;
  params: { groupId: string };
}) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable container for main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <GroupProvider groupId={params.groupId}>
          <EodReportProvider>{children}</EodReportProvider>
        </GroupProvider>
      </main>

      {/* Fixed BottomNavBar */}
      <footer className="fixed bottom-0 left-0 right-0 z-10">
        <BottomNavBar activeGroupId={params.groupId} />
      </footer>
    </div>
  );
};

export default Layout;
