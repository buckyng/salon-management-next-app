'use client';

import React, { useEffect } from 'react';
import { CustomOrganizationPicker } from '@/components/global/CustomOrganizationPicker';
import RoleBasedActions from '@/components/global/RoleBasedActions';
import { Tables } from '@/lib/database.types';
import { useOrganizationContext } from '@/context/OrganizationContext';

export type MembershipRow = Tables<'organization_memberships'>;

const DashboardPage = () => {
  const {
    memberships,
    activeOrgId,
    setActiveOrgId,
    activeRole,
    setActiveRole,
    setActiveOrgName,
    loading,
    fetchMemberships,
  } = useOrganizationContext();

  const handleOrgChange = (orgId: string) => {
    setActiveOrgId(orgId);
    localStorage.setItem('activeOrgId', orgId);
    // Find and update the role for the selected organization
    const selectedMembership = memberships?.find(
      (membership) => membership.organizations.id === orgId
    );

    if (selectedMembership && selectedMembership.role_id) {
      setActiveRole(selectedMembership.roles.name);
      localStorage.setItem('activeRole', selectedMembership.roles.name);
      setActiveOrgName(selectedMembership.organizations.name);
      localStorage.setItem(
        'activeOrgName',
        selectedMembership.organizations.name
      );
    } else {
      console.error(`No role found for organization ID: ${orgId}`);
      setActiveRole(null);
      localStorage.removeItem('activeRole');
    }
  };

  useEffect(() => {
    try {
      if (!memberships) {
        fetchMemberships();
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  }, [fetchMemberships, memberships]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!memberships || memberships.length === 0) {
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
        activeOrg={activeOrgId}
        handleOrgChange={handleOrgChange}
      />
      {activeOrgId && (
        <RoleBasedActions activeOrgId={activeOrgId} activeRole={activeRole} />
      )}
    </div>
  );
};

export default DashboardPage;
