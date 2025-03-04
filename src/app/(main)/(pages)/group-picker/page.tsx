'use client';

import { CustomOrganizationPicker } from '@/components/global/CustomOrganizationPicker';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function GroupPickerPage() {
  const { user, loading, error } = useUser();
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user?.groups?.length === 1) {
      const singleGroup = user.groups[0];
      if (singleGroup) {
        setSelectedOrg(singleGroup.id);
        setTimeout(() => {
          try {
            localStorage.setItem('activeGroup', JSON.stringify(singleGroup));
            router.push(`/${singleGroup.id}/dashboard`);
          } catch (err) {
            console.error('Error storing group in localStorage:', err);
          }
        }, 0);
      }
    }
  }, [loading, user?.groups, router]);

  const handleConfirm = () => {
    const selectedGroup = user?.groups.find((g) => g.id === selectedOrg);
    if (selectedGroup) {
      try {
        localStorage.setItem('activeGroup', JSON.stringify(selectedGroup));
        router.push(`/${selectedOrg}/dashboard`);
      } catch (err) {
        console.error('Failed to write to localStorage:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-gray-500">Loading groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (!user || user.groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-gray-600">You are not part of any groups.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-screen px-4 bg-gray-50">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Select a Group
      </h1>
      <CustomOrganizationPicker
        organizations={user.groups.map((group) => ({
          id: group.id,
          name: group.name || `Group ${group.id}`,
        }))}
        selectedOrg={selectedOrg}
        setSelectedOrg={setSelectedOrg}
      />
      <Button
        onClick={handleConfirm}
        disabled={!selectedOrg} // Disable button if no selection
        className="mt-4"
      >
        Confirm Selection
      </Button>
    </div>
  );
}
