'use client';

import { Button } from '../ui/button';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/constant';

type RouteRolePermission = {
  name: string;
  route: string;
};

const rolePermissions: Record<Role, RouteRolePermission[]> = {
  admin: [{ name: 'Manage Users', route: '/[groupId]/admin/manage-users' }],
  employee: [
    { name: 'Employee Dashboard', route: '/[groupId]/employee' },
    { name: 'Sales Report', route: '/[groupId]/employee/report' },
  ],
  cashier: [
    { name: 'Cashier Dashboard', route: '/[groupId]/cashier' },
    { name: 'Check-In Dashboard', route: '/[groupId]/checkin' },
    { name: 'End of Day Report', route: '/[groupId]/cashier/eod' },
  ],
  client: [{ name: 'Client Dashboard', route: '/[groupId]/client' }],
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
      route: permission.route.replace('[groupId]', activeOrgId),
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
