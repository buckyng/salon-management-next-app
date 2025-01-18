import { ReactNode } from 'react';
import { GroupProvider } from '@/context/GroupContext';

const Layout = ({
  children,
  params,
}: {
  children: ReactNode;
  params: { groupId: string };
}) => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1">
        <main className="p-4 overflow-y-auto">
          <GroupProvider groupId={params.groupId}>{children}</GroupProvider>
        </main>
      </div>
    </div>
  );
};

export default Layout;
