'use client';

import { FC, useCallback, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { OrganizationMembershipResource } from '@clerk/types';

interface CustomOrganizationPickerProps {
  organizations: OrganizationMembershipResource[];
  activeOrg: string | null;
  setActiveOrg: (orgId: string) => void;
  setActive: (params: { organization: string }) => Promise<void>;
}

export const CustomOrganizationPicker: FC<CustomOrganizationPickerProps> = ({
  organizations,
  activeOrg,
  setActiveOrg,
  setActive,
}) => {
  const handleSelect = useCallback(
    async (orgId: string) => {
      setActiveOrg(orgId);
      try {
        await setActive({ organization: orgId });
      } catch (error) {
        console.error('Failed to set active organization:', error);
      }
    },
    [setActiveOrg, setActive]
  );

  useEffect(() => {
    if (!activeOrg && organizations.length > 0) {
      handleSelect(organizations[0].organization.id);
    }
  }, [activeOrg, handleSelect, organizations]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {organizations.find((org) => org.organization.id === activeOrg)
            ?.organization.name || 'Select Organization'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.organization.id}
            onClick={() => handleSelect(org.organization.id)}
          >
            {org.organization.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
