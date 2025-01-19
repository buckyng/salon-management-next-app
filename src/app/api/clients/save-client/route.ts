import { createSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for validating request data
const clientSchema = z.object({
  clientData: z.object({
    id: z.string().uuid().optional(), // Optional for new clients
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string(),
    email: z.string().optional(),
  }),
  groupDetails: z.object({
    agree_to_terms: z.boolean(),
  }),
  groupId: z.string().uuid(),
});

export async function POST(req: Request) {
  const supabase = await createSupabaseClient();

  try {
    const body = await req.json();

    // Validate request body
    const parsed = clientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { clientData, groupDetails, groupId } = parsed.data;

    let clientId = clientData.id;

    // If no ID is provided, check if the client already exists by phone
    if (!clientId) {
      const { data: existingClient, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', clientData.phone)
        .single();

      if (clientError && clientError.code !== 'PGRST116') {
        console.error('Error checking existing client:', clientError);
        return NextResponse.json(
          { error: clientError.message },
          { status: 500 }
        );
      }

      clientId = existingClient?.id;
    }

    // If client doesn't exist, insert into the `clients` table
    if (!clientId) {
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          phone: clientData.phone,
          email: clientData.email,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting new client:', insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      clientId = newClient.id;
    } else {
      // Update existing client
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          phone: clientData.phone,
          email: clientData.email,
        })
        .eq('id', clientId);

      if (updateError) {
        console.error('Error updating client:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    // Upsert client-group relationship
    const { error: groupDetailsError } = await supabase
      .from('client_group_details')
      .upsert(
        {
          client_id: clientId,
          group_id: groupId,
          ...groupDetails,
        },
        {
          onConflict: 'client_id,group_id', // Handle conflicts by updating existing record
        }
      );

    if (groupDetailsError) {
      console.error(
        'Error inserting/updating client-group details:',
        groupDetailsError
      );
      return NextResponse.json(
        { error: groupDetailsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientId,
      message: 'Client saved successfully.',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
