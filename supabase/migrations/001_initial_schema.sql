-- ==============================================================================
-- MediTrack Migration: 001_initial_schema.sql
-- Description: Core tables (profiles, pharmacies, inventory), RLS policies, 
-- auth triggers, indexes, and comprehensive seed data for Supabase Cloud PostgreSQL.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Create Profiles Table (extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Patient', 'Pharmacy Owner')),
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. Create Pharmacies Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pharmacies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    phone TEXT,
    license_number TEXT,
    opening_hours TEXT DEFAULT '8:00 AM - 10:00 PM',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. Create Inventory Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_medicine_name ON public.inventory(LOWER(medicine_name));
CREATE INDEX IF NOT EXISTS idx_inventory_pharmacy_id ON public.inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_owner_id ON public.pharmacies(owner_id);

-- ==============================================================================
-- 5. Row Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Pharmacy owners can insert their pharmacy" ON public.pharmacies;
DROP POLICY IF EXISTS "Pharmacy owners can update their pharmacy" ON public.pharmacies;
DROP POLICY IF EXISTS "Pharmacy owners can delete their pharmacy" ON public.pharmacies;

DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Owners can insert to own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Owners can update own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Owners can delete own inventory" ON public.inventory;

-- Profiles Policies
CREATE POLICY "Public can view profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Pharmacies Policies (Public search, Owners manage own store)
CREATE POLICY "Anyone can view pharmacies"
    ON public.pharmacies FOR SELECT
    USING (true);

CREATE POLICY "Pharmacy owners can insert their pharmacy"
    ON public.pharmacies FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Pharmacy owners can update their pharmacy"
    ON public.pharmacies FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Pharmacy owners can delete their pharmacy"
    ON public.pharmacies FOR DELETE
    USING (auth.uid() = owner_id);

-- Inventory Policies (Patients have read-only, Owners modify their own pharmacy's items)
CREATE POLICY "Anyone can view inventory"
    ON public.inventory FOR SELECT
    USING (true);

CREATE POLICY "Owners can insert to own inventory"
    ON public.inventory FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pharmacies
            WHERE public.pharmacies.id = inventory.pharmacy_id
              AND public.pharmacies.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update own inventory"
    ON public.inventory FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.pharmacies
            WHERE public.pharmacies.id = inventory.pharmacy_id
              AND public.pharmacies.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete own inventory"
    ON public.inventory FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.pharmacies
            WHERE public.pharmacies.id = inventory.pharmacy_id
              AND public.pharmacies.owner_id = auth.uid()
        )
    );

-- ==============================================================================
-- 6. Trigger: Auto-sync new users from auth.users to public.profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Patient'),
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_pharmacies_updated_at ON public.pharmacies;
CREATE TRIGGER set_pharmacies_updated_at
    BEFORE UPDATE ON public.pharmacies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_inventory_updated_at ON public.inventory;
CREATE TRIGGER set_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 7. Seed Data Generation (Idempotent)
-- ==============================================================================

DO $$
DECLARE
    owner1_id UUID := 'a1111111-1111-1111-1111-111111111111';
    owner2_id UUID := 'a2222222-2222-2222-2222-222222222222';
    owner3_id UUID := 'a3333333-3333-3333-3333-333333333333';
    patient1_id UUID := 'b1111111-1111-1111-1111-111111111111';

    pharm1_id UUID := 'c1111111-1111-1111-1111-111111111111';
    pharm2_id UUID := 'c2222222-2222-2222-2222-222222222222';
    pharm3_id UUID := 'c3333333-3333-3333-3333-333333333333';
    pharm4_id UUID := 'c4444444-4444-4444-4444-444444444444';
