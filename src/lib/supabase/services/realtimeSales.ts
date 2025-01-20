import { createSupabaseClient } from '@/lib/supabase/client';
import { EnrichedSales, SaleData } from '@/lib/types';
import { fetchUserName } from '../helpers/user';

const subscribeToSales = (
  groupId: string,
  callback: (enrichedSale: EnrichedSales) => void
) => {
  const supabase = createSupabaseClient();

  // Real-time subscription to sales table
  const channel = supabase
    .channel('realtime:sales')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sales',
        filter: `group_id=eq.${groupId}`,
      },
      async (payload) => {
        const newSale: SaleData = payload.new as SaleData;

        // Enrich sale with user name
        const userName = await fetchUserName(newSale.user_id);
        const enrichedSale: EnrichedSales = { ...newSale, userName };

        // Invoke the callback with the enriched sale
        callback(enrichedSale);
      }
    )
    .subscribe();

  // Return an unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

export default subscribeToSales;
