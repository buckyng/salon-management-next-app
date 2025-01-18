'use client';

import { FC, useCallback, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface CustomOrganizationPickerProps {
  organizations: { id: string; name: string }[];
  activeOrg: string | null;
  handleOrgChange: (orgId: string) => void;
}

export const CustomOrganizationPicker: FC<CustomOrganizationPickerProps> = ({
  organizations,
  activeOrg,
  handleOrgChange,
}) => {
  const handleSelect = useCallback(
    async (orgId: string) => {
      try {
        handleOrgChange(orgId);
      } catch (error) {
        console.error('Failed to set active organization:', error);
      }
    },
    [handleOrgChange]
  );

  useEffect(() => {
    if (!activeOrg && organizations.length > 0) {
      handleSelect(organizations[0].id);
    }
  }, [activeOrg, handleSelect, organizations]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {organizations.find((org) => org.id === activeOrg)
            ?.name || 'Select Organization'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSelect(org.id)}
          >
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
