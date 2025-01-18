'use client';

import RoleBasedActions from '@/components/global/RoleBasedActions';
import { useGroup } from '@/context/GroupContext';
import { useUser } from '@/context/UserContext';

export default function DashboardPage() {
  const { activeGroup } = useGroup();
  const { user } = useUser();

  if (!activeGroup) {
    return <p className="text-red-500">Error: Active group not found.</p>;
  }

  if (!user) {
    return <p className="text-red-500">Error: User data not available.</p>;
  }

  const activeRole = activeGroup.roles[0] || null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Welcome to {activeGroup.name} Dashboard
      </h1>
      <p>
        <strong>Your Role:</strong> {activeRole || 'No role assigned'}
      </p>

      {/* Role-Based Actions */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Available Actions</h2>
        <RoleBasedActions
          activeOrgId={activeGroup.id}
          activeRole={activeRole}
        />
      </div>
    </div>
  );
}
