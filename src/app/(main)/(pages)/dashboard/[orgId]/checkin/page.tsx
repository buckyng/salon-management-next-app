'use client';

import React, { useEffect, useState } from 'react';
import { CheckInTable } from './CheckInTable';
import { updateCheckInService } from '@/lib/client/checkInService';
import { useOrganizationContext } from '@/context/OrganizationContext';
import { FormattedCheckInResponse } from '@/lib/types';

const CheckInPage = () => {
  const { activeOrgId } = useOrganizationContext();
  const [checkIns, setCheckIns] = useState<FormattedCheckInResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) return;

    // Fetch initial check-ins
    const fetchData = async () => {
      try {
        // const data = [];//todo: call getCheckInsService
        // setCheckIns(data);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeOrgId]);

  const handleToggle = async (checkInId: string, isInService: boolean) => {
    try {
      const updatedCheckIn = await updateCheckInService(
        activeOrgId!,
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
