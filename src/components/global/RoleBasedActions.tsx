'use client';

import { Button } from '../ui/button';
import { rolePermissions } from '@/constants/permission';
import { FC } from 'react';
import { useRouter } from 'next/navigation';

interface RoleBasedActionsProps {
  orgId: string;
  orgRole: string | null;
}

const RoleBasedActions: FC<RoleBasedActionsProps> = ({ orgId, orgRole }) => {
  const router = useRouter();

  if (!orgRole)
    return <p>No role assigned. Please contact your administrator.</p>;

  // Get permissions for the mapped role
  const accessibleRoutes =
    rolePermissions[orgRole as keyof typeof rolePermissions]?.map(
      (permission) => ({
        ...permission,
        route: permission.route.replace('[orgId]', orgId),
      })
    ) || [];

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