BEGIN
    -- 7a. Seed auth.users if not already present
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES
        (
            owner1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'apollo.owner@meditrack.org', crypt('Password@123', gen_salt('bf')), NOW(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"Apollo Pharmacy Manager","role":"Pharmacy Owner"}', NOW(), NOW()
        ),
        (
            owner2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'medplus.owner@meditrack.org', crypt('Password@123', gen_salt('bf')), NOW(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"MedPlus Store Head","role":"Pharmacy Owner"}', NOW(), NOW()
        ),
        (
            owner3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'wellness.owner@meditrack.org', crypt('Password@123', gen_salt('bf')), NOW(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"Wellness Forever Caretaker","role":"Pharmacy Owner"}', NOW(), NOW()
        ),
        (
            patient1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'patient.rahul@meditrack.org', crypt('Password@123', gen_salt('bf')), NOW(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"Rahul Sharma","role":"Patient"}', NOW(), NOW()
        )
    ON CONFLICT (id) DO NOTHING;

    -- 7b. Seed public.profiles
    INSERT INTO public.profiles (id, role, full_name, phone)
    VALUES
        (owner1_id, 'Pharmacy Owner', 'Apollo Pharmacy Lead Pharmacist', '+91 80 2553 4321'),
        (owner2_id, 'Pharmacy Owner', 'MedPlus Store Head', '+91 80 2521 9876'),
        (owner3_id, 'Pharmacy Owner', 'Wellness Forever Caretaker', '+91 80 2258 7766'),
        (patient1_id, 'Patient', 'Rahul Sharma', '+91 9823456789')
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

    -- 7c. Seed public.pharmacies
    INSERT INTO public.pharmacies (id, name, address, latitude, longitude, owner_id, phone, license_number, opening_hours)
    VALUES
        (
            pharm1_id, 'Apollo Pharmacy - Koramangala', 
            '80 Feet Road, 4th Block, Koramangala, Bengaluru', 
            12.9345, 77.6265, owner1_id, '+91 80 2553 4321', 'KA-B1-102934', '24 Hours Open'
        ),
        (
            pharm2_id, 'MedPlus Pharmacy - Indiranagar', 
            '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru', 
            12.9719, 77.6412, owner2_id, '+91 80 2521 9876', 'KA-B2-847291', '7:30 AM - 11:00 PM'
        ),
        (
            pharm3_id, 'Wellness Forever - HSR Layout', 
            '27th Main Rd, Sector 1, HSR Layout, Bengaluru', 
            12.9116, 77.6534, owner3_id, '+91 80 2258 7766', 'KA-B3-392817', '24 Hours Open'
        ),
        (
            pharm4_id, 'GreenCross Medicals - BTM Layout', 
            'Outer Ring Rd, BTM 2nd Stage, Bengaluru', 
            12.9166, 77.6101, owner1_id, '+91 80 2668 5544', 'KA-B4-610293', '8:00 AM - 10:30 PM'
        )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name, address = EXCLUDED.address;

    -- 7d. Seed public.inventory
    -- Apollo Pharmacy Koramangala
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm1_id, 'Dolo 650', 'Paracetamol', '650mg tablet', 150, 32.50, '2027-08-30'),
        (pharm1_id, 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 45, 204.00, '2026-12-15'),
        (pharm1_id, 'Azithral 500', 'Azithromycin', '500mg tablet', 80, 119.50, '2027-03-20'),
        (pharm1_id, 'Pan 40', 'Pantoprazole', '40mg tablet', 120, 155.00, '2027-11-10'),
        (pharm1_id, 'Glycomet 500 SR', 'Metformin Hydrochloride', '500mg tablet', 200, 48.00, '2028-01-15'),
        (pharm1_id, 'Montair LC', 'Montelukast + Levocetirizine', '10mg/5mg tablet', 65, 185.00, '2026-10-30'),
        (pharm1_id, 'Telma 40', 'Telmisartan', '40mg tablet', 90, 138.00, '2027-06-25'),
        (pharm1_id, 'Ascoril LS Syrup', 'Levosalbutamol + Ambroxol + Guaiphenesin', '100ml syrup', 35, 118.00, '2026-09-15');

    -- MedPlus Indiranagar
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm2_id, 'Dolo 650', 'Paracetamol', '650mg tablet', 20, 30.00, '2027-05-15'),
        (pharm2_id, 'Calpol 500', 'Paracetamol', '500mg tablet', 100, 22.00, '2027-09-10'),
        (pharm2_id, 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 0, 198.00, '2026-11-20'),
        (pharm2_id, 'Azithral 500', 'Azithromycin', '500mg tablet', 30, 122.00, '2027-04-18'),
        (pharm2_id, 'Shelcal 500', 'Calcium + Vitamin D3', '500mg tablet', 110, 132.00, '2028-02-28'),
        (pharm2_id, 'Pan 40', 'Pantoprazole', '40mg tablet', 40, 150.00, '2027-07-12'),
        (pharm2_id, 'Allegra 120', 'Fexofenadine Hydrochloride', '120mg tablet', 75, 215.00, '2027-10-05');

    -- Wellness Forever HSR
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm3_id, 'Dolo 650', 'Paracetamol', '650mg tablet', 300, 31.00, '2027-12-01'),
        (pharm3_id, 'Crocin 650', 'Paracetamol', '650mg tablet', 95, 33.00, '2027-08-15'),
        (pharm3_id, 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 55, 202.00, '2026-10-15'),
        (pharm3_id, 'Glycomet 500 SR', 'Metformin Hydrochloride', '500mg tablet', 140, 47.00, '2028-03-10'),
        (pharm3_id, 'Thyronorm 50mcg', 'Levothyroxine Sodium', '50mcg tablet', 180, 162.00, '2028-05-20'),
        (pharm3_id, 'Ecosprin 75', 'Aspirin', '75mg tablet', 250, 15.50, '2028-04-10');

    -- GreenCross BTM Layout
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm4_id, 'Dolo 650', 'Paracetamol', '650mg tablet', 70, 32.00, '2027-07-20'),
        (pharm4_id, 'Azithral 500', 'Azithromycin', '500mg tablet', 12, 125.00, '2026-12-30'),
        (pharm4_id, 'Pan D', 'Pantoprazole + Domperidone', '40mg/30mg capsule', 85, 195.00, '2027-04-15'),
        (pharm4_id, 'Zifi 200', 'Cefixime', '200mg tablet', 40, 110.00, '2027-01-25');

END $$;
