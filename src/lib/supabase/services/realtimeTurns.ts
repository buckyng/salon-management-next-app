// src/lib/supabase/services/realtimeTurns.ts

import { createSupabaseClient } from '@/lib/supabase/client';

export interface Turn {
  id: string;
  user_id: string;
  group_id: string;
  created_at: string;
  completed: boolean;
}

/**
 * Subscribe to “completed” updates for a specific employee's turns.
 *
 * @param groupId    the current org/group
 * @param userId     the employee’s user_id
 * @param callback   invoked with the Turn row when completed=true
 * @returns unsubscribe function
 */
const subscribeToTurnCompletions = (
  groupId: string,
  userId: string,
  callback: (turn: Turn) => void
) => {
  const supabase = createSupabaseClient();

  const channel = supabase
    .channel(`realtime:turns:${groupId}:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'employee_turns',
        filter: `group_id=eq.${groupId},user_id=eq.${userId},completed=eq.true`,
      },
      (payload) => {
        console.log('🔔 realtime update payload:', payload);
        callback(payload.new as Turn);
      }
    )
    .subscribe();

  // return a cleanup function
  return () => {
    console.log('🛑 unsubscribing from turns_complete channel');
    supabase.removeChannel(channel);
  };
};

export default subscribeToTurnCompletions;
