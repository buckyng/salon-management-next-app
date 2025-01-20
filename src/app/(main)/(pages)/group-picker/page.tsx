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
    if (!loading && user?.groups.length === 1) {
      // Automatically set and redirect to the only group
      const singleGroup = user.groups[0];
      setSelectedOrg(singleGroup.id);
      localStorage.setItem('activeGroup', JSON.stringify(singleGroup));
      router.push(`/${singleGroup.id}/dashboard`);
    }
  }, [loading, user, router]);

  const handleConfirm = () => {
    const selectedGroup = user?.groups.find((g) => g.id === selectedOrg);
    if (selectedGroup) {
      localStorage.setItem('activeGroup', JSON.stringify(selectedGroup));
      router.push(`/${selectedOrg}/dashboard`);
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
    <div className="flex flex-col items-center h-screen space-y-6">
      <h1 className="text-2xl font-bold">Select a Group</h1>
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
        variant="default"
      >
        Confirm Selection
      </Button>
    </div>
  );
}
