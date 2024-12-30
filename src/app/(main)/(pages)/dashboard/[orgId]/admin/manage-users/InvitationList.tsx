'use client';

import React from 'react';
import { useOrganization } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const InvitationList = () => {
  const { isLoaded, invitations, memberships } = useOrganization({
    invitations: {
      pageSize: 5,
      keepPreviousData: true,
    },
    memberships: {
      pageSize: 5,
      keepPreviousData: true,
    },
  });

  if (!isLoaded) {
    return <>Loading...</>;
  }

  if (!memberships?.data?.length) {
    return <p>No users found in the organization.</p>;
  }

  return (
    <div className="space-y-4">
      {invitations?.data?.map((inv) => (
        <Card key={inv.id} className="p-4 flex justify-between items-center">
          <div>
            <p>Email: {inv.emailAddress}</p>
            <p>Role: {inv.role}</p>
            <p>Invited on: {inv.createdAt.toLocaleDateString()}</p>
          </div>
          <Button
            variant="destructive"
            onClick={async () => {
              await inv.revoke();
              await Promise.all([
                memberships?.revalidate(),
                invitations?.revalidate(),
              ]);
            }}
          >
            Revoke
          </Button>
        </Card>
      ))}
      <div className="flex justify-between">
        <Button
          disabled={!invitations?.hasPreviousPage || invitations?.isFetching}
          onClick={() => invitations?.fetchPrevious?.()}
        >
          Previous
        </Button>
        <Button
          disabled={!invitations?.hasNextPage || invitations?.isFetching}
          onClick={() => invitations?.fetchNext?.()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
