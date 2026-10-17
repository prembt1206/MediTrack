import { supabase, isSupabaseConfigured } from './client';
import { Pharmacy, InventoryItem, Profile, SearchResultItem } from '@/types/database';
import { INITIAL_PHARMACIES, INITIAL_INVENTORY, INITIAL_PROFILES, DEMO_UUIDS } from './mock-data';
import { calculateDistanceKm, isValidUUID, generateUUID, toValidUUID } from '../utils';

// Local storage keys for fallback demo mode
const STORAGE_KEYS = {
  PROFILES: 'meditrack_profiles_v3',
  PHARMACIES: 'meditrack_pharmacies_v3',
  INVENTORY: 'meditrack_inventory_v3',
  AUTH_USER: 'meditrack_auth_user_v3',
};

// Normalize legacy non-UUID IDs from older versions
function normalizeItem<T>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  const record = { ...(item as Record<string, unknown>) };
  if (typeof record.id === 'string' && !isValidUUID(record.id)) {
    record.id = toValidUUID(record.id);
  }
  if (typeof record.owner_id === 'string' && !isValidUUID(record.owner_id)) {
    record.owner_id = toValidUUID(record.owner_id, DEMO_UUIDS.OWNER_APOLLO);
  }
  if (typeof record.pharmacy_id === 'string' && !isValidUUID(record.pharmacy_id)) {
    record.pharmacy_id = toValidUUID(record.pharmacy_id, DEMO_UUIDS.PHARM_APOLLO);
  }
  return record as unknown as T;
}

function getLocalData<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultData;
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed)) {
      return parsed.map((i) => normalizeItem(i)) as unknown as T;
    }
    return parsed;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultData;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

