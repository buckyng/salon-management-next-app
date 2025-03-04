'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { formatToLocalTime } from '@/lib/utils/dateUtils';
import { EnrichedCheckIn } from '@/lib/types';
import { useCheckInManagement } from '@/lib/hooks/useCheckInManagement';
import ClientDetailsDrawer from './_components/ClientDetailsDrawer';

const CheckInManagement = () => {
  const { checkIns, loading, handleToggleService } = useCheckInManagement();
  const [selectedClient, setSelectedClient] = useState<EnrichedCheckIn | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (client: EnrichedCheckIn) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const columns: ColumnDef<EnrichedCheckIn>[] = [
    {
      header: 'Time',
      accessorKey: 'created_at',
      cell: ({ getValue }) => formatToLocalTime(getValue<string>()),
    },
    {
      header: 'Client Name',
      accessorKey: 'clientName',
      cell: ({ row }) => (
        <button onClick={() => openDrawer(row.original)}>
          {row.original.clientName}
        </button>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'clientPhone',
      cell: ({ row }) => (
        <button onClick={() => openDrawer(row.original)}>
          {row.original.clientPhone}
        </button>
      ),
    },
    {
      header: 'Visits Before Today',
      accessorKey: 'visitsBeforeToday',
    },
    {
      header: 'In Service?',
      accessorKey: 'is_in_service',
      cell: ({ row, getValue }) => (
        <Switch
          checked={getValue<boolean>()}
          onCheckedChange={(checked) =>
            handleToggleService(row.original.id, checked)
          }
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="container p-4 space-y-6">
        <h1 className="text-2xl font-bold text-center">Check-In Management</h1>
        <p>Loading check-ins...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
      {/* Header Section */}
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Check-In Management
        </h1>
      </header>

      {/* Data Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <DataTable
          columns={columns}
          data={checkIns}
          getRowProps={(row) => ({
            className: `px-4 py-2 ${
              row.is_in_service
                ? 'line-through text-red-600 dark:text-red-400'
                : 'text-gray-800 dark:text-gray-200'
            }`,
          })}
        />
      </div>

      {/* Client Details Drawer */}
      <ClientDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={selectedClient}
      />
    </div>
  );
};

export default CheckInManagement;
