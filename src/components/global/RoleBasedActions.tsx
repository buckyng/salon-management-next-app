'use client';

import { Button } from '../ui/button';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/constant';
import { RouteRolePermission } from '@/lib/types';

const rolePermissions: Record<Role, RouteRolePermission[]> = {
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
    { name: 'Check-In Dashboard', route: '/dashboard/[orgId]/checkin' },
    { name: 'End of Day Report', route: '/dashboard/[orgId]/cashier/eod' },
  ],
  client: [{ name: 'Client Dashboard', route: '/dashboard/[orgId]/client' }],
};

interface RoleBasedActionsProps {
  activeOrgId: string;
  activeRole: string | null;
}

const RoleBasedActions: FC<RoleBasedActionsProps> = ({
  activeOrgId,
  activeRole,
}) => {
  const router = useRouter();

  if (!activeRole)
    return <p>No role assigned. Please contact your administrator.</p>;

  if (!activeOrgId)
    return <p>No organization selected. Please select an organization.</p>;

  // Get permissions for the mapped role
  const accessibleRoutes =
    rolePermissions[activeRole as Role]?.map((permission) => ({
      ...permission,
      route: permission.route.replace('[orgId]', activeOrgId),
    })) || [];

  if (!accessibleRoutes || accessibleRoutes.length === 0) {
    console.warn(`No accessible routes found for role: ${activeRole}`);
    return <p>No accessible actions available for this role.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {accessibleRoutes.map(({ name, route }) => (
          <Button
            key={route}
            onClick={() => router.push(route)}
            className="p-2 border rounded hover:bg-gray-100"
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RoleBasedActions;
