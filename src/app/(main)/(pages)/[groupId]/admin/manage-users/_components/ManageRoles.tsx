'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelectRole } from './SelectRole';
import { Membership } from '@/lib/types';
import { useUser } from '@/context/UserContext';

interface ManageRolesProps {
  memberships: Membership[];
  setMemberships: React.Dispatch<React.SetStateAction<Membership[]>>;
}

export const ManageRoles: React.FC<ManageRolesProps> = ({
  memberships,
  setMemberships,
}) => {
  const { user: currentUser } = useUser();

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
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error updating role:', err.message);
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

      setMemberships((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error removing member:', err.message);
      }
    }
  };

  return (
    <div>
      {memberships.map((member) => (
        <Card key={member.id} className="mb-4">
          <CardHeader>
            <p>
              <strong>User: </strong> {member.profiles.email} -{' '}
              {member.profiles.name}
            </p>
          </CardHeader>
          <CardContent>
            <SelectRole
              defaultRole={member.role}
              onChange={(newRole) => handleRoleChange(member.id, newRole)}
              isDisabled={member.user_id === currentUser?.id}
            />
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={() => handleRemoveMember(member.id)}
              disabled={member.user_id === currentUser?.id}
            >
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
