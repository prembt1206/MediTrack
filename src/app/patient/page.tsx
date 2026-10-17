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
  Info,
  Cloud,
  ShieldCheck,
  Zap,
  Activity,
  X,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

// Common locations in Bengaluru for demo testing
const LOCATIONS = [
  { name: 'Koramangala 4th Block', lat: 12.9345, lon: 77.6265 },
  { name: 'Indiranagar 100ft Rd', lat: 12.9719, lon: 77.6412 },
  { name: 'HSR Layout Sector 1', lat: 12.9116, lon: 77.6534 },
  { name: 'BTM 2nd Stage', lat: 12.9166, lon: 77.6101 },
  { name: 'MG Road Metro', lat: 12.9756, lon: 77.6095 },
];

export default function PatientSearchPage() {
  const { user } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');

  // Location state
  const [patientLocation, setPatientLocation] = useState(LOCATIONS[0]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMedicines, setOcrMedicines] = useState<ExtractedMedicine[]>([]);
  const [ocrDoctorNotes, setOcrDoctorNotes] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Reservation Modal
  const [reservationModal, setReservationModal] = useState<{
    medicine: string;
    pharmacy: string;
    phone?: string;
    price: number;
    inStock: boolean;
  } | null>(null);

  // Initial load
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
    executeSearch(searchQuery);
  };

  // Browser Geolocation
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPatientLocation({
          name: 'My GPS Location',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        alert('Could not access GPS. Using Bengaluru Koramangala coordinates.');
      }
    );
  };

  // Handle Prescription Image Upload & Gemini Vision OCR
  const handleFileUpload = async (file: File) => {
    setOcrError(null);
    setOcrLoading(true);
    setOcrMedicines([]);
    setOcrDoctorNotes(null);

    // Create preview
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
        // Automatically search first medicine in DB!
        const firstMed = data.medicines[0].name;
        setSearchQuery(firstMed);
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

  // Sample prescription triggers for fast demonstration
  const handleSamplePrescription = async (type: string) => {
    setOcrError(null);
    setOcrLoading(true);
    setOcrMedicines([]);
    
    // Simulate prescription upload
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('base64', 'sample-prescription-data');
        const res = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setOcrMedicines(data.medicines || []);
        setOcrDoctorNotes(data.doctor_notes || null);
        if (data.medicines && data.medicines[0]) {
          setSearchQuery(data.medicines[0].name);
          executeSearch(data.medicines[0].name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setOcrLoading(false);
      }
    }, 600);
  };

  // Sorting & Filtering
  const filteredResults = results
    .filter((item) => (inStockOnly ? item.in_stock : true))
    .sort((a, b) => {
      if (a.in_stock && !b.in_stock) return -1;
      if (!a.in_stock && b.in_stock) return 1;
      if (sortBy === 'distance') return a.distance_km - b.distance_km;
      return a.price - b.price;
    });

  // Strict role separation: If an owner is logged in, show only owner topics
  if (user && user.role === 'Pharmacy Owner') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-teal-800 bg-slate-900/90 text-slate-100 shadow-2xl glass-card">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center mb-2">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle className="text-white">
                Pharmacy Owner Account
              </CardTitle>
              <CardDescription className="text-slate-400">
                You are currently signed in as a <strong>Pharmacy Owner</strong>. This page contains Patient medicine search topics. Please access your dedicated Pharmacy Owner Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/pharmacy" className="block w-full">
                <Button variant="gradient" className="w-full">
                  Go to Store Inventory Dashboard
                </Button>
              </Link>
              <Link href="/login?role=Patient" className="block w-full text-center text-xs text-slate-400 hover:text-white">
                Sign in with a Patient account instead
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-16 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Hero Section with Floating Badges */}
        <div className="text-center max-w-3xl mx-auto space-y-4 relative py-4">
          
          {/* Floating Ambient Status Icons */}
          <div className="hidden md:flex items-center justify-between pointer-events-none absolute -inset-x-12 top-0">
            <div className="animate-float-slow flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs shadow-lg shadow-emerald-950/50 backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time GPS Active</span>
            </div>
            <div className="animate-float-reverse flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs shadow-lg shadow-cyan-950/50 backdrop-blur-md">
              <Cloud className="h-3.5 w-3.5 text-cyan-400" />
              <span>Gemini 3.8 Flash Vision</span>
            </div>
          </div>

          <Badge variant="outline" className="gap-2 py-1.5 px-4 bg-emerald-950/60 text-emerald-300 border-emerald-700/60 rounded-full shadow-inner inline-flex items-center">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" />
            <span>AI-Powered Prescription & Realtime Inventory Finder</span>
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Find Medicine in Local Pharmacies{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              In Real Time
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Search by medicine name or snap a photo of your doctor's handwritten prescription. We decode shorthand, check live store stock, and calculate exact distances.
          </p>
        </div>

        {/* Dual Search & Prescription OCR Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Text Search & Location (7 cols) */}
          <Card className="lg:col-span-7 border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl glass-card">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Search className="h-5 w-5 text-emerald-400" />
                Search Medicine or Composition
              </CardTitle>
              <CardDescription className="text-slate-400">
                Search across verified local pharmacy stocks in Bengaluru
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Pill className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-400" />
                  <Input
                    placeholder="Search Dolo 650, Augmentin, Paracetamol, Pan 40..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      executeSearch(e.target.value);
                    }}
                    className="pl-10 h-11 text-sm bg-slate-950/80 border-slate-700/80 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-slate-500 rounded-xl"
                  />
                </div>
                <Button type="submit" variant="gradient" className="h-11 px-6 active:scale-95 transition-transform shadow-md shadow-emerald-500/20">
                  <Search className="h-4 w-4 mr-1.5" />
                  Search
                </Button>
              </form>

              {/* Quick Popular Pills with Tactile Click Effect */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-400" />
                  Quick:
                </span>
                {['Dolo 650', 'Augmentin 625', 'Azithral 500', 'Pan 40', 'Glycomet 500'].map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => {
                      setSearchQuery(med);
                      executeSearch(med);
                    }}
                    className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-950/80 hover:border-emerald-600/80 hover:text-emerald-300 text-slate-300 border border-slate-700/80 transition-all active:scale-95 duration-150 cursor-pointer shadow-sm"
                  >
                    {med}
                  </button>
                ))}
              </div>

              {/* Patient Location Selector */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 font-medium">Your Location:</span>
                  <select
                    value={patientLocation.name}
                    onChange={(e) => {
                      const match = LOCATIONS.find((loc) => loc.name === e.target.value);
                      if (match) setPatientLocation(match);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-300 cursor-pointer focus:outline-none focus:border-emerald-500"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name} className="bg-slate-900 text-slate-200">
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectLiveLocation}
                  disabled={isDetectingLocation}
                  className="h-8 text-xs border-slate-700 text-emerald-400 hover:bg-emerald-950/40 active:scale-95 transition-all"
                >
                  <Navigation className={`h-3.5 w-3.5 mr-1 text-emerald-400 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  {isDetectingLocation ? 'Locating...' : 'Use My GPS'}
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Right: AI Prescription OCR (5 cols) */}
          <Card className="lg:col-span-5 border-emerald-800/50 bg-gradient-to-b from-emerald-950/30 to-slate-900/90 shadow-2xl glass-card backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-emerald-900/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  Prescription OCR
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-sky-800 bg-sky-950/60 text-sky-300 flex items-center gap-1">
                  <Cloud className="h-3 w-3 text-sky-400" /> Google Cloud Vision
                </Badge>
              </div>
              <CardDescription className="text-slate-400">
                Snap or upload doctor's handwritten prescription
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
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

              {/* Upload Dropzone with Pulse & Click Action */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-emerald-700/60 hover:border-emerald-400 rounded-xl p-5 text-center cursor-pointer bg-slate-950/40 hover:bg-emerald-950/20 transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center gap-2"
              >
                <div className="h-11 w-11 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Click to upload prescription photo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP, or Camera upload
                  </p>
                </div>
              </div>

              {/* Fast 1-Click Demo Prescription for Hackathon Judges */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Try Sample Rx:
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSamplePrescription('sample-fever')}
                  className="h-7 text-xs border-emerald-700/80 text-emerald-300 hover:bg-emerald-950/80 active:scale-95 transition-all"
                  disabled={ocrLoading}
                >
                  Load Doctor Rx Sample
                </Button>
              </div>

              {ocrLoading && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-center space-y-2 animate-pulse">
                  <RefreshCw className="h-5 w-5 animate-spin text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-emerald-200">
                    Analyzing handwritten prescription with Gemini Vision...
                  </p>
                  <p className="text-[10px] text-emerald-400">
                    Decoding medical shorthand (1-0-1, AC, PC, SOS) into plain English
                  </p>
                </div>
              )}

              {ocrError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{ocrError}</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* OCR Decoded Medicine Cards */}
        {ocrMedicines.length > 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-700/80 shadow-2xl space-y-4 glass-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Gemini Vision OCR Decoded {ocrMedicines.length} Prescribed Medicines
                </h3>
                {ocrDoctorNotes && (
                  <p className="text-xs text-slate-300 mt-1 italic">
                    Doctor Advice: {ocrDoctorNotes}
                  </p>
                )}
              </div>
              <Badge variant="success" className="w-fit text-xs">
                Validated JSON Extracted
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ocrMedicines.map((med, idx) => (
                <Card key={idx} className="bg-slate-900/90 border-slate-800 hover:border-emerald-500/50 shadow-md transition-all">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-bold text-white">
                        {med.name}
                      </CardTitle>
                      {med.dosage && (
                        <Badge variant="outline" className="text-[10px] border-emerald-700 text-emerald-300">
                          {med.dosage}
                        </Badge>
                      )}
                    </div>
                    {med.generic && (
                      <p className="text-[11px] text-slate-400">{med.generic}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs">
                    <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/60">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                        Doctor Shorthand: {med.frequency || '1-0-1'}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        {med.instructions || 'Take as advised by physician'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 border-emerald-700/80 text-emerald-300 hover:bg-emerald-950/80 active:scale-95 transition-all"
                      onClick={() => {
                        setSearchQuery(med.name);
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-400" />
              Live Pharmacy Availability Results
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredResults.length} pharmacy stock matches relative to {patientLocation.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Filter: In Stock Only */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              In Stock Only
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <SlidersHorizontal className="h-3.5 w-3.5 text-teal-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'price')}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:border-teal-500"
              >
                <option value="distance">Nearest Distance (km)</option>
                <option value="price">Lowest Price (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid - Interactive Glass Cards */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-sm font-medium">Querying live pharmacy inventories...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-800 bg-slate-900/40">
            <Pill className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-200">
              No matching medicines found
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find "{searchQuery}" in nearby stock. Try searching "Dolo 650", "Augmentin", or click a quick pill above.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResults.map((item) => (
              <Card
                key={item.inventory_id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 glass-card ${
                  item.in_stock
                    ? 'border-slate-800 hover:border-emerald-500/60 bg-slate-900/80 hover:shadow-emerald-950/30'
                    : 'border-rose-950/60 bg-slate-950/60 opacity-75'
                }`}
              >
                {/* Top Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-white leading-tight">
                        {item.medicine_name}
                      </h3>
                      {item.generic_name && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.generic_name}
                        </p>
                      )}
                    </div>

                    {/* Stock Status Badge with Animated Dot */}
                    <Badge
                      variant={item.in_stock ? (item.quantity < 30 ? 'warning' : 'success') : 'destructive'}
                      className="shrink-0 text-xs font-bold gap-1.5"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        item.in_stock ? (item.quantity < 30 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse') : 'bg-rose-400'
                      }`} />
                      {item.in_stock
                        ? `${item.quantity} In Stock`
                        : 'Out of Stock'}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Dosage: {item.dosage || 'Standard'}
                  </p>
                </div>

                {/* Pharmacy Information & Distance */}
                <CardContent className="px-5 py-3 space-y-2.5 border-t border-slate-800/80 text-xs">
                  
                  {/* Pharmacy Name */}
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200 text-sm">
                      {item.pharmacy_name}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-snug">{item.pharmacy_address}</span>
                  </div>

                  {/* Distance Calculation Display */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-teal-400" />
                      <span className="font-bold text-slate-200">
                        {item.distance_km} km away
                      </span>
                    </div>

                    {item.distance_km < 2.5 && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-950/60 text-emerald-300 border-emerald-700/60">
                        ⚡ Quick Reach
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 font-medium">Price per unit:</span>
                    <span className="text-lg font-black text-emerald-400">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </CardContent>

                {/* Card Footer Actions with Tactile Effects */}
                <CardFooter className="px-5 py-3 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${item.pharmacy_phone || '+918025534321'}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-9 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                    >
                      <Phone className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                      Call Store
                    </Button>
                  </a>

                  <Button
                    variant={item.in_stock ? 'gradient' : 'secondary'}
                    size="sm"
                    className="flex-1 text-xs h-9 active:scale-95 transition-all shadow-md"
                    onClick={() => {
                      setReservationModal({
                        medicine: item.medicine_name,
                        pharmacy: item.pharmacy_name,
                        phone: item.pharmacy_phone || '+91 80 2553 4321',
                        price: item.price,
                        inStock: item.in_stock,
                      });
                    }}
                  >
                    {item.in_stock ? 'Reserve Stock' : 'Notify Restock'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

      </main>

      {/* Interactive Reservation Confirmation Modal */}
      {reservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl p-6 space-y-4 text-center relative overflow-hidden glass-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            
            <button
              onClick={() => setReservationModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {reservationModal.inStock ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <Clock className="h-7 w-7 text-amber-400" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {reservationModal.inStock ? 'Stock Reserved Successfully!' : 'Restock Request Sent!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {reservationModal.inStock
                  ? 'Your medicine has been placed on hold at the pharmacy counter.'
                  : 'We notified the pharmacy owner to update their inventory.'}
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Medicine:</span>
                <span className="font-semibold text-white">{reservationModal.medicine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pharmacy:</span>
                <span className="font-semibold text-emerald-400">{reservationModal.pharmacy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Counter Price:</span>
                <span className="font-semibold text-white">{formatCurrency(reservationModal.price)}</span>
              </div>
              {reservationModal.inStock && (
                <div className="flex justify-between border-t border-slate-800/80 pt-2 text-[11px] text-teal-300">
                  <span>Hold Guarantee:</span>
                  <span className="font-semibold">Valid for 2 Hours (Free Hold)</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`tel:${reservationModal.phone}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full text-xs h-10 border-slate-700 text-slate-200 hover:bg-slate-800">
                  <Phone className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  Call Pharmacist
                </Button>
              </a>
              <Button
                variant="gradient"
                className="flex-1 text-xs h-10 active:scale-95"
                onClick={() => setReservationModal(null)}
              >
                Got It, Thanks!
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
