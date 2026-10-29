'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase/data-service';
import { SearchResultItem, ExtractedMedicine } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/ChatWidget';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  UploadCloud,
  FileText,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Navigation,
  Compass,
  Pill,
  Store,
  SlidersHorizontal,
  ChevronRight,
  Cloud,
  Zap,
  X,
  Star,
  Car,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export interface LocationOption {
  name: string;
  lat: number;
  lon: number;
  isLiveGps?: boolean;
  city?: string;
  displayName?: string;
}

// Medical hubs in Mangaluru & Bengaluru
const LOCATIONS: LocationOption[] = [
  // Mangaluru Hubs (Dakshina Kannada)
  { name: 'Mangaluru - Balmatta Road', lat: 12.8710, lon: 74.8465, city: 'Mangaluru' },
  { name: 'Mangaluru - Hampankatta / KS Rao Rd', lat: 12.8695, lon: 74.8390, city: 'Mangaluru' },
  { name: 'Mangaluru - Jyothi / Ambedkar Circle', lat: 12.8732, lon: 74.8480, city: 'Mangaluru' },
  { name: 'Mangaluru - Kadri / Mallikatte', lat: 12.8792, lon: 74.8584, city: 'Mangaluru' },
  { name: 'Mangaluru - KMC Attavar', lat: 12.8640, lon: 74.8440, city: 'Mangaluru' },
  // Bengaluru Hubs
  { name: 'Bengaluru - Koramangala 4th Block', lat: 12.9345, lon: 77.6265, city: 'Bengaluru' },
  { name: 'Bengaluru - Indiranagar 100ft Rd', lat: 12.9719, lon: 77.6412, city: 'Bengaluru' },
  { name: 'Bengaluru - HSR Layout Sector 1', lat: 12.9116, lon: 77.6534, city: 'Bengaluru' },
  { name: 'Bengaluru - BTM 2nd Stage', lat: 12.9166, lon: 77.6101, city: 'Bengaluru' },
  { name: 'Bengaluru - Whitefield ITPL Rd', lat: 12.9856, lon: 77.7315, city: 'Bengaluru' },
  { name: 'Bengaluru - Jayanagar 4th Block', lat: 12.9284, lon: 77.5834, city: 'Bengaluru' },
  { name: 'Bengaluru - Malleshwaram 8th Cross', lat: 12.9984, lon: 77.5709, city: 'Bengaluru' },
];

// Interactive Category Filter Pills
const CATEGORIES = [
  { id: 'all', label: 'All Medicines', icon: '🌟' },
  { id: 'fever', label: 'Fever & Pain', icon: '🔥', search: 'Paracetamol' },
  { id: 'antibiotic', label: 'Antibiotics', icon: '💊', search: 'Augmentin' },
  { id: 'cardio', label: 'Heart & BP', icon: '🫀', search: 'Telma' },
  { id: 'diabetes', label: 'Diabetes', icon: '🩸', search: 'Glycomet' },
  { id: 'gastro', label: 'Acidity & Digestion', icon: '⚡', search: 'Pan' },
  { id: 'vitamins', label: 'Vitamins & Zinc', icon: '🛡️', search: 'Shelcal' },
  { id: 'allergy', label: 'Cough & Allergy', icon: '🌬️', search: 'Montair' },
  { id: 'firstaid', label: 'First Aid & Relief', icon: '🩹', search: 'Volini' },
];

