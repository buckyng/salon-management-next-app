'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface MembershipWithOrganization {
  organizations: {
    id: string;
    name: string;
  };
  role_id: string;
  roles: { name: string };
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
  isInitialized: boolean;
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
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load localStorage values on client-side mount
  useEffect(() => {
    const storedOrgId = localStorage.getItem('activeOrgId');
    const storedOrgName = localStorage.getItem('activeOrgName');
    const storedRole = localStorage.getItem('activeRole');
    const storedMemberships = localStorage.getItem('memberships');

    if (storedOrgId) setActiveOrgId(storedOrgId);
    if (storedOrgName) setActiveOrgName(storedOrgName);
    if (storedRole) setActiveRole(storedRole);
    if (storedMemberships) setMemberships(JSON.parse(storedMemberships));

    setIsInitialized(true); // Mark initialization as complete
  }, []);

  const fetchMemberships = useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      setLoading(true);
      const res = await fetch('/api/memberships/user', { signal });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to fetch memberships:', errorData.error);
        return;
      }

      const data = await res.json();
      setMemberships(data);

      // Persist memberships in localStorage
      localStorage.setItem('memberships', JSON.stringify(data));

      // Automatically set the first membership as active
      if (!activeOrgId && data.length > 0) {
        const defaultMembership = data[0];
        setActiveOrgId(defaultMembership.organizations.id);
        setActiveOrgName(defaultMembership.organizations.name);
        setActiveRole(defaultMembership.roles.name);

        // Save to localStorage
        localStorage.setItem('activeOrgId', defaultMembership.organizations.id);
        localStorage.setItem(
          'activeOrgName',
          defaultMembership.organizations.name
        );
        localStorage.setItem('activeRole', defaultMembership.roles.name);
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
  }, [activeOrgId]);

  // Sync changes to activeOrgId, activeOrgName, and activeRole to localStorage
  useEffect(() => {
    if (isInitialized) {
      if (activeOrgId) {
        localStorage.setItem('activeOrgId', activeOrgId);
      } else {
        localStorage.removeItem('activeOrgId');
      }

      if (activeOrgName) {
        localStorage.setItem('activeOrgName', activeOrgName);
      } else {
        localStorage.removeItem('activeOrgName');
      }

      if (activeRole) {
        localStorage.setItem('activeRole', activeRole);
      } else {
        localStorage.removeItem('activeRole');
      }
    }
  }, [activeOrgId, activeOrgName, activeRole, isInitialized]);

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
        isInitialized,
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
