'use client';

import React, { useEffect, useState } from 'react';
import { CustomOrganizationPicker } from '@/components/global/CustomOrganizationPicker';
import { useAuth, useOrganizationList } from '@clerk/nextjs';
import RoleBasedActions from '@/components/global/RoleBasedActions';

const DashboardPage = () => {
  const { userMemberships, isLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });

  const { orgId } = useAuth();
  const [activeOrg, setActiveOrg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userMemberships) return;

    // User doesn't belong to any organizations
    if (userMemberships.count === 0) return;

    //check if the user has any active organization then set that value of the selection
    if (orgId) {
      setActiveOrg(orgId);
    } else {
      // if no active org, set the active organization to the first one in the list
      const defaultOrg = userMemberships.data[0];
      setActiveOrg(defaultOrg.organization.id);

      // Set the active organization
      setActive({ organization: defaultOrg.organization.id }).catch((error) =>
        console.error('Failed to set active organization:', error)
      );
    }
  }, [isLoaded, orgId, setActive, userMemberships]);

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  if (userMemberships.count === 0) {
    return (
      <p>You don&apos;t belong to any organizations. Please contact support.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative p-6">
      <h1 className="text-4xl sticky top-0 z-[10] bg-background/50 backdrop-blur-lg flex items-center border-b">
        Dashboard
      </h1>
      <h2> Select Organization </h2>
      <CustomOrganizationPicker
        organizations={userMemberships.data}
        activeOrg={activeOrg}
        setActiveOrg={setActiveOrg}
        setActive={setActive}
      />
      {activeOrg && <RoleBasedActions orgId={activeOrg} />}
    </div>
  );
};

export default DashboardPage;