export default function PatientSearchPage() {
  const { user } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');

  // Location state
  const [patientLocation, setPatientLocation] = useState<LocationOption>(LOCATIONS[0]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [customLocationQuery, setCustomLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationOption[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMedicines, setOcrMedicines] = useState<ExtractedMedicine[]>([]);
  const [ocrDoctorNotes, setOcrDoctorNotes] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Reservation Modal
  const [reservationModal, setReservationModal] = useState<{
    code: string;
    medicine: string;
    pharmacy: string;
    address: string;
    phone?: string;
    price: number;
    inStock: boolean;
  } | null>(null);

  // Initial auto-detection & load
  useEffect(() => {
    // 1. Check if user previously saved their verified location
    const saved = typeof window !== 'undefined' ? localStorage.getItem('meditrack_user_location') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.lat && parsed.lon) {
          setPatientLocation(parsed);
          return;
        }
      } catch {}
    }

    // 2. Auto-detect real client location via fast server-side IP lookup
    fetch('/api/location?action=detect')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.lat && data.lon) {
          const autoLoc: LocationOption = {
            name: data.name || `${data.city}, ${data.region}`,
            lat: data.lat,
            lon: data.lon,
            city: data.city,
            isLiveGps: false,
          };
          setPatientLocation(autoLoc);
          localStorage.setItem('meditrack_user_location', JSON.stringify(autoLoc));
        }
      })
      .catch(() => {});
  }, []);

  // Whenever location changes, re-run search to recalculate exact distances
  useEffect(() => {
    executeSearch('');
  }, [patientLocation]);

  const executeSearch = async (queryText: string) => {
    setLoading(true);
    try {
      const data = await dataService.searchMedicines(
        queryText,
        patientLocation.lat,
        patientLocation.lon
      );
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCategory('all');
    executeSearch(searchQuery);
  };

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat.id);
    if (cat.id === 'all') {
      setSearchQuery('');
      executeSearch('');
    } else if (cat.search) {
      setSearchQuery(cat.search);
      executeSearch(cat.search);
    }
  };

  // Detect Live GPS using high accuracy
  const detectLiveLocation = () => {
    setIsDetectingLocation(true);
    setLocationFeedback('📡 Requesting high-accuracy GPS coordinates...');

    if (typeof window === 'undefined' || !navigator.geolocation) {
      fallbackToIpLocation('Browser does not support GPS hardware. Using IP location.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracyMeters = Math.round(pos.coords.accuracy || 15);

        try {
          setLocationFeedback('📍 Resolving exact street and neighbourhood name...');
          const revRes = await fetch(`/api/location?action=reverse&lat=${lat}&lon=${lon}`);
          const revData = await revRes.json();

          const resolvedName = revData.name || `GPS (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`;
          const resolvedLoc: LocationOption = {
            name: resolvedName,
            lat,
            lon,
            isLiveGps: true,
            city: revData.city,
            displayName: revData.displayName,
          };

          setPatientLocation(resolvedLoc);
          localStorage.setItem('meditrack_user_location', JSON.stringify(resolvedLoc));
          setLocationFeedback(`✅ Exact GPS Confirmed: ${resolvedName} (±${accuracyMeters}m accuracy)`);
        } catch {
          const directLoc: LocationOption = {
            name: `Live GPS (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
            lat,
            lon,
            isLiveGps: true,
          };
          setPatientLocation(directLoc);
          localStorage.setItem('meditrack_user_location', JSON.stringify(directLoc));
          setLocationFeedback(`✅ GPS coordinates locked: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);
        } finally {
          setIsDetectingLocation(false);
          setTimeout(() => setLocationFeedback(null), 6000);
        }
      },
      (err) => {
        console.warn('High accuracy geolocation error:', err.message);
        fallbackToIpLocation('GPS permission denied or timeout. Auto-detecting via network IP...');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fallbackToIpLocation = async (noticeMsg: string) => {
    setLocationFeedback(noticeMsg);
    try {
      const ipRes = await fetch('/api/location?action=detect');
      const ipData = await ipRes.json();
      if (ipData.success && ipData.lat && ipData.lon) {
        const autoLoc: LocationOption = {
          name: ipData.name,
          lat: ipData.lat,
          lon: ipData.lon,
          city: ipData.city,
          isLiveGps: false,
        };
        setPatientLocation(autoLoc);
        localStorage.setItem('meditrack_user_location', JSON.stringify(autoLoc));
        setLocationFeedback(`🌐 Network location detected: ${ipData.name}`);
      }
    } catch {
      setLocationFeedback('Could not determine exact location. Please choose your hub from the list.');
    } finally {
      setIsDetectingLocation(false);
      setTimeout(() => setLocationFeedback(null), 5000);
    }
  };

  const handleCustomLocationSearch = async (val: string) => {
    setCustomLocationQuery(val);
    if (!val.trim() || val.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const res = await fetch(`/api/location?action=search&q=${encodeURIComponent(val)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.locations)) {
        setLocationSuggestions(json.locations);
      }
    } catch (err) {
      console.warn('Search location error:', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectCustomLocation = (loc: LocationOption) => {
    setPatientLocation({
      ...loc,
      isLiveGps: false,
    });
    localStorage.setItem('meditrack_user_location', JSON.stringify(loc));
    setShowLocationModal(false);
    setCustomLocationQuery('');
    setLocationSuggestions([]);
    setLocationFeedback(`📍 Location set to: ${loc.name}`);
    setTimeout(() => setLocationFeedback(null), 5000);
  };

  const handleFileUpload = async (file: File) => {
    setOcrError(null);
    setOcrLoading(true);
    setOcrMedicines([]);
    setOcrDoctorNotes(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOcrImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OCR processing failed');

      if (data.medicines && data.medicines.length > 0) {
        setOcrMedicines(data.medicines);
        setOcrDoctorNotes(data.doctor_notes || null);
        const firstMed = data.medicines[0].name;
        setSearchQuery(firstMed);
        setSelectedCategory('all');
        executeSearch(firstMed);
      } else {
        setOcrError('No medicines could be clearly extracted. Try typing the medicine name.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OCR upload failed';
      setOcrError(msg);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSamplePrescription = async (type: string = 'fever') => {
    setOcrError(null);
    setOcrLoading(true);
    setOcrMedicines([]);
    
    try {
      const formData = new FormData();
      formData.append('base64', 'sample-prescription-data');
      formData.append('type', type);
      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setOcrMedicines(data.medicines || []);
      setOcrDoctorNotes(data.doctor_notes || null);
      if (data.medicines && data.medicines[0]) {
        setSearchQuery(data.medicines[0].name);
        setSelectedCategory('all');
        executeSearch(data.medicines[0].name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  };

  const filteredResults = results
    .filter((item) => (inStockOnly ? item.in_stock : true))
    .sort((a, b) => {
      if (a.in_stock && !b.in_stock) return -1;
      if (!a.in_stock && b.in_stock) return 1;
      if (sortBy === 'distance') return a.distance_km - b.distance_km;
      return a.price - b.price;
    });

  // Strict role separation
  if (user && user.role === 'Pharmacy Owner') {
    return (
      <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-[#70707d]/30 bg-[#1e1e2a] text-[#ededf3] shadow-none rounded-[12px] p-8">
            <CardHeader className="p-0 pb-6">
              <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center mb-4">
                <Store className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-medium text-[#ededf3] tracking-[0.015em]">
                Pharmacy Owner Account
              </CardTitle>
              <CardDescription className="text-[#c3c3cc] text-sm font-normal mt-2 leading-relaxed">
                You are currently signed in as a <strong className="text-[#ededf3] font-normal">Pharmacy Owner</strong>. This page contains Patient medicine search topics. Please access your dedicated Pharmacy Owner Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <Link href="/pharmacy" className="block w-full">
                <Button variant="default" className="w-full h-11 rounded-full bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none font-normal">
                  Go to Store Inventory Dashboard
                </Button>
              </Link>
              <Link href="/login?role=Patient" className="block w-full text-center text-xs text-[#c3c3cc] hover:text-[#ededf3] transition-colors">
                Sign in with a Patient account instead
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col relative overflow-hidden selection:bg-[#5266eb] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 relative py-2">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1e2a] text-[#c3c3cc] border border-[#70707d]/30 text-xs font-normal shadow-none">
            <Sparkles className="h-3.5 w-3.5 text-[#c3c3cc]" />
            <span className="text-[#ededf3]">AI-Powered Prescription</span>
            <span className="text-[#70707d]">•</span>
            <span>Realtime Inventory Finder</span>
          </div>

          <h1 className="headline-section text-[#ededf3] font-medium tracking-[0.015em]">
            Find Medicine in Local Pharmacies{' '}
            <span className="text-[#c3c3cc]">
              In Real Time
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#c3c3cc] max-w-2xl mx-auto leading-relaxed font-normal">
            Search 50+ medications across 8 verified Bengaluru pharmacies or snap a photo of your doctor's handwritten prescription. We decode shorthand, check live store stock, and calculate exact distances.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="p-6 rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 text-center shadow-none">
              <p className="text-2xl font-medium text-[#ededf3] tracking-[0.015em]">8 Stores</p>
              <p className="text-[11px] text-[#c3c3cc] font-normal mt-0.5">Verified in Bengaluru</p>
            </div>
            <div className="p-6 rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 text-center shadow-none">
              <p className="text-2xl font-medium text-[#ededf3] tracking-[0.015em]">50+ Meds</p>
              <p className="text-[11px] text-[#c3c3cc] font-normal mt-0.5">In Live Catalog</p>
            </div>
            <div className="p-6 rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 text-center shadow-none">
              <p className="text-2xl font-medium text-[#ededf3] tracking-[0.015em]">&lt; 1.2s</p>
              <p className="text-[11px] text-[#c3c3cc] font-normal mt-0.5">Stock Sync Speed</p>
            </div>
            <div className="p-6 rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 text-center shadow-none">
              <p className="text-2xl font-medium text-[#ededf3] tracking-[0.015em]">100% Free</p>
              <p className="text-[11px] text-[#c3c3cc] font-normal mt-0.5">Counter Hold</p>
            </div>
          </div>
        </div>

        {/* Interactive Category Ribbon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#c3c3cc] font-normal px-1">
            <span className="flex items-center gap-1.5 text-[#ededf3]">
              <Filter className="h-3.5 w-3.5 text-[#c3c3cc]" />
              Browse by Health Need:
            </span>
            <span>Click any pill to instantly filter stock</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-normal whitespace-nowrap transition-colors cursor-pointer shadow-none ${
                    isActive
                      ? 'bg-[#242432] text-[#ededf3] border border-[#e2e3ed]/40'
                      : 'bg-[#1e1e2a] text-[#c3c3cc] hover:text-[#ededf3] border border-[#70707d]/30 hover:border-[#70707d]/60'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual Search & Prescription OCR Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Text Search & Location (7 cols) */}
          <Card className="lg:col-span-7 border border-[#70707d]/30 bg-[#1e1e2a] rounded-[12px] p-8 shadow-none">
            <CardHeader className="p-0 pb-4 border-b border-[#70707d]/25">
              <CardTitle className="text-lg flex items-center gap-2.5 text-[#ededf3] font-medium tracking-[0.015em]">
                <Search className="h-5 w-5 text-[#c3c3cc]" />
                Search Medicine or Active Formula
              </CardTitle>
              <CardDescription className="text-xs text-[#c3c3cc] font-normal">
                Live query across verified Bengaluru pharmacies (Koramangala, Indiranagar, HSR, Whitefield & more)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-5 space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
                <div className="relative flex-1">
                  <Pill className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                  <Input
                    placeholder="Search Dolo 650, Augmentin, Glycomet, Pan 40, Telma..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedCategory('all');
                      executeSearch(e.target.value);
                    }}
                    className="pl-11 h-11 text-sm bg-[#171721] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                  />
                </div>
                {/* Single Cobalt #5266eb Primary Conversion Button */}
                <Button type="submit" variant="default" className="h-11 px-6 text-sm rounded-full bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none font-normal shrink-0">
                  <Search className="h-4 w-4 mr-1.5" />
                  Search
                </Button>
              </form>

              {/* Quick Popular Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#c3c3cc] font-normal flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#c3c3cc]" />
                  Popular:
                </span>
                {['Dolo 650', 'Augmentin 625', 'Azithral 500', 'Pan 40', 'Glycomet 500', 'Telma 40', 'Shelcal 500', 'Montair LC'].map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => {
                      setSearchQuery(med);
                      setSelectedCategory('all');
                      executeSearch(med);
                    }}
                    className="px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] text-[#c3c3cc] hover:text-[#ededf3] border border-[#70707d]/30 transition-colors cursor-pointer text-xs font-normal shadow-none"
                  >
                    {med}
                  </button>
                ))}
              </div>

              {/* Patient Live Location Bar & Search */}
              <div className="pt-3.5 border-t border-[#70707d]/25 space-y-2.5">
                {/* Real-time Feedback Banner */}
                {locationFeedback && (
                  <div className="text-xs p-3 rounded-[8px] bg-[#242432] border border-[#70707d]/40 text-[#ededf3] flex items-center justify-between gap-2 shadow-none animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <Navigation className="h-4 w-4 text-[#ededf3] shrink-0" />
                      <span className="truncate">{locationFeedback}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationFeedback(null)}
                      className="text-[#c3c3cc] hover:text-[#ededf3] p-0.5 shrink-0 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Current Location Badge & GPS Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#171721] p-3.5 rounded-[8px] border border-[#70707d]/30">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <div className="flex items-center gap-1.5 font-normal text-[#ededf3]">
                      <MapPin className="h-4 w-4 text-[#c3c3cc] shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{patientLocation.name}</span>
                    </div>

                    {patientLocation.isLiveGps ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-normal bg-[#242432] text-[#ededf3] border border-[#70707d]/35">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ededf3]" />
                        Exact GPS Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] text-[#c3c3cc] bg-[#1e1e2a] border border-[#70707d]/30">
                        {patientLocation.city || 'Hub Selected'}
                      </span>
                    )}

                    <span className="text-[10px] text-[#70707d] font-mono hidden sm:inline">
                      ({patientLocation.lat.toFixed(4)}°, {patientLocation.lon.toFixed(4)}°)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLiveLocation}
                      disabled={isDetectingLocation}
                      className="h-8 text-xs px-3.5 rounded-full border-[#70707d]/30 bg-[#1e1e2a] hover:bg-[#242432] text-[#ededf3] font-normal"
                    >
                      <Navigation className={`h-3.5 w-3.5 mr-1 text-[#c3c3cc] ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      {isDetectingLocation ? 'Locating...' : 'Detect Exact GPS'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLocationModal(!showLocationModal)}
                      className="h-8 text-xs text-[#c3c3cc] hover:text-[#ededf3] rounded-full font-normal"
                    >
                      <Search className="h-3.5 w-3.5 mr-1 text-[#c3c3cc]" />
                      {showLocationModal ? 'Close' : 'Change Area'}
                    </Button>
                  </div>
                </div>

                {/* Quick Hub Dropdown & Custom Search Drawer */}
                {showLocationModal && (
                  <div className="p-4 rounded-[8px] bg-[#171721] border border-[#70707d]/30 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-normal text-[#c3c3cc] uppercase tracking-wider mb-1.5">
                        Search Any Locality or City:
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#c3c3cc]" />
                        <Input
                          placeholder="Type Balmatta, Kadri, Surathkal, Koramangala, Indiranagar..."
                          value={customLocationQuery}
                          onChange={(e) => handleCustomLocationSearch(e.target.value)}
                          className="h-10 pl-9 text-xs bg-[#13131b] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full"
                        />
                        {isSearchingLocation && (
                          <RefreshCw className="absolute right-3.5 top-3 h-3.5 w-3.5 text-[#c3c3cc] animate-spin" />
                        )}
                      </div>

                      {/* Autocomplete Suggestions */}
                      {locationSuggestions.length > 0 && (
                        <div className="mt-2 border border-[#70707d]/30 rounded-[8px] bg-[#13131b] overflow-hidden divide-y divide-[#70707d]/20 max-h-48 overflow-y-auto">
                          {locationSuggestions.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectCustomLocation(item)}
                              className="w-full text-left p-3 text-xs hover:bg-[#1e1e2a] text-[#ededf3] flex items-start gap-2.5 transition-colors cursor-pointer"
                            >
                              <MapPin className="h-3.5 w-3.5 text-[#c3c3cc] shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-normal text-[#ededf3] truncate">{item.name}</p>
                                <p className="text-[10px] text-[#c3c3cc] truncate">{item.displayName}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Predefined Hubs by Region */}
                    <div>
                      <label className="block text-[11px] font-normal text-[#c3c3cc] uppercase tracking-wider mb-1.5">
                        Or Pick a Medical Hub:
                      </label>
                      <select
                        value={patientLocation.name}
                        onChange={(e) => {
                          const match = LOCATIONS.find((loc) => loc.name === e.target.value);
                          if (match) {
                            setPatientLocation(match);
                            localStorage.setItem('meditrack_user_location', JSON.stringify(match));
                            setShowLocationModal(false);
                            setLocationFeedback(`📍 Location set to: ${match.name}`);
                            setTimeout(() => setLocationFeedback(null), 5000);
                          }
                        }}
                        className="w-full bg-[#13131b] border border-[#70707d]/30 rounded-full px-4 py-2 text-xs font-normal text-[#ededf3] cursor-pointer focus:outline-none focus:border-[#70707d]"
                      >
                        <optgroup label="📍 Mangaluru & Coastal Karnataka Hubs" className="bg-[#1e1e2a] text-[#ededf3]">
                          {LOCATIONS.filter((l) => l.city === 'Mangaluru').map((loc) => (
                            <option key={loc.name} value={loc.name} className="bg-[#171721] text-[#ededf3]">
                              {loc.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📍 Bengaluru Metro Hubs" className="bg-[#1e1e2a] text-[#ededf3]">
                          {LOCATIONS.filter((l) => l.city === 'Bengaluru').map((loc) => (
                            <option key={loc.name} value={loc.name} className="bg-[#171721] text-[#ededf3]">
                              {loc.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Right: AI Prescription OCR (5 cols) */}
          <Card className="lg:col-span-5 border border-[#70707d]/30 bg-[#1e1e2a] rounded-[12px] p-8 shadow-none">
            <CardHeader className="p-0 pb-4 border-b border-[#70707d]/25">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-[#ededf3] font-medium tracking-[0.015em]">
                  <FileText className="h-5 w-5 text-[#c3c3cc]" />
                  Prescription OCR
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-[#70707d]/30 bg-[#171721] text-[#c3c3cc] flex items-center gap-1 rounded-full font-normal">
                  <Cloud className="h-3 w-3 text-[#c3c3cc]" /> Google Cloud Vision
                </Badge>
              </div>
              <CardDescription className="text-xs text-[#c3c3cc] font-normal">
                Snap or upload doctor's handwritten prescription
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-5 space-y-3.5">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border border-dashed border-[#70707d]/35 hover:border-[#70707d]/65 rounded-[8px] p-6 text-center cursor-pointer bg-[#171721] hover:bg-[#1a1a24] transition-colors flex flex-col items-center justify-center gap-2.5 shadow-none"
              >
                <div className="h-11 w-11 rounded-full bg-[#1e1e2a] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-normal text-[#ededf3]">
                    Click to upload prescription photo
                  </p>
                  <p className="text-[11px] text-[#c3c3cc] mt-0.5">
                    Supports JPG, PNG, WEBP, or Camera capture
                  </p>
                </div>
              </div>

              {/* 3 Fast 1-Click Demo Prescriptions */}
              <div className="bg-[#171721] p-3.5 rounded-[8px] border border-[#70707d]/30 space-y-2">
                <span className="text-[11px] text-[#c3c3cc] font-normal flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#c3c3cc]" />
                  Try 1-Click Doctor Rx Demos:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSamplePrescription('fever')}
                    disabled={ocrLoading}
                    className="p-2 text-left rounded-[8px] bg-[#1e1e2a] hover:bg-[#242432] border border-[#70707d]/30 text-[10px] text-[#c3c3cc] hover:text-[#ededf3] transition-colors disabled:opacity-50 cursor-pointer shadow-none"
                  >
                    <span className="font-medium block text-[#ededf3] text-[11px]">🩺 Fever Rx</span>
                    <span className="text-[#c3c3cc] block line-clamp-1">Augmentin + Dolo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSamplePrescription('allergy')}
                    disabled={ocrLoading}
                    className="p-2 text-left rounded-[8px] bg-[#1e1e2a] hover:bg-[#242432] border border-[#70707d]/30 text-[10px] text-[#c3c3cc] hover:text-[#ededf3] transition-colors disabled:opacity-50 cursor-pointer shadow-none"
                  >
                    <span className="font-medium block text-[#ededf3] text-[11px]">🤧 Allergy Rx</span>
                    <span className="text-[#c3c3cc] block line-clamp-1">Montair + Allegra</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSamplePrescription('chronic')}
                    disabled={ocrLoading}
                    className="p-2 text-left rounded-[8px] bg-[#1e1e2a] hover:bg-[#242432] border border-[#70707d]/30 text-[10px] text-[#c3c3cc] hover:text-[#ededf3] transition-colors disabled:opacity-50 cursor-pointer shadow-none"
                  >
                    <span className="font-medium block text-[#ededf3] text-[11px]">🩸 Diabetes Rx</span>
                    <span className="text-[#c3c3cc] block line-clamp-1">Glycomet + Telma</span>
                  </button>
                </div>
              </div>

              {ocrLoading && (
                <div className="p-4 rounded-[8px] bg-[#242432] border border-[#70707d]/30 text-center space-y-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-[#ededf3] mx-auto" />
                  <p className="text-xs font-normal text-[#ededf3]">
                    Analyzing handwritten prescription with Gemini Vision...
                  </p>
                  <p className="text-[10px] text-[#c3c3cc]">
                    Decoding medical shorthand (1-0-1, AC, PC, SOS) into plain English
                  </p>
                </div>
              )}

              {ocrError && (
                <div className="p-3.5 rounded-[8px] bg-[#242432] border border-[#70707d]/30 text-[#ededf3] text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#c3c3cc] mt-0.5" />
                  <span>{ocrError}</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* OCR Decoded Medicine Cards */}
        {ocrMedicines.length > 0 && (
          <div className="p-8 rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 shadow-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#70707d]/25 pb-3.5">
              <div>
                <h3 className="text-base font-medium text-[#ededf3] flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#ededf3]" />
                  Gemini Vision OCR Decoded {ocrMedicines.length} Prescribed Medicines
                </h3>
                {ocrDoctorNotes && (
                  <p className="text-xs text-[#c3c3cc] mt-1 italic font-normal">
                    Doctor Advice: {ocrDoctorNotes}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="w-fit text-xs rounded-full font-normal">
                Clinical JSON Validated
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ocrMedicines.map((med, idx) => (
                <Card key={idx} className="bg-[#171721] border border-[#70707d]/30 hover:border-[#70707d]/50 shadow-none transition-colors rounded-[8px]">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium text-[#ededf3]">
                        {med.name}
                      </CardTitle>
                      {med.dosage && (
                        <Badge variant="outline" className="text-[10px] rounded-full">
                          {med.dosage}
                        </Badge>
                      )}
                    </div>
                    {med.generic && (
                      <p className="text-[11px] text-[#c3c3cc]">{med.generic}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs">
                    <div className="bg-[#13131b] p-2.5 rounded-[6px] border border-[#70707d]/25">
                      <span className="text-[10px] uppercase font-normal text-[#ededf3] block">
                        Doctor Shorthand: {med.frequency || '1-0-1'}
                      </span>
                      <p className="text-[11px] text-[#c3c3cc] mt-0.5 leading-snug">
                        {med.instructions || 'Take as advised by physician'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 rounded-full border-[#70707d]/30 text-[#ededf3] hover:bg-[#242432] font-normal"
                      onClick={() => {
                        setSearchQuery(med.name);
                        setSelectedCategory('all');
                        executeSearch(med.name);
                      }}
                    >
                      Check Stock for {med.name}
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#70707d]/25">
          <div>
            <h2 className="text-xl font-medium text-[#ededf3] tracking-[0.015em] flex items-center gap-2.5">
              <Store className="h-5 w-5 text-[#c3c3cc]" />
              Live Pharmacy Availability ({filteredResults.length} In-Stock Matches)
            </h2>
            <p className="text-xs text-[#c3c3cc] mt-0.5 font-normal">
              Filtered for {patientLocation.name} &bull; Exact distance & pricing compared
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Filter: In Stock Only */}
            <label className="flex items-center gap-2 text-xs font-normal text-[#c3c3cc] cursor-pointer select-none hover:text-[#ededf3] transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded-full border-[#70707d]/40 bg-[#1e1e2a] text-[#5266eb] focus:ring-0 cursor-pointer"
              />
              In Stock Only
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-[#c3c3cc]">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#c3c3cc]" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'price')}
                className="bg-[#1e1e2a] border border-[#70707d]/30 rounded-full px-3.5 py-1.5 text-xs font-normal text-[#ededf3] cursor-pointer focus:outline-none focus:border-[#70707d] transition-colors"
              >
                <option value="distance" className="bg-[#171721] text-[#ededf3]">Nearest Distance (km)</option>
                <option value="price" className="bg-[#171721] text-[#ededf3]">Lowest Price (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid - Flat Alpine Cards */}
        {loading ? (
          <div className="p-16 text-center text-[#c3c3cc] flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-[#ededf3]" />
            <p className="text-sm font-normal">Querying live pharmacy inventories...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <Card className="p-12 text-center rounded-[12px] border border-[#70707d]/30 bg-[#1e1e2a] shadow-none">
            <Pill className="h-10 w-10 text-[#70707d] mx-auto mb-2 opacity-60" />
            <h3 className="text-base font-medium text-[#ededf3]">
              No matching medicines found
            </h3>
            <p className="text-xs text-[#c3c3cc] mt-1 max-w-sm mx-auto font-normal">
              We couldn't find "{searchQuery}" in nearby stock. Try searching "Dolo 650", "Augmentin", or click a quick category pill above.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResults.map((item) => {
              const estimatedDriveMins = Math.max(3, Math.round(item.distance_km * 2.8));

              return (
                <Card
                  key={item.inventory_id}
                  className={`overflow-hidden transition-colors duration-150 rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 hover:border-[#70707d]/50 shadow-none ${
                    !item.in_stock ? 'opacity-70' : ''
                  }`}
                >
                  {/* Top Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-base text-[#ededf3] leading-tight tracking-[0.015em]">
                          {item.medicine_name}
                        </h3>
                        {item.generic_name && (
                          <p className="text-xs text-[#c3c3cc] mt-0.5 font-normal">
                            {item.generic_name}
                          </p>
                        )}
                      </div>

                      {/* Stock Status Badge */}
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-xs font-normal gap-1.5 rounded-full border-[#70707d]/30 bg-[#171721] text-[#ededf3]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ededf3]" />
                        {item.in_stock
                          ? `${item.quantity} In Stock`
                          : 'Out of Stock'}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-[#c3c3cc] mt-1 font-mono">
                      Dosage: {item.dosage || 'Standard'}
                    </p>
                  </div>

                  {/* Pharmacy Information & Distance */}
                  <CardContent className="px-5 py-3 space-y-2.5 border-t border-[#70707d]/20 text-xs p-0">
                    
                    {/* Pharmacy Name & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Store className="h-4 w-4 text-[#c3c3cc] shrink-0" />
                        <span className="font-normal text-[#ededf3] text-sm truncate">
                          {item.pharmacy_name}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-[#c3c3cc] font-normal shrink-0">
                        <Star className="h-3 w-3 fill-[#c3c3cc]" />
                        4.9
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 text-[#c3c3cc]">
                      <MapPin className="h-3.5 w-3.5 text-[#70707d] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug font-normal">{item.pharmacy_address}</span>
                    </div>

                    {/* Distance & Drive Time Display */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-[#c3c3cc]" />
                        <span className="font-normal text-[#ededf3]">
                          {item.distance_km} km away
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#c3c3cc] bg-[#171721] px-2.5 py-0.5 rounded-full border border-[#70707d]/30">
                        <Car className="h-3 w-3 text-[#c3c3cc]" />
                        <span>~{estimatedDriveMins} mins</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#c3c3cc] font-normal">Price per unit:</span>
                      <span className="text-lg font-medium text-[#ededf3]">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </CardContent>

                  {/* Card Footer Actions */}
                  <CardFooter className="px-5 py-3 bg-[#171721] border-t border-[#70707d]/20 flex items-center justify-between gap-2 p-0">
                    <a
                      href={`tel:${item.pharmacy_phone || '+918025534321'}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9 rounded-full border-[#70707d]/30 text-[#ededf3] bg-[#1e1e2a] hover:bg-[#242432] font-normal"
                      >
                        <Phone className="h-3.5 w-3.5 mr-1 text-[#c3c3cc]" />
                        Call
                      </Button>
                    </a>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.pharmacy_name + ' ' + item.pharmacy_address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9 rounded-full border-[#70707d]/30 text-[#ededf3] bg-[#1e1e2a] hover:bg-[#242432] font-normal"
                      >
                        <Navigation className="h-3.5 w-3.5 mr-1 text-[#c3c3cc]" />
                        Maps
                      </Button>
                    </a>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-xs h-9 rounded-full bg-[#242432] hover:bg-[#2c2c3e] border border-[#70707d]/30 text-[#ededf3] font-normal"
                      onClick={() => {
                        const randomCode = 'RES-' + Math.floor(10000 + Math.random() * 90000);
                        setReservationModal({
                          code: randomCode,
                          medicine: item.medicine_name,
                          pharmacy: item.pharmacy_name,
                          address: item.pharmacy_address,
                          phone: item.pharmacy_phone || '+91 80 2553 4321',
                          price: item.price,
                          inStock: item.in_stock,
                        });
                      }}
                    >
                      {item.in_stock ? 'Reserve' : 'Restock'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

      </main>

      {/* Interactive Reservation Confirmation Modal */}
      {reservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171721]/90 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 shadow-none p-8 space-y-4 text-center relative overflow-hidden">
            <button
              onClick={() => setReservationModal(null)}
              className="absolute top-4 right-4 text-[#c3c3cc] hover:text-[#ededf3] p-1.5 rounded-full hover:bg-[#242432] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-12 w-12 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
              {reservationModal.inStock ? (
                <CheckCircle2 className="h-6 w-6 text-[#ededf3]" />
              ) : (
                <Clock className="h-6 w-6 text-[#c3c3cc]" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-medium text-[#ededf3] tracking-[0.015em]">
                {reservationModal.inStock ? 'Medicine Held at Counter' : 'Restock Request Sent'}
              </h3>
              <p className="text-xs text-[#c3c3cc] mt-1 max-w-xs mx-auto font-normal">
                {reservationModal.inStock
                  ? 'Show your reservation token to the pharmacist upon arrival for zero-wait checkout.'
                  : 'We notified the pharmacy owner to replenish this item in their inventory.'}
              </p>
            </div>

            {/* Token Badge */}
            {reservationModal.inStock && (
              <div className="py-2.5 px-6 rounded-[8px] bg-[#171721] border border-[#70707d]/30 inline-block">
                <p className="text-[10px] uppercase font-normal text-[#c3c3cc] tracking-wider">Pickup Pass Token</p>
                <p className="text-2xl font-mono font-medium text-[#ededf3] tracking-widest">{reservationModal.code}</p>
              </div>
            )}

            <div className="bg-[#171721] rounded-[8px] p-4 border border-[#70707d]/20 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#c3c3cc]">Medicine:</span>
                <span className="font-normal text-[#ededf3]">{reservationModal.medicine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c3c3cc]">Pharmacy:</span>
                <span className="font-normal text-[#ededf3]">{reservationModal.pharmacy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c3c3cc]">Store Address:</span>
                <span className="text-[#ededf3] text-right line-clamp-1 font-normal">{reservationModal.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c3c3cc]">Counter Price:</span>
                <span className="font-medium text-[#ededf3]">{formatCurrency(reservationModal.price)}</span>
              </div>
              {reservationModal.inStock && (
                <div className="flex justify-between border-t border-[#70707d]/20 pt-2 text-[11px] text-[#c3c3cc]">
                  <span>Hold Guarantee:</span>
                  <span className="font-normal text-[#ededf3]">Valid for 2 Hours (Free Hold)</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <a
                href={`tel:${reservationModal.phone}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full text-xs h-10 rounded-full border-[#70707d]/30 text-[#ededf3] hover:bg-[#242432] font-normal">
                  <Phone className="h-3.5 w-3.5 mr-1 text-[#c3c3cc]" />
                  Call Store
                </Button>
              </a>
              <Button
                variant="default"
                className="flex-1 text-xs h-10 rounded-full bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none font-normal"
                onClick={() => setReservationModal(null)}
              >
                Got It, Thanks
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Multilingual Chatbot Widget */}
      <ChatWidget />
    </div>
  );
}