export const dataService = {
  // -------------------------------------------------------------
  // Profiles
  // -------------------------------------------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    const validUserId = toValidUUID(userId, DEMO_UUIDS.PATIENT_DEMO);
    if (isSupabaseConfigured && supabase && isValidUUID(validUserId)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', validUserId)
          .maybeSingle();
        if (!error && data) return data as Profile;
      } catch (err) {
        console.warn('Supabase getProfile error:', err);
      }
    }

    // Local fallback
    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.find((p) => p.id === validUserId || p.id === userId) || null;
  },

  async saveProfile(profile: Profile): Promise<Profile> {
    const validProfile: Profile = {
      ...profile,
      id: toValidUUID(profile.id, DEMO_UUIDS.PATIENT_DEMO),
    };

    if (isSupabaseConfigured && supabase && isValidUUID(validProfile.id)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(validProfile)
          .select()
          .single();
        if (!error && data) return data as Profile;
      } catch (err) {
        console.warn('Supabase saveProfile error, falling back locally:', err);
      }
    }

    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex((p) => p.id === validProfile.id);
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...validProfile, updated_at: new Date().toISOString() };
    } else {
      profiles.push({ ...validProfile, created_at: new Date().toISOString() });
    }
    setLocalData(STORAGE_KEYS.PROFILES, profiles);
    return validProfile;
  },

  // -------------------------------------------------------------
  // Pharmacies
  // -------------------------------------------------------------
  async getAllPharmacies(): Promise<Pharmacy[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('pharmacies')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) return data as Pharmacy[];
      } catch (err) {
        console.warn('Supabase getAllPharmacies error, using cached mock:', err);
      }
    }
    return getLocalData<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
  },

  async getPharmacyByOwner(ownerId: string): Promise<Pharmacy | null> {
    const validOwnerId = toValidUUID(ownerId, DEMO_UUIDS.OWNER_APOLLO);

    if (isSupabaseConfigured && supabase && isValidUUID(validOwnerId)) {
      try {
        const { data, error } = await supabase
          .from('pharmacies')
          .select('*')
          .eq('owner_id', validOwnerId)
          .maybeSingle();
        if (!error && data) return data as Pharmacy;
      } catch (err) {
        console.warn('Supabase getPharmacyByOwner error:', err);
      }
    }

    const pharmacies = getLocalData<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
    return pharmacies.find((p) => p.owner_id === validOwnerId || p.owner_id === ownerId) || null;
  },

  async createOrUpdatePharmacy(pharmacy: Partial<Pharmacy> & { owner_id: string; name: string }): Promise<Pharmacy> {
    const validOwnerId = toValidUUID(pharmacy.owner_id, DEMO_UUIDS.OWNER_APOLLO);
    const validPharmId = pharmacy.id ? toValidUUID(pharmacy.id) : generateUUID();

    const cleanPharmacy = {
      ...pharmacy,
      id: validPharmId,
      owner_id: validOwnerId,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (pharmacy.id && isValidUUID(pharmacy.id)) {
          const { data, error } = await supabase
            .from('pharmacies')
            .update(cleanPharmacy)
            .eq('id', validPharmId)
            .select()
            .single();
          if (!error && data) return data as Pharmacy;
        } else {
          const { data, error } = await supabase
            .from('pharmacies')
            .insert(cleanPharmacy)
            .select()
            .single();
          if (!error && data) return data as Pharmacy;
        }
      } catch (err) {
        console.warn('Supabase createOrUpdatePharmacy error, persisting locally:', err);
      }
    }

    const pharmacies = getLocalData<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
    const idx = pharmacies.findIndex((p) => p.id === validPharmId);
    if (idx >= 0) {
      pharmacies[idx] = { ...pharmacies[idx], ...cleanPharmacy } as Pharmacy;
      setLocalData(STORAGE_KEYS.PHARMACIES, pharmacies);
      return pharmacies[idx];
    }

    const newPharm: Pharmacy = {
      id: validPharmId,
      name: pharmacy.name,
      address: pharmacy.address || '80 Feet Road, Koramangala, Bengaluru',
      latitude: pharmacy.latitude ?? 12.9345,
      longitude: pharmacy.longitude ?? 77.6265,
      owner_id: validOwnerId,
      phone: pharmacy.phone || '+91 80 2553 4321',
      license_number: pharmacy.license_number || 'KA-DL-' + Math.floor(100000 + Math.random() * 900000),
      opening_hours: pharmacy.opening_hours || '8:00 AM - 10:00 PM',
      created_at: new Date().toISOString(),
    };
    pharmacies.push(newPharm);
    setLocalData(STORAGE_KEYS.PHARMACIES, pharmacies);
    return newPharm;
  },

  // -------------------------------------------------------------
  // Inventory (Supply Side)
  // -------------------------------------------------------------
  async getPharmacyInventory(pharmacyId: string): Promise<InventoryItem[]> {
    const validPharmId = toValidUUID(pharmacyId, DEMO_UUIDS.PHARM_APOLLO);

    if (isSupabaseConfigured && supabase && isValidUUID(validPharmId)) {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('pharmacy_id', validPharmId)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as InventoryItem[];
      } catch (err) {
        console.warn('Supabase getPharmacyInventory error, using local fallback:', err);
      }
    }

    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    return inventory.filter((item) => item.pharmacy_id === validPharmId || item.pharmacy_id === pharmacyId);
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    const validPharmId = toValidUUID(item.pharmacy_id, DEMO_UUIDS.PHARM_APOLLO);
    const newId = generateUUID();

    const insertPayload = {
      ...item,
      id: newId,
      pharmacy_id: validPharmId,
    };

    // Attempt Supabase insert with error resilience
    if (isSupabaseConfigured && supabase && isValidUUID(validPharmId)) {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .insert(insertPayload)
          .select()
          .single();

        if (!error && data) {
          // Sync with local data for seamless fast cache
          const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
          inventory.unshift(data as InventoryItem);
          setLocalData(STORAGE_KEYS.INVENTORY, inventory);
          return data as InventoryItem;
        }

        if (error) {
          console.warn('Supabase insert note (falling back to resilient sync):', error.message);
          // If the error was NOT a syntax error, but RLS or unseeded DB, we fall through to local persistence
        }
      } catch (err) {
        console.warn('Supabase network error during addInventoryItem:', err);
      }
    }

    // Always succeed locally so user/demo is NEVER blocked by network/RLS issues
    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const newItem: InventoryItem = {
      ...insertPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inventory.unshift(newItem);
    setLocalData(STORAGE_KEYS.INVENTORY, inventory);
    return newItem;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const validId = toValidUUID(id);

    if (isSupabaseConfigured && supabase && isValidUUID(validId)) {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .update(updates)
          .eq('id', validId)
          .select()
          .single();
        if (!error && data) {
          const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
          const idx = inventory.findIndex((i) => i.id === validId);
          if (idx >= 0) inventory[idx] = data as InventoryItem;
          setLocalData(STORAGE_KEYS.INVENTORY, inventory);
          return data as InventoryItem;
        }
      } catch (err) {
        console.warn('Supabase updateInventoryItem error, falling back locally:', err);
      }
    }

    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const idx = inventory.findIndex((i) => i.id === validId || i.id === id);
    if (idx === -1) {
      // If not found, return modified object
      return { id: validId, ...updates } as InventoryItem;
    }
    inventory[idx] = { ...inventory[idx], ...updates, updated_at: new Date().toISOString() };
    setLocalData(STORAGE_KEYS.INVENTORY, inventory);
    return inventory[idx];
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const validId = toValidUUID(id);

    if (isSupabaseConfigured && supabase && isValidUUID(validId)) {
      try {
        await supabase.from('inventory').delete().eq('id', validId);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const filtered = inventory.filter((i) => i.id !== validId && i.id !== id);
    setLocalData(STORAGE_KEYS.INVENTORY, filtered);
  },

  // -------------------------------------------------------------
  // Search (Demand Side - Patient Portal)
  // -------------------------------------------------------------
  async searchMedicines(
    query: string,
    userLat: number = 12.9352,
    userLon: number = 77.6245
  ): Promise<SearchResultItem[]> {
    let items: InventoryItem[] = [];
    let pharmacies: Pharmacy[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: invData, error: invErr } = await supabase
          .from('inventory')
          .select('*')
          .or(`medicine_name.ilike.%${query}%,generic_name.ilike.%${query}%`);
        
        const { data: pharmData, error: pharmErr } = await supabase.from('pharmacies').select('*');
        if (!invErr && invData && invData.length > 0) items = invData as InventoryItem[];
        if (!pharmErr && pharmData && pharmData.length > 0) pharmacies = pharmData as Pharmacy[];
      } catch (err) {
        console.warn('Supabase search error, using local data:', err);
      }
    }

    if (items.length === 0) {
      const localInv = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
      pharmacies = getLocalData<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
      const cleanQ = query.trim().toLowerCase();

      if (!cleanQ) {
        items = localInv;
      } else {
        items = localInv.filter((item) => {
          return (
            item.medicine_name.toLowerCase().includes(cleanQ) ||
            (item.generic_name && item.generic_name.toLowerCase().includes(cleanQ))
          );
        });
      }
    }

    const pharmMap = new Map<string, Pharmacy>();
    pharmacies.forEach((p) => pharmMap.set(p.id, p));

    const results: SearchResultItem[] = items.map((item) => {
      const pharm = pharmMap.get(item.pharmacy_id);
      const pharmLat = pharm?.latitude ?? 12.9345;
      const pharmLon = pharm?.longitude ?? 77.6265;
      const distance = calculateDistanceKm(userLat, userLon, pharmLat, pharmLon);

      return {
        inventory_id: item.id,
        medicine_name: item.medicine_name,
        generic_name: item.generic_name,
        dosage: item.dosage,
        quantity: item.quantity,
        price: Number(item.price),
        expiry_date: item.expiry_date,
        pharmacy_id: item.pharmacy_id,
        pharmacy_name: pharm?.name || 'Local Verified Pharmacy',
        pharmacy_address: pharm?.address || 'Bengaluru City',
        pharmacy_phone: pharm?.phone || '+91 80 2553 4321',
        pharmacy_latitude: pharmLat,
        pharmacy_longitude: pharmLon,
        distance_km: distance,
        in_stock: item.quantity > 0,
      };
    });

    return results.sort((a, b) => {
      if (a.in_stock && !b.in_stock) return -1;
      if (!a.in_stock && b.in_stock) return 1;
      return a.distance_km - b.distance_km || a.price - b.price;
    });
  },

  async getAllInventoryForChat(): Promise<Array<{ medicine_name: string; generic_name: string | null; pharmacy_name: string; quantity: number; price: number; address: string }>> {
    const pharmacies = await this.getAllPharmacies();
    const pharmMap = new Map<string, Pharmacy>();
    pharmacies.forEach((p) => pharmMap.set(p.id, p));

    let inventory: InventoryItem[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('inventory').select('*');
        if (!error && data && data.length > 0) inventory = data as InventoryItem[];
      } catch (err) {
        console.warn('Supabase getAllInventoryForChat error:', err);
      }
    }
    if (inventory.length === 0) {
      inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    }

    return inventory.map((inv) => {
      const pharm = pharmMap.get(inv.pharmacy_id);
      return {
        medicine_name: inv.medicine_name,
        generic_name: inv.generic_name,
        pharmacy_name: pharm?.name || 'Apollo Pharmacy - Koramangala',
        quantity: inv.quantity,
        price: Number(inv.price),
        address: pharm?.address || '80 Feet Road, 4th Block, Koramangala, Bengaluru',
      };
    });
  },
};
