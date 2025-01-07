import { useEffect, useState } from 'react';

export const useRoles = (orgId: string) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/roles?orgId=${orgId}`);
        if (!res.ok) {
          const error = await res.json();
          setError(error.message || 'Failed to fetch roles');
          return;
        }
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        setError((err as Error).message || 'Error fetching roles');
      } finally {
        setLoading(false);
      }
    };

    if (orgId) fetchRoles();
  }, [orgId]);

  return { roles, loading, error };
};
