import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Calculate Haversine distance in kilometers between two geo points
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Valid UUID format check (RFC 4122 v4 or general 8-4-4-4-12)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Legacy ID map to prevent "invalid input syntax for type uuid"
const LEGACY_ID_MAP: Record<string, string> = {
  'owner-apollo-1': 'a1111111-1111-1111-1111-111111111111',
  'owner-medplus-2': 'a2222222-2222-2222-2222-222222222222',
  'owner-wellness-3': 'a3333333-3333-3333-3333-333333333333',
  'patient-demo-1': 'b1111111-1111-1111-1111-111111111111',
  'pharm-apollo-1': 'c1111111-1111-1111-1111-111111111111',
  'pharm-medplus-2': 'c2222222-2222-2222-2222-222222222222',
  'pharm-wellness-3': 'c3333333-3333-3333-3333-333333333333',
  'pharm-greencross-4': 'c4444444-4444-4444-4444-444444444444',
};

export function toValidUUID(id: string | null | undefined, fallbackUUID?: string): string {
  if (!id) return fallbackUUID || generateUUID();
  if (isValidUUID(id)) return id;
  if (LEGACY_ID_MAP[id]) return LEGACY_ID_MAP[id];
  return fallbackUUID || generateUUID();
}
