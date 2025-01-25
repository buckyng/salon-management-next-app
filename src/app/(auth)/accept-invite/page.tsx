'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AcceptInvitePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAcceptInvite = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/invite/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to validate invite');
      }

      const { groupId } = await res.json();
      router.push(`/auth/register?groupId=${groupId}&token=${token}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    if (token) {
      handleAcceptInvite(token);
    } else {
      setError('Invite token is missing.');
    }
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="text-center">
      {loading ? <p>Validating invite...</p> : <p>Redirecting...</p>}
    </div>
  );
}
