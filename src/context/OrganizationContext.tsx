'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

interface MembershipWithOrganization {
  organizations: {
    id: string;
    name: string;
  };
  role_id: string;
  roles: {name: string};
}

interface OrganizationContextType {
  memberships: MembershipWithOrganization[] | null;
  activeOrgId: string | null;  
  setActiveOrgId: (orgId: string | null) => void;
  activeOrgName: string | null;
  setActiveOrgName: (name: string | null) => void;
  activeRole: string | null;
  setActiveRole: (roleId: string | null) => void;
  loading: boolean;
  fetchMemberships: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [memberships, setMemberships] = useState<
    MembershipWithOrganization[] | null
  >(null);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [activeOrgName, setActiveOrgName] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMemberships = useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      setLoading(true);
      const res = await fetch('/api/memberships', { signal });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to fetch memberships:', errorData.error);
        return;
      }

      const data = await res.json();
      setMemberships(data);

      // Automatically set the first membership as active
      if (data.length > 0) {
        setActiveOrgId(data[0].organizations.id);
        setActiveOrgName(data[0].organizations.name);
        setActiveRole(data[0].roles.name);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching memberships:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <OrganizationContext.Provider
      value={{
        memberships,
        activeOrgId,
        setActiveOrgId,
        activeOrgName,
        setActiveOrgName,
        activeRole,
        setActiveRole,
        loading,
        fetchMemberships,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationContext = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      'useOrganizationContext must be used within an OrganizationProvider'
    );
  }

  return context;
};

export default OrganizationContext;
