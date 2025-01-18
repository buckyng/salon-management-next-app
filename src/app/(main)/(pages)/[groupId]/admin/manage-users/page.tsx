'use client';

import React, { useEffect, useState } from 'react';
import { ManageRoles } from './_components/ManageRoles';
import { InviteMember } from './_components/InviteMember';
import { Membership } from '@/lib/types';

interface ManageUsersPageProps {
  params: { groupId: string };
}

const ManageUsersPage: React.FC<ManageUsersPageProps> = ({ params }) => {
  const { groupId } = params;
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch(`/api/groupUsers/memberships?groupId=${groupId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch memberships.');
        }
        const data = await response.json();
        setMemberships(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching memberships:', err.message);
          setError(err.message);
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [groupId]);

  if (loading) {
    return <p>Loading memberships...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="container px-4 mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <InviteMember groupId={groupId} />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <ManageRoles memberships={memberships} setMemberships={setMemberships} />
      </div>
    </div>
  );
};

export default ManageUsersPage;
