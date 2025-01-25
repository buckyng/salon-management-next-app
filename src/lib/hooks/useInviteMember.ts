'use client';

import { useState } from 'react';

interface UseInviteMemberProps {
  groupId: string;
}

export const useInviteMember = ({ groupId }: UseInviteMemberProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitation = async () => {
    if (!email) {
      setError('Email address is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation.');
      }

      setEmail(''); // Clear the email input
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error sending invitation:', err.message);
        setError(err.message);
      } else {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    sendInvitation,
  };
};
