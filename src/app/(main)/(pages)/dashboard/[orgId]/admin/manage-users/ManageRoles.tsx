'use client';

import React from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelectRole } from './SelectRole';

export const ManageRoles = () => {
  const { user } = useUser();
  const { isLoaded, memberships } = useOrganization({
    memberships: {
      pageSize: 5,
      keepPreviousData: true,
    },
  });

  const filteredMemberships = memberships?.data?.filter(
    (mem) => mem.publicUserData.userId !== user?.id
  );

  if (!isLoaded) {
    return <>Loading...</>;
  }

  if (!filteredMemberships?.length || !memberships?.data?.length) {
    return <p>No users found in the organization.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Memberships List</h2>
      {filteredMemberships?.map((mem) => (
        <Card key={mem.id} className="mb-4">
          <CardHeader>
            <p>
              <strong>User:</strong> {mem.publicUserData.identifier}{' '}
              {mem.publicUserData.userId === user?.id && '(You)'}
            </p>
            <p>
              <strong>Joined:</strong> {mem.createdAt.toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <SelectRole
              defaultRole={mem.role}
              onChange={async (e) => {
                await mem.update({
                  role: e.target.value,
                });
                await memberships?.revalidate();
              }}
            />
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={async () => {
                await mem.destroy();
                await memberships?.revalidate();
              }}
            >
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
      <div className="flex justify-between mt-4">
        <Button
          disabled={!memberships?.hasPreviousPage || memberships?.isFetching}
          onClick={() => memberships?.fetchPrevious?.()}
        >
          Previous
        </Button>
        <Button
          disabled={!memberships?.hasNextPage || memberships?.isFetching}
          onClick={() => memberships?.fetchNext?.()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
