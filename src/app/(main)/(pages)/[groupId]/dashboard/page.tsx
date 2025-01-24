'use client';

import RoleBasedActions from '@/components/global/RoleBasedActions';
import { useGroup } from '@/context/GroupContext';
import { useUser } from '@/context/UserContext';

export default function DashboardPage() {
  const { activeGroup } = useGroup();
  const { user } = useUser();

  if (!activeGroup) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-red-500">Error: Active group not found.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-red-500">Error: User data not available.</p>
      </div>
    );
  }

  const activeRole = activeGroup.roles[0] || null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <header className="sticky top-0 z-10 p-4 shadow-md">
        <div className="container mx-auto flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome to {activeGroup.name} Dashboard
          </h1>
        </div>
      </header>

      {/* Content Section */}
      <main className="flex-grow p-4">
        <div className="container mx-auto max-w-3xl space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <RoleBasedActions
              activeOrgId={activeGroup.id}
              activeRole={activeRole}
            />
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-100 dark:bg-gray-800 text-center py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          &copy; 2024 Salon Manager. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
