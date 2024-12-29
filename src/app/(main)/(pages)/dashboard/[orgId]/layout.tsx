import React from 'react';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return <div className="m-6">{children}</div>;
};

export default Layout;
