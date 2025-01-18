'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Role {
  id: string;
  name: string;
}

interface SelectRoleProps {
  defaultRole: string;
  onChange: (newRole: string) => void;
  isDisabled?: boolean;
}

export const SelectRole: React.FC<SelectRoleProps> = ({
  defaultRole,
  onChange,
  isDisabled = false,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPopulated = useRef(false);

  useEffect(() => {
    if (isPopulated.current) return;

    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/groupUsers/roles');
        const data = await response.json();

        if (response.ok) {
          setRoles(data);
          isPopulated.current = true;
        } else {
          throw new Error(data.error || 'Failed to fetch roles.');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching roles:', err.message);
          setError(err.message);
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  if (loading) return <p>Loading roles...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.name}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
