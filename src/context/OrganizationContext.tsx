'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getOrganizationDetails } from '@/actions/organizations';

interface OrganizationContextProps {
  activeOrgId: string | null;
  organizationName: string | null;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextProps>({
  activeOrgId: null,
  organizationName: null,
  loading: true,
});

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      setLoading(true);

      try {
        // Get activeOrgId from URL params or localStorage
        const paramOrgId = searchParams.get('orgId');
        const storedOrgId = localStorage.getItem('activeOrg');
        const currentOrgId = paramOrgId || storedOrgId;

        if (!currentOrgId) {
          setActiveOrgId(null);
          setOrganizationName(null);
          setLoading(false);
          return;
        }

        setActiveOrgId(currentOrgId);

        // Fetch organization details via server action
        const orgData = await getOrganizationDetails(currentOrgId);
        console.log('orgData:', orgData);
        setOrganizationName(orgData.name);

        // Save the activeOrgId to localStorage
        localStorage.setItem('activeOrg', currentOrgId);
      } catch (error) {
        console.error('Error fetching organization details:', error);
        setActiveOrgId(null);
        setOrganizationName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [searchParams, pathname]);

  return (
    <OrganizationContext.Provider
      value={{
        activeOrgId,
        organizationName,
        loading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationContext = (): OrganizationContextProps => {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      'useOrganizationContext must be used within an OrganizationProvider'
    );
  }

  return context;
};

export default OrganizationContext;
