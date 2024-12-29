import Home from '@/components/icons/home';

export const menuOptions = [
  { name: 'Dashboard', Component: Home, href: '/dashboard' },
];

export type Role = 'admin' | 'employee' | 'cashier' | 'client';
