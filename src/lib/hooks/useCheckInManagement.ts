import { useEffect, useState } from 'react';
import { useGroup } from '@/context/GroupContext';
import { EnrichedCheckIn } from '@/lib/types';
import { fetchCheckInsToday, fetchClientById } from '@/services/clientService';
import subscribeToCheckIns from '@/lib/supabase/services/realtimeCheckins';

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

export const useCheckInManagement = () => {
  const { activeGroup } = useGroup();
  const [checkIns, setCheckIns] = useState<EnrichedCheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  const sortCheckIns = (checkInsList: EnrichedCheckIn[]) => {
    return checkInsList.sort((a, b) => {
      if (a.is_in_service === b.is_in_service) {
        return (
          new Date(b.created_at ?? '1970-01-01').getTime() -
          new Date(a.created_at ?? '1970-01-01').getTime()
        );
      }
      return a.is_in_service ? 1 : -1;
    });
  };

  const handleToggleService = async (
    id: string | undefined,
    is_in_service: boolean
  ) => {
    if (!activeGroup?.id || !id) return;

    try {
      await updateCheckInServiceStatus(activeGroup.id, id, is_in_service);
      setCheckIns((prevCheckIns) =>
        sortCheckIns(
          prevCheckIns.map((checkIn) =>
            checkIn.id === id ? { ...checkIn, is_in_service } : checkIn
          )
        )
      );
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

        setCheckIns(sortCheckIns(enrichedCheckIns));
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
            created_date: newCheckIn.created_at,
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

          setCheckIns((prevCheckIns) =>
            sortCheckIns([...prevCheckIns, enrichedCheckIn])
          );
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

  return { checkIns, loading, handleToggleService };
};
