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
    { name: 'Today Report', route: '/[groupId]/admin/today-report' },
    { name: 'Reports', route: '/[groupId]/admin/reports' },
    { name: 'Update Logo', route: '/[groupId]/admin/update-logo' },
    { name: 'Update Eod', route: '/[groupId]/admin/update-eod' },
  ],
  employee: [{ name: 'Employee Dashboard', route: '/[groupId]/employee' }],
  cashier: [
    { name: 'Cashier Dashboard', route: '/[groupId]/cashier' },
    { name: 'Check-In Dashboard', route: '/[groupId]/checkin' },
    { name: 'Combined dashboard', route: '/[groupId]/cashier-combined' },
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

  // Memoized accessible routes
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
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-600">
          No role assigned. Please contact your administrator.
        </p>
      </div>
    );

  if (!activeOrgId)
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-600">
          No organization selected. Please select an organization.
        </p>
      </div>
    );

  if (!accessibleRoutes || accessibleRoutes.length === 0) {
    console.warn(`No accessible routes found for role: ${activeRole}`);
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-600">
          No accessible actions available for this role.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800">Available Actions</h2>
      <div className="flex flex-col gap-2">
        {accessibleRoutes.map(({ name, route }) => (
          <Button
            key={route}
            onClick={() => router.push(route)}
            className="py-3 px-4 text-left font-medium text-white rounded hover:bg-indigo-700 focus:ring focus:ring-indigo-400"
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RoleBasedActions;
