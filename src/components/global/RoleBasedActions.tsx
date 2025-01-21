'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useEffect, useMemo } from 'react';

type RouteRolePermission = {
  name: string;
  route: string;
};

type Role = 'admin' | 'employee' | 'cashier' | 'client';

const rolePermissions: Record<Role, RouteRolePermission[]> = {
  admin: [
    { name: 'Manage Users', route: '/[groupId]/admin/manage-users' },
    { name: 'Reports', route: '/[groupId]/admin/reports' },
  ],
  employee: [{ name: 'Employee Dashboard', route: '/[groupId]/employee' }],
  cashier: [
    { name: 'Cashier Dashboard', route: '/[groupId]/cashier' },
    { name: 'Check-In Dashboard', route: '/[groupId]/check-in' },
  ],
  client: [{ name: 'Client Dashboard', route: '/[groupId]/client' }],
};

interface RoleBasedActionsProps {
  activeOrgId: string;
  activeRole: string | null;
}

const RoleBasedActions: React.FC<RoleBasedActionsProps> = ({
  activeOrgId,
  activeRole,
}) => {
  const router = useRouter();

  // Wrap accessibleRoutes in useMemo
  const accessibleRoutes = useMemo(() => {
    return (
      rolePermissions[activeRole as Role]?.map((permission) => ({
        ...permission,
        route: permission.route.replace('[groupId]', activeOrgId),
      })) || []
    );
  }, [activeRole, activeOrgId]);

  useEffect(() => {
    if (accessibleRoutes.length === 1) {
      router.push(accessibleRoutes[0].route);
    }
  }, [accessibleRoutes, router]);

  if (!activeRole)
    return <p>No role assigned. Please contact your administrator.</p>;

  if (!activeOrgId)
    return <p>No organization selected. Please select an organization.</p>;

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
