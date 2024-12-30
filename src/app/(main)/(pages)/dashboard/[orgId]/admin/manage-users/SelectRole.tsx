'use client';
import React, { useState, useEffect, useRef, ChangeEventHandler } from 'react';
import { useOrganization } from '@clerk/nextjs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SelectRoleProps = {
  fieldName?: string;
  isDisabled?: boolean;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  defaultRole?: string;
};
export const SelectRole = (props: SelectRoleProps) => {
  const { isDisabled = false, onChange, defaultRole } = props;
  const { organization } = useOrganization();
  const [fetchedRoles, setFetchedRoles] = useState<string[]>([]);
  const isPopulated = useRef(false);

  useEffect(() => {
    if (isPopulated.current) return;
    organization
      ?.getRoles({
        pageSize: 20,
        initialPage: 1,
      })
      .then((res) => {
        isPopulated.current = true;
        setFetchedRoles(res.data.map((role) => role.key));
      });
  }, [organization]);

  return (
    <Select
      defaultValue={defaultRole || ''}
      disabled={isDisabled}
      onValueChange={(value) =>
        onChange?.({
          target: { value },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Role" />
      </SelectTrigger>
      <SelectContent>
        {fetchedRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
