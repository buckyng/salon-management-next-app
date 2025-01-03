'use client';
import React from 'react';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { ModeToggle } from '../global/mode-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { menuOptions } from '@/lib/constant';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const InfoBar = () => {
  const pathName = usePathname();
  return (
    <div className="flex flex-row justify-between gap-6 items-center px-4 py-4 w-full dark:bg-black ">
      <div className="flex flex-row justify-start gap-6 items-center px-4 py-4 w-full dark:bg-black ">
        <Link className="flex font-bold flex-row " href="/">
          sm
        </Link>
        <TooltipProvider>
          {menuOptions.map((menuItem) => (
            <ul key={menuItem.name}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <li>
                    <Link
                      href={menuItem.href}
                      className={clsx(
                        'group h-8 w-8 flex items-center justify-center  scale-[1.5] rounded-lg p-[3px]  cursor-pointer',
                        {
                          'dark:bg-[#2F006B] bg-[#EEE0FF] ':
                            pathName === menuItem.href,
                        }
                      )}
                    >
                      <menuItem.Component
                        selected={pathName === menuItem.href}
                      />
                    </Link>
                  </li>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-black/10 backdrop-blur-xl"
                >
                  <p>{menuItem.name}</p>
                </TooltipContent>
              </Tooltip>
            </ul>
          ))}
        </TooltipProvider>
      </div>
      <div className="flex flex-row justify-end gap-6 items-center px-4 py-4 w-full dark:bg-black ">
        <ModeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

export default InfoBar;
