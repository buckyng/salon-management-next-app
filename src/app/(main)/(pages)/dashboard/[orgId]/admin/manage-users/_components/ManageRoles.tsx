'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelectRole } from './SelectRole';
import { useUserContext } from '@/context/UserContext';
import { useOrganizationContext } from '@/context/OrganizationContext';

type Membership = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  users: {
    id: string;
    email: string;
    name: string | null;
  };
};

export const ManageRoles = () => {
  const { authUser, dbUser } = useUserContext();
  const { activeOrgId } = useOrganizationContext();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser || !activeOrgId || !dbUser?.id) return;

    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/memberships/admin?orgId=${activeOrgId}`);
        const data = await res.json();

        if (res.ok) {
          setMemberships(
            data.filter((mem: Membership) => mem.users.id !== dbUser.id) // dont show the current user in the list
          );
        } else {
          console.error('Failed to fetch memberships:', data.error);
        }
      } catch (error) {
        console.error('Error fetching memberships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [activeOrgId, dbUser?.id, authUser]);

  const handleRoleChange = async (
    membershipId: string,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const role = event.target.value;
    try {
      const res = await fetch(`/api/memberships/${membershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        setMemberships((prev) =>
          prev.map((mem) => (mem.id === membershipId ? { ...mem, role } : mem))
        );
      } else {
        const error = await res.json();
        console.error('Failed to update role:', error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    try {
      const res = await fetch(`/api/memberships/${membershipId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMemberships((prev) => prev.filter((mem) => mem.id !== membershipId));
      } else {
        const error = await res.json();
        console.error('Failed to remove member:', error);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (loading) {
    return <>Loading...</>;
  }

  if (!memberships || !memberships.length) {
    return <p>No users found in the organization.</p>;
  }

  if (!activeOrgId) {
    return <p>No organization selected.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Memberships List</h2>
      {memberships.map((mem) => (
        <Card key={mem.id} className="mb-4">
          <CardHeader>
            <p>
              <strong>User:</strong> {mem.users.email}{' '}
              {mem.user_id === dbUser?.id && '(You)'}
            </p>
            <p>
              <strong>Joined:</strong>{' '}
              {new Date(mem.created_at).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <SelectRole
              orgId={activeOrgId}
              defaultRole={mem.role}
              onChange={(role) => handleRoleChange(mem.id, role)}
            />
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={() => handleRemoveMember(mem.id)}
            >
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
