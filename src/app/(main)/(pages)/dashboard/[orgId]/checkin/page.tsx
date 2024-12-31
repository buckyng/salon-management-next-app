'use client';

import React, { useEffect, useState } from 'react';
import { CheckInTable } from './CheckInTable';
import {
  fetchCheckIns,
  updateCheckInService,
} from '@/lib/client/checkInService';
import { useOrganizationContext } from '@/context/OrganizationContext';

const CheckInPage = () => {
  const { dbOrganizationId } = useOrganizationContext();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = dbOrganizationId;

  useEffect(() => {
    const loadCheckIns = async () => {
      if (!orgId) return;

      setLoading(true);
      const data = await fetchCheckIns(orgId);
      setCheckIns(data);
      setLoading(false);
    };

    loadCheckIns();
  }, [orgId]);

  const handleToggle = async (checkInId: string, isInService: boolean) => {
    const updatedCheckIns = await updateCheckInService(
      orgId!,
      checkInId,
      isInService
    );
    setCheckIns(updatedCheckIns);
  };

  if (loading) {
    return <p>Loading check-ins...</p>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Check-In Management</h1>
      <CheckInTable checkIns={checkIns} onToggle={handleToggle} />
    </div>
  );
};

export default CheckInPage;
