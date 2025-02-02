'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

import { ColumnDef } from '@tanstack/react-table';

import { useGroup } from '@/context/GroupContext';
import { DataTable } from '@/components/ui/data-table';
import { formatToLocalTime } from '@/lib/utils/dateUtils';
import subscribeToCheckIns from '@/lib/supabase/services/realtimeCheckins';
import { CheckIn, EnrichedCheckIn } from '@/lib/types';
import { fetchCheckInsToday, fetchClientById } from '@/services/clientService';

const updateCheckInServiceStatus = async (
  groupId: string,
  checkInId: string,
  isInService: boolean
) => {
  const response = await fetch(`/api/check-ins/update-service-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, checkInId, isInService }),
  });
  if (!response.ok) throw new Error('Failed to update service status');
};

const CheckInManagementPage = () => {
  const { activeGroup } = useGroup();
  const [checkIns, setCheckIns] = useState<EnrichedCheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggleService = async (
    id: string | undefined,
    is_in_service: boolean
  ) => {
    if (!activeGroup?.id || !id) return;
    try {
      await updateCheckInServiceStatus(activeGroup.id, id, is_in_service);

      setCheckIns((prevCheckIns) => {
        // Update the `isInService` value for the specific check-in
        const updatedCheckIns = prevCheckIns.map((checkIn) =>
          checkIn.id === id ? { ...checkIn, is_in_service } : checkIn
        );

        // Reorder the array: `isInService: false` first, then `checkInTime` ascending
        return [...updatedCheckIns].sort((a, b) => {
          if (a.is_in_service === b.is_in_service) {
            return (
              new Date(b.created_at ?? '1970-01-01').getTime() -
              new Date(a.created_at ?? '1970-01-01').getTime()
            );
          }
          // Ensure `is_in_service: false` comes first
          return a.is_in_service ? 1 : -1;
        });
      });
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  useEffect(() => {
    if (!activeGroup?.id) return;

    const loadCheckIns = async () => {
      try {
        setLoading(true);
        const checkInsData = await fetchCheckInsToday(activeGroup.id);

        // Map and enrich check-ins with client data
        const enrichedCheckIns = checkInsData.map(
          (checkIn: EnrichedCheckIn) => {
            const clientData = checkIn.clients || {};
            const clientGroupDetails =
              clientData.client_group_details?.[0] || {};

            return {
              ...checkIn,
              clientName: `${clientData.first_name || 'Unknown'} ${
                clientData.last_name || 'Client'
              }`.trim(),
              clientPhone: clientData.phone,
              visitsBeforeToday: clientGroupDetails.number_of_visits || 0,
              lastVisitRating: clientGroupDetails.last_visit_rating || null,
            };
          }
        );

        // Sort enriched data
        const sortedCheckIns = enrichedCheckIns.sort((a, b) => {
          if (a.is_in_service === b.is_in_service) {
            return (
              new Date(b.created_at ?? '1970-01-01').getTime() -
              new Date(a.created_at ?? '1970-01-01').getTime()
            );
          }
          return a.is_in_service ? 1 : -1;
        });

        setCheckIns(sortedCheckIns);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = subscribeToCheckIns(
      activeGroup.id,
      async (newCheckIn) => {
        try {
          const clientData = await fetchClientById(
            activeGroup.id,
            newCheckIn.client_id
          );
          const enrichedCheckIn: EnrichedCheckIn = {
            ...newCheckIn,
            created_date: newCheckIn.created_at, // Add the 'created_date' property
            clientName: `${clientData.first_name} ${clientData.last_name}`,
            clientPhone: clientData.phone,
            visitsBeforeToday: clientData.number_of_visits || 0,
            lastVisitRating: clientData.last_visit_rating || null,
            clients: {
              first_name: clientData.first_name,
              last_name: clientData.last_name,
              phone: clientData.phone,
              client_group_details: [
                {
                  number_of_visits: clientData.number_of_visits || 0,
                  last_visit_rating: clientData.last_visit_rating || null,
                },
              ],
            },
          };

          setCheckIns((prevCheckIns) => {
            const updatedCheckIns = [...prevCheckIns, enrichedCheckIn];

            return updatedCheckIns.sort((a, b) => {
              if (a.is_in_service === b.is_in_service) {
                return (
                  new Date(b.created_at ?? '1970-01-01').getTime() -
                  new Date(a.created_at ?? '1970-01-01').getTime()
                );
              }
              return a.is_in_service ? 1 : -1;
            });
          });
        } catch (error) {
          console.error('Error enriching new check-in:', error);
        }
      }
    );

    loadCheckIns();

    return () => {
      unsubscribe();
    };
  }, [activeGroup?.id]);

  const columns: ColumnDef<CheckIn>[] = [
    {
      header: 'Time',
      accessorKey: 'created_at',
      cell: ({ getValue }) => formatToLocalTime(getValue<string>()),
    },
    { header: 'Client Name', accessorKey: 'clientName' },
    {
      header: 'Phone',
      accessorKey: 'clientPhone',
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
    </div>
  );
};

export default CheckInManagementPage;
