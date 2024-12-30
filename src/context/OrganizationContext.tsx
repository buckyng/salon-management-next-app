'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';

interface OrganizationContextProps {
  dbOrganizationId: string | null;
  organizationName: string | null;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextProps>({
  dbOrganizationId: null,
  organizationName: null,
  loading: true,
});

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { organization } = useOrganization();
  const [dbOrganizationId, setDbOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDbOrganizationId = async () => {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/prisma/organization', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getDbOrganizationId',
            clerkId: organization.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDbOrganizationId(data.dbOrganizationId);
          setOrganizationName(organization.name || null);
        } else {
          console.error('Failed to fetch dbOrganizationId');
        }
      } catch (error) {
        console.error('Error fetching dbOrganizationId:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDbOrganizationId();
  }, [organization]);

  return (
    <OrganizationContext.Provider
      value={{ dbOrganizationId, organizationName, loading }}
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
