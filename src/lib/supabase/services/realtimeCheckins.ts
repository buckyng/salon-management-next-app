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
  clientPhone: string;
}

const subscribeToCheckIns = (
  groupId: string,
  callback: (enrichedCheckIn: EnrichedCheckIn) => void
) => {
  const supabase = createSupabaseClient();

  // Function to fetch client data for enrichment
  const fetchClientData = async (
    clientId: string
  ): Promise<{ first_name: string; last_name: string; phone: string }> => {
    const { data: client, error } = await supabase
      .from('clients')
      .select('first_name, last_name, phone')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Error fetching client data:', error);
      return { first_name: 'Unknown', last_name: 'Client', phone: '' };
    }

    return client;
  };

  // Set up the real-time channel
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
        const newCheckIn: CheckIn = payload.new as CheckIn;

        // Enrich the check-in data
        const clientData = await fetchClientData(newCheckIn.client_id);
        const enrichedCheckIn: EnrichedCheckIn = {
          ...newCheckIn,
          clientName: `${clientData.first_name} ${clientData.last_name}`.trim(),
          clientPhone: clientData.phone,
        };

        // Invoke the callback with enriched data
        callback(enrichedCheckIn);
      }
    )
    .subscribe();

  // Return an unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

export default subscribeToCheckIns;
