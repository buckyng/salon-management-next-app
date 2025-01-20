'use client';

import { FC } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface CustomOrganizationPickerProps {
  organizations: { id: string; name: string }[];
  selectedOrg: string | null;
  setSelectedOrg: (orgId: string) => void;
}

export const CustomOrganizationPicker: FC<CustomOrganizationPickerProps> = ({
  organizations,
  selectedOrg,
  setSelectedOrg,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {organizations.find((org) => org.id === selectedOrg)?.name ||
            'Select Organization'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setSelectedOrg(org.id)} // Only update the selected organization
          >
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
