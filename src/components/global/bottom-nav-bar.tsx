'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  DollarSign,
  BarChart,
  CheckCircle,
  User,
  Notebook,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  route: string;
}

interface BottomNavBarProps {
  activeGroupId: string;
}

const pageNavItems: Record<string, NavItem[]> = {
  checkin: [
    {
      name: 'Cashier',
      icon: <DollarSign size={20} />,
      route: '/[groupId]/cashier',
    },
    {
      name: 'Check-Ins',
      icon: <CheckCircle size={20} />,
      route: '/[groupId]/checkin',
    },
  ],
  cashier: [
    {
      name: 'Check-Ins',
      icon: <CheckCircle size={20} />,
      route: '/[groupId]/checkin',
    },
    {
      name: 'Cashier',
      icon: <DollarSign size={20} />,
      route: '/[groupId]/cashier',
    },
    {
      name: 'History',
      icon: <Receipt size={20} />,
      route: '/[groupId]/cashier/history-cashier',
    },
    {
      name: 'End Of Day',
      icon: <Notebook size={20} />,
      route: '/[groupId]/cashier/eod',
    },
  ],
  employee: [
    {
      name: 'Dashboard',
      icon: <Home size={20} />,
      route: '/[groupId]/employee',
    },
    {
      name: 'Add Sale',
      icon: <DollarSign size={20} />,
      route: '/[groupId]/employee/add-sale',
    },
    {
      name: 'Reports',
      icon: <BarChart size={20} />,
      route: '/[groupId]/employee/report',
    },
  ],
  admin: [
    {
      name: 'Manage Users',
      icon: <User size={20} />,
      route: '/[groupId]/admin/manage-users',
    },
  ],
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeGroupId }) => {
  const router = useRouter();
  const pathname = usePathname(); // Current path
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    // Extract the base route from pathname
    const pathSegments = pathname.split('/');
    const basePage = pathSegments[2]; // "cashier", "employee", etc.

    const items = pageNavItems[basePage] || [];
    setNavItems(
      items.map((item) => ({
        ...item,
        route: item.route.replace('[groupId]', activeGroupId),
      }))
    );
  }, [pathname, activeGroupId]);

  if (!navItems || navItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.route)}
            className={cn(
              'flex flex-col items-center px-3 py-1 text-sm',
              pathname.includes(item.route.split('/').at(-1)!)
                ? 'text-blue-500'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'
            )}
          >
            {item.icon}
            <span className="mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
