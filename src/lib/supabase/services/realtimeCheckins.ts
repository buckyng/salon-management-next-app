import { createSupabaseClient } from '@/lib/supabase/client';

interface CheckIn {
  id: string;
  client_id: string;
  group_id: string;
  is_in_service: boolean;
  created_at: string;
  updated_at: string | null;
}

interface EnrichedCheckIn extends CheckIn {
  clientName: string;
  visitsBeforeToday: number;
  lastVisitRating: number | null;
}

const subscribeToCheckIns = (
  groupId: string,
  callback: (enrichedCheckIn: EnrichedCheckIn) => void
) => {
  const supabase = createSupabaseClient();

  const channel = supabase
    .channel('realtime:check_ins')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'check_ins',
        filter: `group_id=eq.${groupId}`,
      },
      async (payload) => {
        const newCheckIn = payload.new as CheckIn;

        const { data: clientData, error } = await supabase
          .from('clients')
          .select(
            'first_name, last_name, client_group_details(number_of_visits, last_visit_rating)'
          )
          .eq('id', newCheckIn.client_id)
          .single();

        if (error) {
          console.error('Error fetching client data for subscription:', error);
          return;
        }

        const enrichedCheckIn: EnrichedCheckIn = {
          ...newCheckIn,
          clientName: `${clientData.first_name || 'Unknown'} ${
            clientData.last_name || 'Client'
          }`.trim(),
          visitsBeforeToday:
            clientData.client_group_details?.[0]?.number_of_visits || 0,
          lastVisitRating:
            clientData.client_group_details?.[0]?.last_visit_rating || null,
        };

        callback(enrichedCheckIn);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export default subscribeToCheckIns;
