'use client';

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface SelectRoleProps {
  defaultRole: string;
  onChange: (newRole: string) => void;
  roles: Record<string, string>;
  isDisabled?: boolean;
}

export const SelectRole: React.FC<SelectRoleProps> = ({
  defaultRole,
  onChange,
  roles,
  isDisabled = false,
}) => {
  return (
    <Select
      defaultValue={defaultRole}
      disabled={isDisabled}
      onValueChange={(value) => onChange(value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Role" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(roles).map(([id, name]) => (
          <SelectItem key={id} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
