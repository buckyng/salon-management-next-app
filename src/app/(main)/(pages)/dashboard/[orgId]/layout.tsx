'use client';

import { useOrganizationContext } from '@/context/OrganizationContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

type Props = { children: React.ReactNode; params: { orgId: string } };

const Layout = ({ children, params }: Props) => {
  const router = useRouter();
  const {
    activeOrgId,
    setActiveOrgId,
    activeRole,
    memberships,
    setActiveRole,
    activeOrgName,
    isInitialized,
  } = useOrganizationContext();

  useEffect(() => {
    if (!isInitialized) return;

    if (!params.orgId) {
      console.error('Organization ID is missing in the route.');
      router.push('/dashboard');
      return;
    }

    if (params.orgId !== activeOrgId) {
      setActiveOrgId(params.orgId);

      // Find the role for the selected organization from memberships
      const membership = memberships?.find(
        (m) => m.organizations.id === params.orgId
      );

      if (membership) {
        setActiveRole(membership.roles.name);
      } else {
        console.warn('No membership found for the selected organization.');
        setActiveRole(null);
      }
    }
  }, [
    params.orgId,
    activeOrgId,
    memberships,
    setActiveOrgId,
    setActiveRole,
    router,
    isInitialized,
  ]);

  if (!isInitialized) {
    return <p>Loading...</p>;
  }

  if (!activeOrgId || !activeRole) {
    return (
      <div className="p-6">
        <p>
          You must select an organization and role to continue. Please return to
          the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-lg">Dashboard - {activeOrgName}</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default Layout;
