'use client';

import React, { useEffect, useState } from 'react';
import { CheckInTable } from './CheckInTable';
import {
  fetchCheckIns,
  updateCheckInService,
} from '@/lib/client/checkInService';
import { useOrganizationContext } from '@/context/OrganizationContext';
import { getPusherClient } from '@/lib/pusher-client';
import { FormattedCheckInResponse } from '@/lib/types';

const CheckInPage = () => {
  const { dbOrganizationId } = useOrganizationContext();
  const [checkIns, setCheckIns] = useState<FormattedCheckInResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const pusher = getPusherClient();

  useEffect(() => {
    if (!dbOrganizationId) return;

    // Fetch initial check-ins
    const fetchData = async () => {
      try {
        const data = await fetchCheckIns(dbOrganizationId);
        setCheckIns(data);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to Pusher for real-time updates
    const channel = pusher.subscribe(`organization-${dbOrganizationId}`);

    channel.bind('check-in-added', (newCheckIn: FormattedCheckInResponse) => {
      setCheckIns((prevCheckIns) => {
        const updatedCheckIns = prevCheckIns.filter(
          (checkIn) => checkIn.id !== newCheckIn.id
        );
        return [...updatedCheckIns, newCheckIn];
      });
    });

    channel.bind('check-in-updated', (data: FormattedCheckInResponse) => {
      setCheckIns((prevCheckIns) =>
        prevCheckIns.map((checkIn) => (checkIn.id === data.id ? data : checkIn))
      );
    });

    // Cleanup
    // return () => {
    //   pusher.unsubscribe(`organization-${dbOrganizationId}`);
    //   pusher.disconnect();
    // };
  }, [dbOrganizationId, pusher]);

  const handleToggle = async (checkInId: string, isInService: boolean) => {
    try {
      const updatedCheckIn = await updateCheckInService(
        dbOrganizationId!,
        checkInId,
        isInService
      );

      setCheckIns((prevCheckIns) =>
        prevCheckIns.map((checkIn) =>
          checkIn.id === updatedCheckIn.id ? updatedCheckIn : checkIn
        )
      );
    } catch (error) {
      console.error('Error updating check-in:', error);
    }
  };

  if (loading) {
    return <p>Loading check-ins...</p>;
  }

  const sortedCheckIns = [...checkIns].sort((a, b) => {
    // Sort by isInService first
    if (a.isInService !== b.isInService) {
      return a.isInService ? 1 : -1;
    }

    // Then by createdAt
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Check-In Management</h1>
      <CheckInTable checkIns={sortedCheckIns} onToggle={handleToggle} />
    </div>
  );
};

export default CheckInPage;
