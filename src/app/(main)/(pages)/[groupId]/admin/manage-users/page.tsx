'use client';

import React, { useEffect, useState } from 'react';
import { ManageRoles } from './_components/ManageRoles';
import { InviteMember } from './_components/InviteMember';
import { Membership } from '@/lib/types';
import { useGroup } from '@/context/GroupContext';
import { fetchMemberships, fetchRoles } from '@/services/userService';
import BackButton from '@/components/global/BackButton';

const ManageUsersPage = () => {
  const { activeGroup } = useGroup();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!activeGroup) return;

        const [membershipsData, rolesData] = await Promise.all([
          fetchMemberships(activeGroup.id),
          fetchRoles(),
        ]);

        setMemberships(membershipsData);
        setRoles(rolesData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching data:', err.message);
          setError(err.message);
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [activeGroup]);

  if (loading) {
    return <p>Loading memberships...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!activeGroup) {
    return <p>No active group found.</p>;
  }

  return (
    <div className="container px-4 mx-auto mt-10">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <InviteMember groupId={activeGroup.id} />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <ManageRoles
          memberships={memberships}
          setMemberships={setMemberships}
          roles={roles} // Pass roles as a prop
        />
      </div>
    </div>
  );
};

export default ManageUsersPage;
