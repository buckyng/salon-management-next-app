'use client';
import React, { ChangeEventHandler } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoles } from '@/hooks/useRoles';

type SelectRoleProps = {
  orgId: string;
  fieldName?: string;
  isDisabled?: boolean;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  defaultRole?: string;
};
export const SelectRole = (props: SelectRoleProps) => {
  const { isDisabled = false, onChange, defaultRole, orgId } = props;
  const { roles, loading } = useRoles(orgId);

  return (
    <Select
      defaultValue={defaultRole || ''}
      disabled={isDisabled || loading}
      onValueChange={(value) =>
        onChange?.({
          target: { value },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? 'Loading...' : 'Select Role'} />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
