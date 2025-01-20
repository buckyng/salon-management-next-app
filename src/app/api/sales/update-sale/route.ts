import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const body = await req.json();
    const { saleId, updates } = body;

    if (!saleId || !updates) {
      return NextResponse.json(
        { error: 'Missing required body parameters' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('sales')
      .update(updates)
      .eq('id', saleId);

    if (error) {
      console.error(`Error updating sale ${saleId}:`, error);
      return NextResponse.json(
        { error: 'Failed to update sale.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
