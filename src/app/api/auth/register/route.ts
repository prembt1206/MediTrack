import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase Admin client with service role key for full privileges
const getAdminClient = () => {
  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      role = 'Patient',
      fullName,
      phone,
      pharmacyName,
      pharmacyAddress,
      pharmacyPhone,
      pharmacyLicense,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminClient = getAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        { error: 'Supabase service role key is not configured.' },
        { status: 500 }
      );
    }

    let userId: string | null = null;

    // 1. Check if user already exists in auth.users using recovery link probe
    const linkRes = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
    });

    if (linkRes.data?.user?.id) {
      userId = linkRes.data.user.id;
      // Existing user (e.g. registered via OTP before or unconfirmed):
      // Update password, auto-confirm email, and update metadata so they can log in via password immediately!
      const updateRes = await adminClient.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || normalizedEmail.split('@')[0],
          role,
          phone: phone || null,
        },
      });

      if (updateRes.error) {
        console.error('Failed to update existing user in Supabase:', updateRes.error);
        return NextResponse.json({ error: updateRes.error.message }, { status: 400 });
      }
    } else {
      // 2. New user: create with email_confirm: true so no rate-limiting or email confirmation locks them out
      const createRes = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || normalizedEmail.split('@')[0],
          role,
          phone: phone || null,
        },
      });

      if (createRes.error) {
        console.error('Failed to create user in Supabase Auth:', createRes.error);
        return NextResponse.json({ error: createRes.error.message }, { status: 400 });
      }

      userId = createRes.data.user.id;
    }

    // 3. Upsert profile record into public.profiles
    const profileData = {
      id: userId,
      role,
      full_name: fullName || normalizedEmail.split('@')[0],
      phone: phone || null,
      updated_at: new Date().toISOString(),
    };

    const { error: profError } = await adminClient
      .from('profiles')
      .upsert(profileData);

    if (profError) {
      console.warn('Supabase profiles upsert notice:', profError);
    }

    // 4. If role is Pharmacy Owner, create or update public.pharmacies
    let createdPharmacy = null;
    if (role === 'Pharmacy Owner') {
      const storeName = pharmacyName || fullName || `${normalizedEmail.split('@')[0]}'s Pharmacy`;
      const storeAddress = pharmacyAddress || '80 Feet Road, 4th Block, Koramangala, Bengaluru';
      const storePhone = pharmacyPhone || phone || '+91 80 2553 4321';
      const storeLicense = pharmacyLicense || 'KA-BLR-' + Math.floor(100000 + Math.random() * 900000);

      // Check if this owner already has a pharmacy record
      const { data: existingPharm } = await adminClient
        .from('pharmacies')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (existingPharm) {
        const { data: updatedPharm } = await adminClient
          .from('pharmacies')
          .update({
            name: storeName,
            address: storeAddress,
            phone: storePhone,
            license_number: storeLicense,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPharm.id)
          .select()
          .single();
        createdPharmacy = updatedPharm || existingPharm;
      } else {
        const pharmId = crypto.randomUUID();
        const { data: newPharm, error: pharmErr } = await adminClient
          .from('pharmacies')
          .insert({
            id: pharmId,
            owner_id: userId,
            name: storeName,
            address: storeAddress,
            latitude: 12.9345,
            longitude: 77.6265,
            phone: storePhone,
            license_number: storeLicense,
            opening_hours: '24 Hours Open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (pharmErr) {
          console.error('Error creating pharmacy in Supabase:', pharmErr);
        } else {
          createdPharmacy = newPharm;

          // Seed default essential medicines in public.inventory for the new pharmacy
          const starterMeds = [
            {
              pharmacy_id: pharmId,
              medicine_name: 'Paracetamol 650mg',
              generic_name: 'Acetaminophen / Paracetamol',
              dosage: '650mg tablet',
              quantity: 150,
              price: 32.50,
              expiry_date: '2026-12-31',
            },
            {
              pharmacy_id: pharmId,
              medicine_name: 'Amoxicillin 500mg',
              generic_name: 'Amoxicillin Trihydrate',
              dosage: '500mg capsule',
              quantity: 80,
              price: 110.00,
              expiry_date: '2026-11-20',
            },
            {
              pharmacy_id: pharmId,
              medicine_name: 'Cetirizine 10mg',
              generic_name: 'Cetirizine Hydrochloride',
              dosage: '10mg tablet',
              quantity: 120,
              price: 24.00,
              expiry_date: '2027-01-15',
            },
            {
              pharmacy_id: pharmId,
              medicine_name: 'Azithromycin 500mg',
              generic_name: 'Azithromycin Dihydrate',
              dosage: '500mg tablet',
              quantity: 45,
              price: 145.00,
              expiry_date: '2026-09-30',
            },
          ];

          await adminClient.from('inventory').insert(starterMeds);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account registered and synchronized with Supabase Cloud successfully.',
      user: {
        id: userId,
        email: normalizedEmail,
        role,
        fullName: fullName || normalizedEmail.split('@')[0],
      },
      pharmacy: createdPharmacy,
    });
  } catch (error: unknown) {
    console.error('Registration route unexpected failure:', error);
    const msg = error instanceof Error ? error.message : 'Registration failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
