'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchClientCheckInHistory } from '@/services/clientService';
import { EnrichedCheckIn } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import GoBackButton from '@/components/ui/GoBackButton';
import LoadingSpinner from '@/components/global/LoadingSpinner';

const CheckInHistoryPage = () => {
  const { clientId, groupId } = useParams() as {
    clientId: string;
    groupId: string;
  };
  const [checkIns, setCheckIns] = useState<EnrichedCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const fetchHistory = async () => {
      try {
        const data = await fetchClientCheckInHistory(groupId, clientId);
        setCheckIns(data);
      } catch (error) {
        console.error('Error fetching check-in history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [clientId, groupId]);

  const columns: ColumnDef<EnrichedCheckIn>[] = [
    {
      header: '#',
      accessorKey: 'index',
      cell: ({ row }) => row.index + 1, // Show row index starting from 1
    },
    {
      header: 'Check-in Time',
      accessorKey: 'created_at',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(), // Full date and time format
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto mt-6 p-4">
      <GoBackButton />
      <h1 className="text-2xl font-bold mb-4">Check-in History</h1>

      {checkIns.length > 0 ? (
        <DataTable columns={columns} data={checkIns} enablePagination={true} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No check-in history found for this client.
        </p>
      )}
    </div>
  );
};

export default CheckInHistoryPage;
