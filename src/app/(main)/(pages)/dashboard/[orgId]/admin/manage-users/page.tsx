'use client';

import React from 'react';
import { InviteMember } from './_components/InviteMember';
import { ManageRoles } from './_components/ManageRoles';
import { useOrganizationContext } from '@/context/OrganizationContext';

const ManageUsersPage = () => {
  const { activeOrgId } = useOrganizationContext();

  if (!activeOrgId) {
    return <p>No active orgId</p>;
  }

  return (
    <div className="container px-4 mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <InviteMember orgId={activeOrgId} />
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Members</h2>
        <ManageRoles />
      </div>
    </div>
  );
};

export default ManageUsersPage;
