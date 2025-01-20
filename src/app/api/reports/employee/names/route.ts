import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClient();

  try {
    const body = await req.json();
    const { employeeIds } = body;

    if (
      !employeeIds ||
      !Array.isArray(employeeIds) ||
      employeeIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'Invalid or missing employee IDs' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', employeeIds);

    if (error) {
      console.error('Error fetching employee names:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employee names' },
        { status: 500 }
      );
    }

    const result = data?.reduce<Record<string, string>>((acc, employee) => {
      acc[employee.id] =
        `${employee.first_name || ''} ${employee.last_name || ''}`.trim() ||
        'Unknown';
      return acc;
    }, {});

    return NextResponse.json(result || {});
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
