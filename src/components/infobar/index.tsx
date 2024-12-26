'use client';
import React from 'react';
import { SignedIn, UserButton } from '@clerk/nextjs';

const InfoBar = () => {
  return (
    <div className="flex flex-row justify-end gap-6 items-center px-4 py-4 w-full dark:bg-black ">
      <SignedIn>
        {/* Mount the UserButton component */}
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default InfoBar;
