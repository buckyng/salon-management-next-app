import { createSupabaseClient } from '@/lib/supabase/server';

export async function listEmployeesByGroup(groupId: string) {
  const supabase = await createSupabaseClient();
  return supabase
    .from('group_users')
    .select('profile:profiles(id, name)')
    .eq('group_id', groupId);
}

export async function listSchedulesByGroup(groupId: string) {
  const supabase = await createSupabaseClient();
  return supabase
    .from('employee_schedules')
    .select('user_id, weekday')
    .eq('group_id', groupId);
}

export async function upsertWeekday(
  groupId: string,
  userId: string,
  day: string
) {
  const supabase = await createSupabaseClient();
  return supabase
    .from('employee_schedules')
    .upsert(
      { group_id: groupId, user_id: userId, weekday: day },
      { onConflict: 'group_id,user_id,weekday' }
    );
}

export async function deleteWeekday(
  groupId: string,
  userId: string,
  day: string
) {
  const supabase = await createSupabaseClient();
  return supabase
    .from('employee_schedules')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('weekday', day);
}
