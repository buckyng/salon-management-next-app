'use server';

import { createSupabaseClient } from '@/lib/supabase/server';

export async function getOrganizationDetails(orgId: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', orgId)
    .single();

  if (error) {
    console.error('Error fetching organization details:', error);
    throw new Error('Failed to fetch organization details');
  }

  return data;
}
