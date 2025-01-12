'use client';

import React, { useEffect, useState } from 'react';
import { CustomOrganizationPicker } from '@/components/global/CustomOrganizationPicker';
import RoleBasedActions from '@/components/global/RoleBasedActions';
import { Tables } from '@/lib/database.types';

export type MembershipRow = Tables<'organization_memberships'>;

type MembershipWithOrganization = {
  organizations: {
    id: string;
    name: string;
  };
} & MembershipRow;

const DashboardPage = () => {
  const [memberships, setMemberships] = useState<
    MembershipWithOrganization[] | null
  >(null);
  const [activeOrg, setActiveOrg] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/memberships');
        const data = await res.json();

        if (res.ok) {
          setMemberships(data);
          // Set the active organization if not already selected
          const storedActiveOrg = localStorage.getItem('activeOrg');
          const storedActiveRole = localStorage.getItem('activeRole');
          if (storedActiveOrg && storedActiveRole) {
            setActiveOrg(storedActiveOrg);
            setActiveRole(storedActiveRole);
          } else if (data.length > 0) {
            const defaultOrg = data[0].organizations.id;
            const defaultRole = data[0].role;
            setActiveOrg(defaultOrg);
            setActiveRole(defaultRole);

            localStorage.setItem('activeOrg', defaultOrg);
            localStorage.setItem('activeRole', defaultRole);
          }
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
  }, []);

  const handleOrgChange = (orgId: string) => {
    setActiveOrg(orgId);
    localStorage.setItem('activeOrg', orgId);

    // Find and update the role for the selected organization
    const selectedMembership = memberships?.find(
      (membership) => membership.organizations.id === orgId
    );
    if (selectedMembership && selectedMembership.role_id) {
      setActiveRole(selectedMembership.role_id);
      localStorage.setItem('activeRole', selectedMembership.role_id);
    } else {
      console.error(`No role found for organization ID: ${orgId}`);
      setActiveRole(null);
      localStorage.removeItem('activeRole');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!memberships) {
    return (
      <p>You don’t belong to any organizations. Please contact support.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative p-6">
      <h1 className="text-4xl sticky top-0 z-[10] bg-background/50 backdrop-blur-lg flex items-center border-b">
        Dashboard
      </h1>
      <h2> Select Organization </h2>
      <CustomOrganizationPicker
        organizations={memberships.map((m) => ({
          id: m.organizations.id,
          name: m.organizations.name,
        }))}
        activeOrg={activeOrg}
        handleOrgChange={handleOrgChange}
      />
      {activeOrg && <RoleBasedActions orgId={activeOrg} orgRole={activeRole} />}
    </div>
  );
};

export default DashboardPage;
