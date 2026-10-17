import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const getAdminClient = () => {
  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

const getAnonClient = () => {
  if (!supabaseUrl || !anonKey || anonKey.includes('placeholder')) {
    return null;
  }
  return createClient(supabaseUrl, anonKey);
};

// GET: Fetch inventory by pharmacy_id or medicine query
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get('pharmacy_id');
    const query = searchParams.get('query');

    const client = getAdminClient() || getAnonClient();
    if (!client) {
      return NextResponse.json({ error: 'Supabase client not configured' }, { status: 500 });
    }

    let dbQuery = client.from('inventory').select('*, pharmacies(name, address, phone)');

    if (pharmacyId) {
      dbQuery = dbQuery.eq('pharmacy_id', pharmacyId);
    }
    if (query) {
      dbQuery = dbQuery.ilike('medicine_name', `%${query}%`);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, inventory: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch inventory';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Add new inventory item to Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pharmacy_id,
      medicine_name,
      generic_name,
      dosage,
      quantity,
      price,
      expiry_date,
      owner_id,
    } = body;

    if (!medicine_name || quantity === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'medicine_name, quantity, and price are required' },
        { status: 400 }
      );
    }

    const client = getAdminClient();
    if (!client) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    // Verify or find a valid pharmacy_id
    let targetPharmId = pharmacy_id;
    if (!targetPharmId) {
      // Find pharmacy by owner_id if provided
      if (owner_id) {
        const { data: pharm } = await client
          .from('pharmacies')
          .select('id')
          .eq('owner_id', owner_id)
          .limit(1)
          .maybeSingle();
        if (pharm) targetPharmId = pharm.id;
      }
      // If still not found, fallback to first available pharmacy
      if (!targetPharmId) {
        const { data: firstPharm } = await client
          .from('pharmacies')
          .select('id')
          .limit(1)
          .single();
        targetPharmId = firstPharm?.id;
      }
    }

    const payload = {
      pharmacy_id: targetPharmId,
      medicine_name: medicine_name.trim(),
      generic_name: generic_name ? generic_name.trim() : null,
      dosage: dosage ? dosage.trim() : 'Standard dose',
      quantity: Number(quantity),
      price: Number(price),
      expiry_date: expiry_date || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('inventory')
      .insert(payload)
      .select('*, pharmacies(name, address)')
      .single();

    if (error) {
      console.error('Supabase inventory insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add inventory item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update inventory item in Supabase (e.g. quantity adjustment, price change)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, fallbackItem } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'id and updates are required' }, { status: 400 });
    }

    const client = getAdminClient();
    if (!client) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    // Include updated_at timestamp
    const cleanUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // 1. Try updating existing row
    const { data, error } = await client
      .from('inventory')
      .update(cleanUpdates)
      .eq('id', id)
      .select('*, pharmacies(name, address)')
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({ success: true, item: data });
    }

    // 2. If row wasn't found in Supabase (e.g. item originated from client cache/seed),
    // and fallback item data was supplied, perform an UPSERT!
    if (fallbackItem) {
      // Ensure target pharmacy exists
      let targetPharmId = fallbackItem.pharmacy_id;
      const { data: pCheck } = await client
        .from('pharmacies')
        .select('id')
        .eq('id', targetPharmId)
        .maybeSingle();

      if (!pCheck) {
        // Fallback to first pharmacy in Supabase
        const { data: firstP } = await client.from('pharmacies').select('id').limit(1).single();
        if (firstP) targetPharmId = firstP.id;
      }

      const upsertPayload = {
        id,
        pharmacy_id: targetPharmId,
        medicine_name: fallbackItem.medicine_name,
        generic_name: fallbackItem.generic_name || null,
        dosage: fallbackItem.dosage || 'Standard dose',
        quantity: cleanUpdates.quantity !== undefined ? Number(cleanUpdates.quantity) : Number(fallbackItem.quantity),
        price: cleanUpdates.price !== undefined ? Number(cleanUpdates.price) : Number(fallbackItem.price),
        expiry_date: fallbackItem.expiry_date || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      };

      const { data: upsertData, error: upsertErr } = await client
        .from('inventory')
        .upsert(upsertPayload)
        .select('*, pharmacies(name, address)')
        .single();

      if (!upsertErr && upsertData) {
        return NextResponse.json({ success: true, item: upsertData });
      }

      if (upsertErr) {
        console.error('Supabase inventory upsert error:', upsertErr);
        return NextResponse.json({ error: upsertErr.message }, { status: 400 });
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Item not found in inventory' }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update inventory';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove item from Supabase
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    const client = getAdminClient();
    if (!client) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    const { error } = await client.from('inventory').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Item ${id} deleted` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete inventory item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
