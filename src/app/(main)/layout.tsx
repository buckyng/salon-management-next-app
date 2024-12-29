'use client';
import React from 'react';
import InfoBar from '@/components/infobar';

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  return (
    <div className="flex overflow-hidden h-screen">
      <div className="w-full">
        <InfoBar />
        {props.children}
      </div>
    </div>
  );
};

export default Layout;
