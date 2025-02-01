import React from 'react';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <div className="h-full rounded-l-3xl border-l border-t border-muted-foreground/20 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="p-4 pb-20">{children}</div>
    </div>
  );
};

export default Layout;
