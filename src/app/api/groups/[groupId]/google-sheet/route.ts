import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = await createSupabaseClient();

  console.log('Fetching Google Sheet ID for group:', params.groupId);
  const { data, error } = await supabase
    .from('groups')
    .select('google_sheet_id')
    .eq('id', params.groupId)
    .single();

  console.log('Supabase raw response:', data, 'Error:', error);

  if (error) {
    console.error('Error fetching Google Sheet ID:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { googleSheetId: null } //
    );
  }

  return NextResponse.json({ googleSheetId: data.google_sheet_id || null });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const { googleSheetId } = await req.json();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from('groups')
    .update({ google_sheet_id: googleSheetId })
    .eq('id', params.groupId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    message: 'Google Sheet ID updated successfully!',
  });
}
