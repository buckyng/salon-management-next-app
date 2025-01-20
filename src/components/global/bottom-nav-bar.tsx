'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, DollarSign, BarChart, CheckCircle, User } from 'lucide-react';
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
  dashboard: [
    { name: 'Home', icon: <Home size={20} />, route: '/[groupId]/dashboard' },
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
  cashier: [
    {
      name: 'Cashier',
      icon: <DollarSign size={20} />,
      route: '/[groupId]/cashier',
    },
    {
      name: 'Check-Ins',
      icon: <CheckCircle size={20} />,
      route: '/[groupId]/check-in',
    },
  ],
  admin: [
    {
      name: 'Manage Users',
      icon: <User size={20} />,
      route: '/[groupId]/admin/manage-users',
    },
  ],
  client: [
    { name: 'Client', icon: <Home size={20} />, route: '/[groupId]/client' },
  ],
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeGroupId }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    // Safely access `window` and set the current page
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/');
      const page = pathSegments[pathSegments.length - 1];
      setCurrentPage(page);

      // Set the navigation items dynamically
      const items = pageNavItems[page] || [];
      setNavItems(
        items.map((item) => ({
          ...item,
          route: item.route.replace('[groupId]', activeGroupId),
        }))
      );
    }
  }, [activeGroupId]);

  // Don't render if navItems are not available
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
              'text-gray-600 dark:text-gray-300 hover:text-blue-500'
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
