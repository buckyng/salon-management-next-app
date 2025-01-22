'use client';

import React, { ReactNode } from 'react';
import { GroupProvider } from '@/context/GroupContext';
import BottomNavBar from '@/components/global/bottom-nav-bar';

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
      <main className="flex-1 overflow-y-auto pb-16">
        <GroupProvider groupId={params.groupId}>{children}</GroupProvider>
      </main>
      {/* Fixed BottomNavBar */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <BottomNavBar activeGroupId={params.groupId} />
      </div>
    </div>
  );
};

export default Layout;
