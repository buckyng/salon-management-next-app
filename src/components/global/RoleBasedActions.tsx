'use client';

import { useAuth } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { rolePermissions } from '@/constants/permission';
import { FC } from 'react';
import { useRouter } from 'next/navigation';

interface RoleBasedActionsProps {
  orgId: string;
}

const RoleBasedActions: FC<RoleBasedActionsProps> = ({ orgId }) => {
  const { orgRole } = useAuth();
  const router = useRouter();

  if (!orgRole)
    return <p>No role assigned. Please contact your administrator.</p>;

  // Map full `orgRole` to simplified keys
  const roleKeyMap: Record<string, keyof typeof rolePermissions> = {
    'org:admin': 'admin',
    'org:employee': 'employee',
    'org:cashier': 'cashier',
    'org:client': 'client',
  };

  const simplifiedRole = roleKeyMap[orgRole || ''] || null;

  if (!simplifiedRole) {
    return (
      <p>
        No role assigned or role not recognized. Please contact your
        administrator.
      </p>
    );
  }

  // Get permissions for the mapped role
  const accessibleRoutes =
    rolePermissions[simplifiedRole]?.map((permission) => ({
      ...permission,
      route: permission.route.replace('[orgId]', orgId),
    })) || [];

  if (!accessibleRoutes.length) {
    console.warn(`No accessible routes found for role: ${orgRole}`);
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
