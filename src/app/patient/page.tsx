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
        try {
          const res = await fetch(`/api/location?action=reverse&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const liveLoc: LocationOption = {
            name: data.name || `Live GPS (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
            lat,
            lon,
            isLiveGps: true,
            city: data.city || 'Karnataka',
          };
          setPatientLocation(liveLoc);
          localStorage.setItem('meditrack_user_location', JSON.stringify(liveLoc));
          setLocationFeedback(`✅ Exact GPS active: ${liveLoc.name}`);
        } catch {
          const fallbackLoc: LocationOption = {
            name: `Live Location (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
            lat,
            lon,
            isLiveGps: true,
          };
          setPatientLocation(fallbackLoc);
          localStorage.setItem('meditrack_user_location', JSON.stringify(fallbackLoc));
          setLocationFeedback('✅ GPS coordinates locked.');
        } finally {
          setIsDetectingLocation(false);
          setTimeout(() => setLocationFeedback(null), 5000);
        }
      },
      (err) => {
        fallbackToIpLocation(`GPS Error (${err.message}). Falling back to network IP.`);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const fallbackToIpLocation = async (msg: string) => {
    setLocationFeedback(msg);
    try {
      const res = await fetch('/api/location?action=detect');
      const data = await res.json();
      if (data.success && data.lat && data.lon) {
        const ipLoc: LocationOption = {
          name: data.name || `${data.city}, Karnataka`,
          lat: data.lat,
          lon: data.lon,
          city: data.city,
          isLiveGps: false,
        };
        setPatientLocation(ipLoc);
        localStorage.setItem('meditrack_user_location', JSON.stringify(ipLoc));
        setLocationFeedback(`📍 Set from network: ${ipLoc.name}`);
      }
    } catch {
      setLocationFeedback('Could not detect location. Please pick a medical hub.');
    } finally {
      setIsDetectingLocation(false);
      setTimeout(() => setLocationFeedback(null), 5000);
    }
  };

  const handleCustomLocationSearch = async (val: string) => {
    setCustomLocationQuery(val);
    if (val.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const res = await fetch(`/api/location?action=search&q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.success && data.results) {
        setLocationSuggestions(data.results);
      }
    } catch {
      // Ignore location search errors
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectCustomLocation = (loc: LocationOption) => {
    setPatientLocation(loc);
    localStorage.setItem('meditrack_user_location', JSON.stringify(loc));
    setShowLocationModal(false);
    setCustomLocationQuery('');
    setLocationSuggestions([]);
    setLocationFeedback(`📍 Location set to: ${loc.name}`);
    setTimeout(() => setLocationFeedback(null), 5000);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setOcrLoading(true);
    setOcrError(null);
    setOcrMedicines([]);
    setOcrDoctorNotes(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setOcrImagePreview(base64);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.medicines && data.medicines.length > 0) {
          setOcrMedicines(data.medicines);
          setOcrDoctorNotes(data.doctor_notes || null);
          setSearchQuery(data.medicines[0].name);
          setSelectedCategory('all');
          executeSearch(data.medicines[0].name);
        } else {
          setOcrError(data.error || 'No medicines could be extracted. Please try a clearer prescription photo.');
        }
      } catch (err) {
        setOcrError('Failed to communicate with Google Cloud Vision OCR service.');
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSamplePrescription = async (type: 'fever' | 'allergy' | 'chronic') => {
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
      <div className="min-h-screen bg-[#f7f7f7] text-[#393737] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full rounded-[15px] p-[24px] bg-[#ffffff] border border-[#393737]/8 text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-0 pb-6">
              <div className="h-12 w-12 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle className="text-[22px] font-serif font-normal text-[#393737] tracking-[-0.55px] leading-[1.2]">
                Pharmacy Owner Account
              </CardTitle>
              <CardDescription className="text-sm text-[#888787] font-normal mt-2 leading-[1.5] font-sans">
                You are currently signed in as a <strong className="text-[#393737] font-semibold">Pharmacy Owner</strong>. This page contains Patient medicine search topics. Please access your dedicated Pharmacy Owner Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <Link href="/pharmacy" className="block w-full">
                <Button variant="default" className="w-full h-11 rounded-[100px] bg-[#393737] hover:bg-[#2b2929] text-white shadow-none font-semibold border-0 text-base font-sans">
                  Go to Store Inventory Dashboard
                </Button>
              </Link>
              <Link href="/login?role=Patient" className="block w-full text-center text-sm text-[#888787] hover:text-[#393737] transition-colors font-sans">
                Sign in with a Patient account instead
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#393737] flex flex-col relative overflow-hidden selection:bg-[#393737] selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-[72px] sm:py-[96px] space-y-[72px] sm:space-y-[96px] relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 relative py-2">
          
          <div className="popcorn-pill-badge">
            <Sparkles className="h-3.5 w-3.5 text-[#393737] mr-1.5" />
            <span className="font-sans">AI-Powered Prescription</span>
            <span className="text-[#888787] mx-2">•</span>
            <span className="text-[#888787]">Realtime Inventory Finder</span>
          </div>

          <h1 className="editorial-headline-lg text-[#393737]">
            Find Medicine in Local Pharmacies{' '}
            <span className="italic font-normal">
              In Real Time
            </span>
          </h1>

          <p className="text-base text-[#888787] max-w-2xl mx-auto leading-[1.5] font-normal font-sans">
            Search 50+ medications across 8 verified Bengaluru pharmacies or snap a photo of your doctor's handwritten prescription. We decode shorthand, check live store stock, and calculate exact distances.
          </p>

          {/* Quick Metrics Bar: Paper White cards with soft shadow */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="p-5 rounded-[12px] bg-[#ffffff] border border-[#393737]/8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <p className="text-[22px] font-serif font-normal text-[#393737] tracking-[-0.55px]">8 Stores</p>
              <p className="text-[11px] text-[#888787] font-sans mt-0.5 uppercase tracking-wider">Verified in Bengaluru</p>
            </div>
            <div className="p-5 rounded-[12px] bg-[#ffffff] border border-[#393737]/8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <p className="text-[22px] font-serif font-normal text-[#393737] tracking-[-0.55px]">50+ Meds</p>
              <p className="text-[11px] text-[#888787] font-sans mt-0.5 uppercase tracking-wider">In Live Catalog</p>
            </div>
            <div className="p-5 rounded-[12px] bg-[#ffffff] border border-[#393737]/8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <p className="text-[22px] font-serif font-normal text-[#393737] tracking-[-0.55px]">&lt; 1.2s</p>
              <p className="text-[11px] text-[#888787] font-sans mt-0.5 uppercase tracking-wider">Stock Sync Speed</p>
            </div>
            <div className="p-5 rounded-[12px] bg-[#ffffff] border border-[#393737]/8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <p className="text-[22px] font-serif font-normal text-[#393737] tracking-[-0.55px]">100% Free</p>
              <p className="text-[11px] text-[#888787] font-sans mt-0.5 uppercase tracking-wider">Counter Hold</p>
            </div>
          </div>
        </div>

        {/* Interactive Category Ribbon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#888787] font-sans px-1">
            <span className="flex items-center gap-1.5 text-[#393737] font-semibold">
              <Filter className="h-3.5 w-3.5 text-[#393737]" />
              Browse by Health Need:
            </span>
            <span>Click any pill to instantly filter stock</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[100px] text-sm font-sans transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#393737] text-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold'
                      : 'bg-[#ffffff] text-[#393737] border border-[#393737]/15 hover:bg-[#f7f7f7] shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
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
          <Card className="lg:col-span-7 bg-[#ffffff] rounded-[15px] p-[24px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-0 pb-4 border-b border-[#393737]/10">
              <CardTitle className="text-[22px] font-serif font-normal flex items-center gap-2.5 text-[#393737] leading-[1.2] tracking-[-0.55px]">
                <Search className="h-5 w-5 text-[#393737]" />
                Search Medicine or Active Formula
              </CardTitle>
              <CardDescription className="text-sm text-[#888787] font-normal mt-1 font-sans">
                Live query across verified Bengaluru pharmacies (Koramangala, Indiranagar, HSR, Whitefield & more)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-5 space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
                <div className="relative flex-1">
                  <Pill className="absolute left-4 top-3.5 h-4 w-4 text-[#888787]" />
                  <Input
                    placeholder="Search Dolo 650, Augmentin, Glycomet, Pan 40, Telma..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedCategory('all');
                      executeSearch(e.target.value);
                    }}
                    className="pl-11 h-11 text-base bg-[#f7f7f7] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  />
                </div>
                {/* Pill CTA Button: Warm Graphite #393737 */}
                <Button type="submit" variant="default" className="h-11 px-6 text-base rounded-[100px] bg-[#393737] hover:bg-[#2b2929] text-white shadow-none font-semibold shrink-0 border-0 font-sans">
                  <Search className="h-4 w-4 mr-1.5" />
                  Search
                </Button>
              </form>

              {/* Quick Popular Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#888787] font-sans flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#393737]" />
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
                    className="px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] hover:bg-[#ececec] border border-[#393737]/15 text-[#393737] transition-colors cursor-pointer text-xs font-sans shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                  >
                    {med}
                  </button>
                ))}
              </div>

              {/* Patient Live Location Bar & Search */}
              <div className="pt-4 border-t border-[#393737]/10 space-y-3">
                {locationFeedback && (
                  <div className="text-xs p-3 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-between gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] animate-in fade-in font-sans">
                    <div className="flex items-center gap-2 min-w-0">
                      <Navigation className="h-4 w-4 text-[#393737] shrink-0" />
                      <span className="truncate">{locationFeedback}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationFeedback(null)}
                      className="text-[#888787] hover:text-[#393737] p-0.5 shrink-0 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Current Location Badge & GPS Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm bg-[#f7f7f7] p-3.5 rounded-[12px] border border-[#393737]/8">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-[#393737] font-sans">
                      <MapPin className="h-4 w-4 text-[#393737] shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{patientLocation.name}</span>
                    </div>

                    {patientLocation.isLiveGps ? (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-[100px] text-[11px] font-sans bg-[#393737] text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        Exact GPS Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-[100px] text-[11px] text-[#888787] bg-[#ffffff] border border-[#393737]/15 font-sans">
                        {patientLocation.city || 'Hub Selected'}
                      </span>
                    )}

                    <span className="text-[11px] text-[#888787] font-mono hidden sm:inline">
                      ({patientLocation.lat.toFixed(4)}°, {patientLocation.lon.toFixed(4)}°)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={detectLiveLocation}
                      disabled={isDetectingLocation}
                      className="h-8 text-xs px-4 rounded-[100px] text-[#393737] font-semibold font-sans"
                    >
                      <Navigation className={`h-3.5 w-3.5 mr-1 text-[#393737] ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      {isDetectingLocation ? 'Locating...' : 'Detect Exact GPS'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLocationModal(!showLocationModal)}
                      className="h-8 text-xs text-[#393737] rounded-[100px] font-sans"
                    >
                      <Search className="h-3.5 w-3.5 mr-1 text-[#393737]" />
                      {showLocationModal ? 'Close' : 'Change Area'}
                    </Button>
                  </div>
                </div>

                {/* Quick Hub Dropdown & Custom Search Drawer */}
                {showLocationModal && (
                  <div className="p-4 rounded-[12px] bg-[#f7f7f7] border border-[#393737]/10 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-sans text-[#888787] uppercase tracking-wider mb-1.5">
                        Search Any Locality or City:
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#888787]" />
                        <Input
                          placeholder="Type Balmatta, Kadri, Surathkal, Koramangala, Indiranagar..."
                          value={customLocationQuery}
                          onChange={(e) => handleCustomLocationSearch(e.target.value)}
                          className="h-10 pl-9 text-xs bg-[#ffffff] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] font-sans"
                        />
                        {isSearchingLocation && (
                          <RefreshCw className="absolute right-3.5 top-3 h-3.5 w-3.5 text-[#393737] animate-spin" />
                        )}
                      </div>

                      {/* Autocomplete Suggestions */}
                      {locationSuggestions.length > 0 && (
                        <div className="mt-2 rounded-[12px] bg-[#ffffff] border border-[#393737]/10 overflow-hidden divide-y divide-[#393737]/10 max-h-48 overflow-y-auto shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                          {locationSuggestions.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectCustomLocation(item)}
                              className="w-full text-left p-3 text-xs hover:bg-[#f7f7f7] text-[#393737] flex items-start gap-2.5 transition-colors cursor-pointer font-sans"
                            >
                              <MapPin className="h-3.5 w-3.5 text-[#393737] shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-semibold text-[#393737] truncate">{item.name}</p>
                                <p className="text-[11px] text-[#888787] truncate">{item.displayName}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Predefined Hubs by Region */}
                    <div>
                      <label className="block text-[11px] font-sans text-[#888787] uppercase tracking-wider mb-1.5">
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
                        className="w-full bg-[#ffffff] border border-[#393737]/20 rounded-[100px] px-4 py-2 text-xs font-normal text-[#393737] cursor-pointer focus:outline-none focus:border-[#393737] font-sans shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                      >
                        <optgroup label="📍 Mangaluru & Coastal Karnataka Hubs" className="bg-[#ffffff] text-[#393737]">
                          {LOCATIONS.filter((l) => l.city === 'Mangaluru').map((loc) => (
                            <option key={loc.name} value={loc.name} className="bg-[#ffffff] text-[#393737]">
                              {loc.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📍 Bengaluru Metro Hubs" className="bg-[#ffffff] text-[#393737]">
                          {LOCATIONS.filter((l) => l.city === 'Bengaluru').map((loc) => (
                            <option key={loc.name} value={loc.name} className="bg-[#ffffff] text-[#393737]">
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
          <Card className="lg:col-span-5 bg-[#ffffff] rounded-[15px] p-[24px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-0 pb-4 border-b border-[#393737]/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[22px] font-serif font-normal flex items-center gap-2 text-[#393737] leading-[1.2] tracking-[-0.55px]">
                  <FileText className="h-5 w-5 text-[#393737]" />
                  Prescription OCR
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] border-[#393737]/15 text-[#393737] flex items-center gap-1 rounded-[100px] font-sans shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <Cloud className="h-3 w-3 text-[#393737]" /> Google Cloud Vision
                </Badge>
              </div>
              <CardDescription className="text-sm text-[#888787] font-normal mt-1 font-sans">
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
                className="group relative border border-dashed border-[#393737]/25 hover:border-[#393737] rounded-[12px] p-6 text-center cursor-pointer bg-[#f7f7f7] hover:bg-[#ffffff] transition-colors flex flex-col items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
              >
                <div className="h-12 w-12 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#393737] font-sans">
                    Click to upload prescription photo
                  </p>
                  <p className="text-xs text-[#888787] mt-0.5 font-sans">
                    Supports JPG, PNG, WEBP, or Camera capture
                  </p>
                </div>
              </div>

              {/* 3 Fast 1-Click Demo Prescriptions */}
              <div className="bg-[#f7f7f7] p-3.5 rounded-[12px] border border-[#393737]/8 space-y-2">
                <span className="text-[12px] text-[#393737] font-semibold flex items-center gap-1.5 font-sans">
                  <Sparkles className="h-3.5 w-3.5 text-[#393737]" />
                  Try 1-Click Doctor Rx Demos:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSamplePrescription('fever')}
                    disabled={ocrLoading}
                    className="p-2.5 text-left rounded-[100px] bg-[#ffffff] border border-[#393737]/15 hover:bg-[#ececec] text-[11px] text-[#888787] hover:text-[#393737] transition-colors disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    <span className="font-semibold block text-[#393737] text-[12px]">🩺 Fever Rx</span>
                    <span className="text-[#888787] block line-clamp-1">Augmentin + Dolo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSamplePrescription('allergy')}
                    disabled={ocrLoading}
                    className="p-2.5 text-left rounded-[100px] bg-[#ffffff] border border-[#393737]/15 hover:bg-[#ececec] text-[11px] text-[#888787] hover:text-[#393737] transition-colors disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    <span className="font-semibold block text-[#393737] text-[12px]">🤧 Allergy Rx</span>
                    <span className="text-[#888787] block line-clamp-1">Montair + Allegra</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSamplePrescription('chronic')}
                    disabled={ocrLoading}
                    className="p-2.5 text-left rounded-[100px] bg-[#ffffff] border border-[#393737]/15 hover:bg-[#ececec] text-[11px] text-[#888787] hover:text-[#393737] transition-colors disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    <span className="font-semibold block text-[#393737] text-[12px]">🩸 Diabetes Rx</span>
                    <span className="text-[#888787] block line-clamp-1">Glycomet + Telma</span>
                  </button>
                </div>
              </div>

              {ocrLoading && (
                <div className="p-4 rounded-[12px] bg-[#f7f7f7] border border-[#393737]/15 text-center space-y-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-[#393737] mx-auto" />
                  <p className="text-sm font-semibold text-[#393737] font-sans">
                    Analyzing handwritten prescription with Gemini Vision...
                  </p>
                  <p className="text-xs text-[#888787] font-sans">
                    Decoding medical shorthand (1-0-1, AC, PC, SOS) into plain English
                  </p>
                </div>
              )}

              {ocrError && (
                <div className="p-3.5 rounded-[12px] bg-[#ffffff] border border-[#393737]/20 text-[#393737] text-xs flex items-start gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#393737] mt-0.5" />
                  <span>{ocrError}</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* OCR Decoded Medicine Cards */}
        {ocrMedicines.length > 0 && (
          <div className="p-[24px] rounded-[15px] bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#393737]/10 pb-4">
              <div>
                <h3 className="text-lg font-serif font-normal text-[#393737] flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#393737]" />
                  Gemini Vision OCR Decoded {ocrMedicines.length} Prescribed Medicines
                </h3>
                {ocrDoctorNotes && (
                  <p className="text-xs text-[#888787] mt-1 italic font-normal font-sans">
                    Doctor Advice: {ocrDoctorNotes}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="w-fit text-xs rounded-[100px] font-sans">
                Clinical JSON Validated
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ocrMedicines.map((med, idx) => (
                <Card key={idx} className="bg-[#f7f7f7] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-colors rounded-[12px]">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-sans font-semibold text-[#393737]">
                        {med.name}
                      </CardTitle>
                      {med.dosage && (
                        <Badge variant="secondary" className="text-[10px] rounded-[100px]">
                          {med.dosage}
                        </Badge>
                      )}
                    </div>
                    {med.generic && (
                      <p className="text-xs text-[#888787] font-sans">{med.generic}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs">
                    <div className="bg-[#ffffff] p-2.5 rounded-[8px] border border-[#393737]/8">
                      <span className="text-[10px] uppercase font-semibold text-[#393737] block font-sans">
                        Doctor Shorthand: {med.frequency || '1-0-1'}
                      </span>
                      <p className="text-xs text-[#888787] mt-0.5 leading-snug font-normal font-sans">
                        {med.instructions || 'Take as advised by physician'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs h-8 rounded-[100px] text-[#393737] font-semibold font-sans"
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#393737]/10">
          <div>
            <h2 className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2] flex items-center gap-2.5">
              <Store className="h-6 w-6 text-[#393737]" />
              Live Pharmacy Availability ({filteredResults.length} In-Stock Matches)
            </h2>
            <p className="text-sm text-[#888787] mt-1 font-normal font-sans">
              Filtered for {patientLocation.name} &bull; Exact distance & pricing compared
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-normal text-[#393737] cursor-pointer select-none hover:text-[#1e1d1d] transition-colors font-sans">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[#393737]/30 bg-[#ffffff] text-[#393737] focus:ring-0 cursor-pointer"
              />
              In Stock Only
            </label>

            <div className="flex items-center gap-2 text-sm text-[#888787] font-sans">
              <SlidersHorizontal className="h-4 w-4 text-[#393737]" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'price')}
                className="bg-[#ffffff] border border-[#393737]/20 rounded-[100px] px-4 py-1.5 text-xs font-normal text-[#393737] cursor-pointer focus:outline-none focus:border-[#393737] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
              >
                <option value="distance" className="bg-[#ffffff] text-[#393737]">Nearest Distance (km)</option>
                <option value="price" className="bg-[#ffffff] text-[#393737]">Lowest Price (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid - Paper White Cards with Soft Shadow */}
        {loading ? (
          <div className="p-16 text-center text-[#888787] flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-[#393737]" />
            <p className="text-base font-normal font-sans">Querying live pharmacy inventories...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <Card className="p-[24px] text-center rounded-[12px] bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <Pill className="h-10 w-10 text-[#888787] mx-auto mb-2 opacity-60" />
            <h3 className="text-base font-serif font-normal text-[#393737]">
              No matching medicines found
            </h3>
            <p className="text-sm text-[#888787] mt-1 max-w-sm mx-auto font-normal font-sans">
              We couldn't find "{searchQuery}" in nearby stock. Try searching "Dolo 650", "Augmentin", or click a quick category pill above.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((item) => {
              const estimatedDriveMins = Math.max(3, Math.round(item.distance_km * 2.8));

              return (
                <Card
                  key={item.inventory_id}
                  className={`overflow-hidden transition-all duration-150 rounded-[12px] bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] ${
                    !item.in_stock ? 'opacity-70' : ''
                  }`}
                >
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-normal text-xl text-[#393737] leading-snug tracking-[-0.5px]">
                          {item.medicine_name}
                        </h3>
                        {item.generic_name && (
                          <p className="text-xs text-[#888787] mt-0.5 font-normal font-sans">
                            {item.generic_name}
                          </p>
                        )}
                      </div>

                      <Badge
                        variant="secondary"
                        className="shrink-0 text-xs font-sans gap-1.5 rounded-[100px]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#393737]" />
                        {item.in_stock
                          ? `${item.quantity} In Stock`
                          : 'Out of Stock'}
                      </Badge>
                    </div>

                    <p className="text-[12px] text-[#888787] mt-1 font-mono">
                      Dosage: {item.dosage || 'Standard'}
                    </p>
                  </div>

                  <CardContent className="px-6 py-4 space-y-3 border-t border-[#393737]/10 text-sm p-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Store className="h-4 w-4 text-[#393737] shrink-0" />
                        <span className="font-semibold text-[#393737] text-sm truncate font-sans">
                          {item.pharmacy_name}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-[#393737] font-semibold shrink-0 font-sans">
                        <Star className="h-3.5 w-3.5 fill-[#393737]" />
                        4.9
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-[#888787]">
                      <MapPin className="h-4 w-4 text-[#888787] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug font-normal text-xs font-sans">{item.pharmacy_address}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <Compass className="h-4 w-4 text-[#393737]" />
                        <span className="font-normal text-[#393737] text-xs font-sans">
                          {item.distance_km} km away
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-[#393737] bg-[#f7f7f7] border border-[#393737]/15 px-3 py-1 rounded-[100px] font-sans shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                        <Car className="h-3.5 w-3.5 text-[#393737]" />
                        <span>~{estimatedDriveMins} mins</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#888787] text-xs font-normal font-sans">Price per unit:</span>
                      <span className="text-lg font-serif font-normal text-[#393737]">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 py-4 bg-[#f7f7f7] border-t border-[#393737]/10 flex items-center justify-between gap-2.5 p-0">
                    <a
                      href={`tel:${item.pharmacy_phone || '+918025534321'}`}
                      className="flex-1"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs h-9 rounded-[100px] text-[#393737] font-semibold font-sans"
                      >
                        <Phone className="h-3.5 w-3.5 mr-1 text-[#393737]" />
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
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs h-9 rounded-[100px] text-[#393737] font-semibold font-sans"
                      >
                        <Navigation className="h-3.5 w-3.5 mr-1 text-[#393737]" />
                        Maps
                      </Button>
                    </a>

                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 text-xs h-9 rounded-[100px] bg-[#393737] hover:bg-[#2b2929] text-white font-semibold font-sans shadow-none border-0"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f7f7f7]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[15px] bg-[#ffffff] border border-[#393737]/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-[24px] space-y-5 text-center relative overflow-hidden">
            <button
              onClick={() => setReservationModal(null)}
              className="absolute top-4 right-4 text-[#888787] hover:text-[#393737] p-1.5 rounded-[100px] hover:bg-[#f7f7f7] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-12 w-12 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              {reservationModal.inStock ? (
                <CheckCircle2 className="h-6 w-6 text-[#393737]" />
              ) : (
                <Clock className="h-6 w-6 text-[#393737]" />
              )}
            </div>

            <div>
              <h3 className="text-[22px] font-serif font-normal text-[#393737] tracking-[-0.55px] leading-[1.2]">
                {reservationModal.inStock ? 'Medicine Held at Counter' : 'Restock Request Sent'}
              </h3>
              <p className="text-xs text-[#888787] mt-1.5 max-w-xs mx-auto font-normal font-sans">
                {reservationModal.inStock
                  ? 'Show your reservation token to the pharmacist upon arrival for zero-wait checkout.'
                  : 'We notified the pharmacy owner to replenish this item in their inventory.'}
              </p>
            </div>

            {/* Token Badge */}
            {reservationModal.inStock && (
              <div className="py-2.5 px-6 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 inline-block shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <p className="text-[11px] uppercase font-sans text-[#888787] tracking-wider">Pickup Pass Token</p>
                <p className="text-[30px] font-mono font-normal text-[#393737] tracking-widest leading-none mt-1">{reservationModal.code}</p>
              </div>
            )}

            <div className="bg-[#f7f7f7] rounded-[12px] border border-[#393737]/8 p-4 text-left space-y-2.5 text-xs text-[#888787] font-sans">
              <div className="flex justify-between">
                <span className="text-[#888787]">Medicine:</span>
                <span className="font-semibold text-[#393737]">{reservationModal.medicine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888787]">Pharmacy:</span>
                <span className="font-semibold text-[#393737]">{reservationModal.pharmacy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888787]">Store Address:</span>
                <span className="text-[#393737] text-right line-clamp-1 font-normal">{reservationModal.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888787]">Counter Price:</span>
                <span className="font-semibold text-[#393737]">{formatCurrency(reservationModal.price)}</span>
              </div>
              {reservationModal.inStock && (
                <div className="flex justify-between border-t border-[#393737]/10 pt-2 text-[11px] text-[#393737]">
                  <span>Hold Guarantee:</span>
                  <span className="font-semibold text-[#393737]">Valid for 2 Hours (Free Hold)</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`tel:${reservationModal.phone}`}
                className="flex-1"
              >
                <Button variant="secondary" className="w-full text-sm h-10 rounded-[100px] text-[#393737] font-semibold font-sans">
                  <Phone className="h-4 w-4 mr-1.5 text-[#393737]" />
                  Call Store
                </Button>
              </a>
              <Button
                variant="default"
                className="flex-1 text-sm h-10 rounded-[100px] bg-[#393737] hover:bg-[#2b2929] text-white shadow-none font-semibold border-0 font-sans"
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
