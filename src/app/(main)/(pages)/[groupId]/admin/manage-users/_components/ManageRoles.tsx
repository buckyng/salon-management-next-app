'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectRole } from './SelectRole';
import { Membership } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface ManageRolesProps {
  memberships: Membership[];
  setMemberships: React.Dispatch<React.SetStateAction<Membership[]>>;
  roles: Record<string, string>;
}

export const ManageRoles: React.FC<ManageRolesProps> = ({
  memberships,
  setMemberships,
  roles,
}) => {
  const { user: currentUser } = useUser();
  const [showEmail, setShowEmail] = useState(false);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch('/api/groupUsers/updateRole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role.');
      }

      setMemberships((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      toast.success('Role updated successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error updating role:', err.message);
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch('/api/groupUsers/removeMember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member.');
      }

      setMemberships((prev) => prev.filter((member) => member.id !== memberId));
      toast.success('Member removed successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error removing member:', err.message);
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const columns: ColumnDef<Membership>[] = [
    ...(showEmail
      ? [
          {
            header: 'Email',
            accessorKey: 'profiles.email',
          },
        ]
      : []),
    {
      header: 'Name',
      accessorKey: 'profiles.name',
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ row }) => (
        <SelectRole
          defaultRole={row.original.role}
          onChange={(newRole) => handleRoleChange(row.original.id, newRole)}
          isDisabled={row.original.user_id === currentUser?.id}
          roles={roles}
        />
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => handleRemoveMember(row.original.id)}
          disabled={row.original.user_id === currentUser?.id}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Toggle Button */}
      <div className="mb-4 flex justify-between">
        <Button onClick={() => setShowEmail((prev) => !prev)}>
          {showEmail ? 'Hide Emails' : 'Show Emails'}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={memberships} />
    </div>
  );
};
