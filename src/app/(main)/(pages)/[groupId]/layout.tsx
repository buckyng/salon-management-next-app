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
      <main className="flex-1 pb-16 overflow-y-auto">
        <GroupProvider groupId={params.groupId}>{children}</GroupProvider>
      </main>
      {/* Add BottomNavBar */}
      <BottomNavBar activeGroupId={params.groupId} />
    </div>
  );
};

export default Layout;
