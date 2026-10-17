-- ==============================================================================
-- MediTrack Database Schema
-- Dual-sided Healthcare Marketplace (Patients & Pharmacy Owners)
-- Includes: profiles, pharmacies, inventory tables, RLS policies, and triggers
-- ==============================================================================

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Patient', 'Pharmacy Owner')),
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Pharmacies Table
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

-- 3. Create Inventory Table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_medicine_name ON public.inventory(LOWER(medicine_name));
CREATE INDEX IF NOT EXISTS idx_inventory_pharmacy_id ON public.inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_owner_id ON public.pharmacies(owner_id);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
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

-- Pharmacies Policies (Patients have read-only, Owners have write on their own)
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

-- Inventory Policies (Patients have read-only, Owners can only modify their own stock)
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
-- Auto-create profile trigger on auth signup
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

-- ==============================================================================
-- Sample Mock Data for Testing
-- (Can be executed in Supabase SQL editor)
-- ==============================================================================

-- Optional Demo Seed function to create sample pharmacies & medicines without needing auth users
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS VOID AS $$
DECLARE
    dummy_owner_id UUID := '00000000-0000-0000-0000-000000000001';
    dummy_owner_id2 UUID := '00000000-0000-0000-0000-000000000002';
    dummy_owner_id3 UUID := '00000000-0000-0000-0000-000000000003';
    pharm_id1 UUID;
    pharm_id2 UUID;
    pharm_id3 UUID;
    pharm_id4 UUID;
BEGIN
    -- Ensure dummy profiles exist
    INSERT INTO public.profiles (id, role, full_name, phone)
    VALUES 
        (dummy_owner_id, 'Pharmacy Owner', 'Apollo Koramangala Store', '+91 9876543210'),
        (dummy_owner_id2, 'Pharmacy Owner', 'MedPlus Indiranagar', '+91 9876543211'),
        (dummy_owner_id3, 'Pharmacy Owner', 'Wellness Forever HSR', '+91 9876543212')
    ON CONFLICT (id) DO NOTHING;

    -- Pharmacies
    INSERT INTO public.pharmacies (name, address, latitude, longitude, owner_id, phone, license_number, opening_hours)
    VALUES ('Apollo Pharmacy - Koramangala', '80 Feet Road, 4th Block, Koramangala, Bengaluru', 12.9345, 77.6265, dummy_owner_id, '+91 80 2553 4321', 'KA-B1-102934', '24 Hours Open')
    RETURNING id INTO pharm_id1;

    INSERT INTO public.pharmacies (name, address, latitude, longitude, owner_id, phone, license_number, opening_hours)
    VALUES ('MedPlus Pharmacy - Indiranagar', '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru', 12.9719, 77.6412, dummy_owner_id2, '+91 80 2521 9876', 'KA-B2-847291', '7:30 AM - 11:00 PM')
    RETURNING id INTO pharm_id2;

    INSERT INTO public.pharmacies (name, address, latitude, longitude, owner_id, phone, license_number, opening_hours)
    VALUES ('Wellness Forever - HSR Layout', '27th Main Rd, Sector 1, HSR Layout, Bengaluru', 12.9116, 77.6534, dummy_owner_id3, '+91 80 2258 7766', 'KA-B3-392817', '24 Hours Open')
    RETURNING id INTO pharm_id3;

    INSERT INTO public.pharmacies (name, address, latitude, longitude, owner_id, phone, license_number, opening_hours)
    VALUES ('GreenCross Medicals - BTM Layout', 'Outer Ring Rd, BTM 2nd Stage, Bengaluru', 12.9166, 77.6101, dummy_owner_id, '+91 80 2668 5544', 'KA-B4-610293', '8:00 AM - 10:30 PM')
    RETURNING id INTO pharm_id4;

    -- Seed Medicines for Pharm 1 (Apollo Koramangala)
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm_id1, 'Dolo 650', 'Paracetamol', '650mg tablet', 150, 32.50, '2027-08-30'),
        (pharm_id1, 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 45, 204.00, '2026-12-15'),
        (pharm_id1, 'Azithral 500', 'Azithromycin', '500mg tablet', 80, 119.50, '2027-03-20'),
        (pharm_id1, 'Pan 40', 'Pantoprazole', '40mg tablet', 120, 155.00, '2027-11-10'),
        (pharm_id1, 'Glycomet 500 SR', 'Metformin Hydrochloride', '500mg tablet', 200, 48.00, '2028-01-15'),
        (pharm_id1, 'Montair LC', 'Montelukast + Levocetirizine', '10mg/5mg tablet', 65, 185.00, '2026-10-30'),
        (pharm_id1, 'Telma 40', 'Telmisartan', '40mg tablet', 90, 138.00, '2027-06-25'),
        (pharm_id1, 'Ascoril LS Syrup', 'Levosalbutamol + Ambroxol + Guaiphenesin', '100ml syrup', 35, 118.00, '2026-09-15');

    -- Seed Medicines for Pharm 2 (MedPlus Indiranagar)
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm_id2, 'Dolo 650', 'Paracetamol', '650mg tablet', 20, 30.00, '2027-05-15'),
        (pharm_id2, 'Calpol 500', 'Paracetamol', '500mg tablet', 100, 22.00, '2027-09-10'),
        (pharm_id2, 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 0, 198.00, '2026-11-20'), -- out of stock demo
        (pharm_id2, 'Azithral 500', 'Azithromycin', '500mg tablet', 30, 122.00, '2027-04-18'),
        (pharm_id2, 'Shelcal 500', 'Calcium + Vitamin D3', '500mg tablet', 110, 132.00, '2028-02-28'),
        (pharm_id2, 'Pan 40', 'Pantoprazole', '40mg tablet', 40, 150.00, '2027-07-12'),
        (pharm_id2, 'Allegra 120', 'Fexofenadine Hydrochloride', '120mg tablet', 75, 215.00, '2027-10-05');

    -- Seed Medicines for Pharm 3 (Wellness Forever HSR)
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm_id3, 'Dolo 650', 'Paracetamol', '650mg tablet', 300, 31.00, '2027-12-01'),
        (pharm_id3, 'Crocin 650', 'Paracetamol', '650mg tablet', 95, 33.00, '2027-08-15'),
        (pharm_id3, 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 55, 202.00, '2026-10-15'),
        (pharm_id3, 'Glycomet 500 SR', 'Metformin Hydrochloride', '500mg tablet', 140, 47.00, '2028-03-10'),
        (pharm_id3, 'Thyronorm 50mcg', 'Levothyroxine Sodium', '50mcg tablet', 180, 162.00, '2028-05-20'),
        (pharm_id3, 'Ecosprin 75', 'Aspirin', '75mg tablet', 250, 15.50, '2028-04-10');

    -- Seed Medicines for Pharm 4 (GreenCross BTM)
    INSERT INTO public.inventory (pharmacy_id, medicine_name, generic_name, dosage, quantity, price, expiry_date)
    VALUES
        (pharm_id4, 'Dolo 650', 'Paracetamol', '650mg tablet', 70, 32.00, '2027-07-20'),
        (pharm_id4, 'Azithral 500', 'Azithromycin', '500mg tablet', 12, 125.00, '2026-12-30'),
        (pharm_id4, 'Pan D', 'Pantoprazole + Domperidone', '40mg/30mg capsule', 85, 195.00, '2027-04-15'),
        (pharm_id4, 'Zifi 200', 'Cefixime', '200mg tablet', 40, 110.00, '2027-01-25');
END;
$$ LANGUAGE plpgsql;

-- Execute demo seed
SELECT public.seed_demo_data();
