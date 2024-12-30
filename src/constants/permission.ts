import { Role } from '@/lib/constant';
import { RouteRolePermission } from '@/lib/types';

export const rolePermissions: Record<Role, RouteRolePermission[]> = {
  admin: [
    { name: 'Admin Dashboard', route: '/dashboard/[orgId]/admin' },
    { name: 'Manage Users', route: '/dashboard/[orgId]/admin/manage-users' },
  ],
  employee: [
    { name: 'Employee Dashboard', route: '/dashboard/[orgId]/employee' },
    { name: 'Sales Report', route: '/dashboard/[orgId]/employee/report' },
  ],
  cashier: [
    { name: 'Cashier Dashboard', route: '/dashboard/[orgId]/cashier' },
    { name: 'End of Day Report', route: '/dashboard/[orgId]/cashier/eod' },
  ],
  client: [{ name: 'Client Dashboard', route: '/dashboard/[orgId]/client' }],
};
