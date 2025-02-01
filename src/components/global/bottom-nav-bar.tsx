'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  DollarSign,
  BarChart,
  User,
  Notebook,
  Receipt,
  LayoutDashboard,
  Plus,
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
  '/cashier-combined': [
    {
      name: 'Back to Dashboard',
      icon: <LayoutDashboard size={20} />,
      route: '/[groupId]/dashboard',
    },
    {
      name: 'History',
      icon: <Receipt size={20} />,
      route: '/[groupId]/cashier/history-cashier',
    },
  ],
  '/cashier': [
    {
      name: 'Back to Dashboard',
      icon: <LayoutDashboard size={20} />,
      route: '/[groupId]/dashboard',
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
  '/cashier/history-cashier': [
    {
      name: 'Back to Cashier',
      icon: <DollarSign size={20} />,
      route: '/[groupId]/cashier',
    },
    {
      name: 'Back to Combined View',
      icon: <DollarSign size={20} />,
      route: '/[groupId]/cashier-combined',
    },
  ],
  '/employee': [
    {
      name: 'Dashboard',
      icon: <Home size={20} />,
      route: '/[groupId]/employee',
    },
    {
      name: 'Add Sale',
      icon: <Plus size={20} />,
      route: '/[groupId]/employee/add-sale',
    },
    {
      name: 'Reports',
      icon: <BarChart size={20} />,
      route: '/[groupId]/employee/report',
    },
  ],
  '/admin': [
    {
      name: 'Manage Users',
      icon: <User size={20} />,
      route: '/[groupId]/admin/manage-users',
    },
    {
      name: 'Reports',
      icon: <DollarSign size={20} />,
      route: '/[groupId]/admin/reports',
    },
  ],
  '/checkin': [
    {
      name: 'Back to Dashboard',
      icon: <LayoutDashboard size={20} />,
      route: '/[groupId]/dashboard',
    },
  ],
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeGroupId }) => {
  const router = useRouter();
  const pathname = usePathname(); // Current path
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const pathWithoutGroupId = pathname.split('/').slice(2).join('/');
    const basePage = `/${pathWithoutGroupId.split('/')[0]}`; // Extract the first segment after groupId

    const items = pageNavItems[basePage] || [];

    // Replace placeholder with actual groupId
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
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex justify-around items-center py-3">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.route)}
            className={cn(
              'flex flex-col items-center px-5 py-3 text-lg transition-all rounded-md',
              pathname === item.route
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <div className="w-7 h-7">{item.icon}</div>
            <span className="mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
