'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

import { ColumnDef } from '@tanstack/react-table';

import { useGroup } from '@/context/GroupContext';
import { Tables } from '@/lib/database.types';
import { DataTable } from '@/components/ui/data-table';
import { formatToLocalTime } from '@/lib/utils/dateUtils';
import subscribeToCheckIns from '@/lib/supabase/services/realtimeCheckins';

type CheckIn = Tables<'check_ins'>;

type EnrichedCheckIn = CheckIn & {
  clientName: string;
  visitsBeforeToday: number;
  lastVisitRating: number | null;
};

const fetchCheckInsToday = async (
  groupId: string
): Promise<EnrichedCheckIn[]> => {
  const response = await fetch(`/api/check-ins/fetch-today?groupId=${groupId}`);
  if (!response.ok) throw new Error('Failed to fetch check-ins');
  return await response.json();
};

const fetchClientById = async (groupId: string, clientId: string) => {
  const response = await fetch(
    `/api/clients/fetch-by-id?groupId=${groupId}&clientId=${clientId}`
  );
  if (!response.ok) throw new Error('Failed to fetch client');
  return await response.json();
};

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
              new Date(a.created_at ?? '1970-01-01').getTime() -
              new Date(b.created_at ?? '1970-01-01').getTime()
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

        // Add visitsBeforeToday and lastVisitRating from client data
        const enrichedCheckIns = await Promise.all(
          checkInsData.map(async (checkIn: CheckIn) => {
            try {
              const clientData = await fetchClientById(
                activeGroup.id,
                checkIn.client_id
              );
              return {
                ...checkIn,
                visitsBeforeToday:
                  clientData.client_group_details[0].number_of_visits || 0,
                lastVisitRating:
                  clientData.client_group_details[0].last_visit_rating || null,
                clientName: clientData.first_name
                  ? `${clientData.first_name} ${clientData.last_name}`.trim()
                  : 'Unknown Client',
              };
            } catch (error) {
              console.error(
                `Error fetching client data for ${checkIn.client_id}:`,
                error
              );
              return {
                ...checkIn,
                visitsBeforeToday: 0,
                lastVisitRating: null,
                clientName: 'Unknown Client',
              };
            }
          })
        );

        // Sort the enriched data
        const sortedCheckIns = enrichedCheckIns.sort((a, b) => {
          if (a.is_in_service === b.is_in_service) {
            return (
              new Date(a.created_at ?? '1970-01-01').getTime() -
              new Date(b.created_at ?? '1970-01-01').getTime()
            );
          }
          return a.is_in_service ? 1 : -1; // Move isInService === true to the end
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
            clientName: `${clientData.first_name} ${clientData.last_name}`,
            visitsBeforeToday: clientData.number_of_visits || 0,
            lastVisitRating: clientData.last_visit_rating || null,
          };

          setCheckIns((prevCheckIns) => {
            const updatedCheckIns = [...prevCheckIns, enrichedCheckIn];

            return updatedCheckIns.sort((a, b) => {
              if (a.is_in_service === b.is_in_service) {
                return (
                  new Date(a.created_at ?? '1970-01-01').getTime() -
                  new Date(b.created_at ?? '1970-01-01').getTime()
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
      header: 'Visits Before Today',
      accessorKey: 'visitsBeforeToday',
    },
    {
      header: 'Last Visit Rating',
      accessorKey: 'lastVisitRating',
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
      <div className="container px-4 mx-auto mt-10">
        <h1 className="mb-6 text-3xl font-bold">Check-In Management</h1>
        <p>Loading check-ins...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto mt-10">
      <h1 className="mb-6 text-3xl font-bold">Check-In Management</h1>
      <DataTable
        columns={columns}
        data={checkIns}
        getRowProps={(row) => ({
          className: row.is_in_service
            ? 'line-through' // Styling for in-service rows
            : '', // Styling for not-in-service rows
        })}
      />
    </div>
  );
};

export default CheckInManagementPage;
