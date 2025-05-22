'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { registerBeamsForUser } from '@/lib/push/registerBeams';
import { useUser } from '@/context/UserContext';
import type { Client as BeamsClient } from '@pusher/push-notifications-web';

export default function EnableNotificationsButton() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      await registerBeamsForUser(user.id);
      // you can also toast.success(...) here
    } catch (err: unknown) {
      console.error(err);
      // Narrow down the error message
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // disable if already registered
  const already =
    typeof window !== 'undefined' &&
    (window as Window & { beamsClient?: BeamsClient }).beamsClient !==
      undefined;

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading || already}>
        {already
          ? 'Notifications Enabled'
          : loading
          ? 'Enabling…'
          : 'Enable Notifications'}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
