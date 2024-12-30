'use client';

import React from 'react';
import { InviteMember } from './InviteMember';
import { InvitationList } from './InvitationList';
import { ManageRoles } from './ManageRoles';

const ManageUsersPage = () => {
  return (
    <div className="container px-4 mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <InviteMember />
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Pending Invitations</h2>
        <InvitationList />
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Members</h2>
        <ManageRoles />
      </div>
    </div>
  );
};

export default ManageUsersPage;
