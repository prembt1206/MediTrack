import { supabase, isSupabaseConfigured } from './client';
import { Pharmacy, InventoryItem, Profile, SearchResultItem } from '@/types/database';
import { INITIAL_PHARMACIES, INITIAL_INVENTORY, INITIAL_PROFILES } from './mock-data';
import { calculateDistanceKm } from '../utils';

// Local storage keys for fallback demo mode
const STORAGE_KEYS = {
  PROFILES: 'meditrack_profiles_v1',
  PHARMACIES: 'meditrack_pharmacies_v1',
  INVENTORY: 'meditrack_inventory_v1',
  AUTH_USER: 'meditrack_auth_user_v1',
};

function getLocalData<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as Profile;
    }

    // Local fallback
    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.find((p) => p.id === userId) || null;
  },

  async saveProfile(profile: Profile): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Profile;
    }

    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...profile, updated_at: new Date().toISOString() };
    } else {
      profiles.push({ ...profile, created_at: new Date().toISOString() });
    }
    setLocalData(STORAGE_KEYS.PROFILES, profiles);
    return profile;
  },

  // -------------------------------------------------------------
  // Pharmacies
  // -------------------------------------------------------------
  async getAllPharmacies(): Promise<Pharmacy[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('name');
      if (!error && data) return data as Pharmacy[];
    }
    return getLocalData<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
  },

  async getPharmacyByOwner(ownerId: string): Promise<Pharmacy | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (!error && data) return data as Pharmacy;
    }
    const pharmacies = getLocalData<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
    return pharmacies.find((p) => p.owner_id === ownerId) || null;
  },

  async createOrUpdatePharmacy(pharmacy: Partial<Pharmacy> & { owner_id: string; name: string }): Promise<Pharmacy> {
    if (isSupabaseConfigured && supabase) {
      if (pharmacy.id) {
        const { data, error } = await supabase
          .from('pharmacies')
          .update(pharmacy)
          .eq('id', pharmacy.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as Pharmacy;
      } else {
        const { data, error } = await supabase
          .from('pharmacies')
          .insert(pharmacy)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as Pharmacy;
      }
    }

    const pharmacies = getLocalData<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
    if (pharmacy.id) {
      const idx = pharmacies.findIndex((p) => p.id === pharmacy.id);
      if (idx >= 0) {
        pharmacies[idx] = { ...pharmacies[idx], ...pharmacy } as Pharmacy;
        setLocalData(STORAGE_KEYS.PHARMACIES, pharmacies);
        return pharmacies[idx];
      }
    }

    const newPharm: Pharmacy = {
      id: 'pharm-' + Math.random().toString(36).substring(2, 9),
      name: pharmacy.name,
      address: pharmacy.address || 'Koramangala, Bengaluru',
      latitude: pharmacy.latitude ?? 12.9345,
      longitude: pharmacy.longitude ?? 77.6265,
      owner_id: pharmacy.owner_id,
      phone: pharmacy.phone || '+91 9876543210',
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as InventoryItem[];
    }
    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    return inventory.filter((item) => item.pharmacy_id === pharmacyId);
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inventory')
        .insert(item)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as InventoryItem;
    }

    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const newItem: InventoryItem = {
      ...item,
      id: 'inv-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inventory.unshift(newItem);
    setLocalData(STORAGE_KEYS.INVENTORY, inventory);
    return newItem;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as InventoryItem;
    }

    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const idx = inventory.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    inventory[idx] = { ...inventory[idx], ...updates, updated_at: new Date().toISOString() };
    setLocalData(STORAGE_KEYS.INVENTORY, inventory);
    return inventory[idx];
  },

  async deleteInventoryItem(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const filtered = inventory.filter((i) => i.id !== id);
    setLocalData(STORAGE_KEYS.INVENTORY, filtered);
  },

  // -------------------------------------------------------------
  // Search (Demand Side - Patient Portal)
  // -------------------------------------------------------------
  async searchMedicines(
    query: string,
    userLat: number = 12.9352, // Default user in central Bengaluru
    userLon: number = 77.6245
  ): Promise<SearchResultItem[]> {
    let items: InventoryItem[] = [];
    let pharmacies: Pharmacy[] = [];

    if (isSupabaseConfigured && supabase) {
      // Search with case-insensitive partial match
      const { data: invData } = await supabase
        .from('inventory')
        .select('*')
        .or(`medicine_name.ilike.%${query}%,generic_name.ilike.%${query}%`);
      
      const { data: pharmData } = await supabase.from('pharmacies').select('*');
      items = (invData as InventoryItem[]) || [];
      pharmacies = (pharmData as Pharmacy[]) || [];
    }

    if (items.length === 0 && (!isSupabaseConfigured || !supabase)) {
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
        pharmacy_phone: pharm?.phone || '+91 9876543210',
        pharmacy_latitude: pharmLat,
        pharmacy_longitude: pharmLon,
        distance_km: distance,
        in_stock: item.quantity > 0,
      };
    });

    // Sort by: In Stock first, then closest distance, then price
    return results.sort((a, b) => {
      if (a.in_stock && !b.in_stock) return -1;
      if (!a.in_stock && b.in_stock) return 1;
      return a.distance_km - b.distance_km || a.price - b.price;
    });
  },

  // Direct fetch of all inventory for Chatbot grounding
  async getAllInventoryForChat(): Promise<Array<{ medicine_name: string; generic_name: string | null; pharmacy_name: string; quantity: number; price: number; address: string }>> {
    const pharmacies = await this.getAllPharmacies();
    const pharmMap = new Map<string, Pharmacy>();
    pharmacies.forEach((p) => pharmMap.set(p.id, p));

    let inventory: InventoryItem[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('inventory').select('*');
      inventory = (data as InventoryItem[]) || [];
    }
    if (inventory.length === 0) {
      inventory = getLocalData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    }

    return inventory.map((inv) => {
      const pharm = pharmMap.get(inv.pharmacy_id);
      return {
        medicine_name: inv.medicine_name,
        generic_name: inv.generic_name,
        pharmacy_name: pharm?.name || 'Local Pharmacy',
        quantity: inv.quantity,
        price: Number(inv.price),
        address: pharm?.address || 'Bengaluru',
      };
    });
  },
};
