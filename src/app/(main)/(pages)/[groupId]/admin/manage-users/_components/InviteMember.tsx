'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface InviteMemberProps {
  groupId: string;
}

export const InviteMember: React.FC<InviteMemberProps> = ({ groupId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/groupUsers/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation.');
      }

      toast('Invitation sent successfully!');
      setEmail('');
    } catch (err: unknown) {
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

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Invite New Member</h2>
      <input
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded p-2 mb-4 w-full"
      />
      <Button onClick={handleInvite} disabled={loading}>
        {loading ? 'Sending...' : 'Send Invitation'}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
