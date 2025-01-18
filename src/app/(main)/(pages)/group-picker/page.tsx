'use client';

import { CustomOrganizationPicker } from '@/components/global/CustomOrganizationPicker';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GroupPickerPage() {
  const { user, loading, error } = useUser();
  const router = useRouter();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const groups = user.groups;

      if (groups.length === 1) {
        // Automatically redirect to the single group's dashboard
        const singleGroup = groups[0];
        setActiveGroup(singleGroup.id);
        localStorage.setItem('activeGroup', JSON.stringify(singleGroup)); // Persist active group
        router.push(`/${singleGroup.id}/dashboard`);
      }
    }
  }, [loading, user, router]);

  if (loading) return <p>Loading groups...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const handleGroupChange = (groupId: string) => {
    const selectedGroup = user?.groups.find((g) => g.id === groupId);

    if (selectedGroup) {
      setActiveGroup(groupId);
      localStorage.setItem('activeGroup', JSON.stringify(selectedGroup)); // Persist active group
      router.push(`/${groupId}/dashboard`); // Redirect to the group's dashboard
    }
  };

  if (loading) return <p>Loading groups...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!user || user.groups.length === 0) {
    return (
      <p className="text-lg text-gray-600">You are not part of any groups.</p>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6">Select a Group</h1>
      <CustomOrganizationPicker
        organizations={user.groups.map((group) => ({
          id: group.id,
          name: group.name || `Group ${group.id}`,
        }))}
        activeOrg={activeGroup}
        handleOrgChange={handleGroupChange}
      />
    </div>
  );
}
