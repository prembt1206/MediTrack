export type UserRole = 'Patient' | 'Pharmacy Owner';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  owner_id: string;
  phone: string | null;
  license_number: string | null;
  opening_hours?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: string;
  pharmacy_id: string;
  medicine_name: string;
  generic_name: string | null;
  dosage: string | null;
  quantity: number;
  price: number;
  expiry_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface SearchResultItem {
  inventory_id: string;
  medicine_name: string;
  generic_name: string | null;
  dosage: string | null;
  quantity: number;
  price: number;
  expiry_date: string;
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address: string;
  pharmacy_phone: string | null;
  pharmacy_latitude: number;
  pharmacy_longitude: number;
  distance_km: number;
  in_stock: boolean;
}

export interface ExtractedMedicine {
  name: string;
  generic?: string;
  dosage?: string;
  frequency?: string; // e.g. "1-0-1"
  instructions?: string; // e.g. "Take 1 in morning, 0 in afternoon, 1 at night, after food"
  duration?: string;
}

export interface OCRResult {
  medicines: ExtractedMedicine[];
  doctor_notes?: string;
  confidence?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: string;
  inventoryContextUsed?: boolean;
}
