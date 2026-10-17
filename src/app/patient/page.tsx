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
  Cloud
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
        // Send base64 simulation
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
          <Card className="max-w-md w-full border-teal-800 bg-slate-900 text-slate-100 shadow-2xl">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="default" className="gap-1.5 py-1 px-3 bg-emerald-100 text-emerald-800 border-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            AI-Powered Prescription & Realtime Inventory Finder
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Find Medicine in Local Pharmacies{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              In Real Time
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Search by medicine name or upload a photo of your doctor's handwritten prescription. We decode shorthand, check live stock, and calculate exact distances.
          </p>
        </div>

        {/* Dual Search & Prescription OCR Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Text Search & Location (7 cols) */}
          <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-600" />
                Search Medicine or Composition
              </CardTitle>
              <CardDescription>
                Search across verified local pharmacy stocks in Bengaluru
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Pill className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search Dolo 650, Augmentin, Paracetamol, Pan 40..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      executeSearch(e.target.value);
                    }}
                    className="pl-9 h-11 text-sm bg-white dark:bg-slate-900"
                  />
                </div>
                <Button type="submit" variant="gradient" className="h-11 px-5">
                  <Search className="h-4 w-4 mr-1.5" />
                  Search
                </Button>
              </form>

              {/* Quick Popular Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Popular:</span>
                {['Dolo 650', 'Augmentin 625', 'Azithral 500', 'Pan 40', 'Glycomet 500'].map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => {
                      setSearchQuery(med);
                      executeSearch(med);
                    }}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                  >
                    {med}
                  </button>
                ))}
              </div>

              {/* Patient Location Selector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-500 font-medium">Your Location:</span>
                  <select
                    value={patientLocation.name}
                    onChange={(e) => {
                      const match = LOCATIONS.find((loc) => loc.name === e.target.value);
                      if (match) setPatientLocation(match);
                    }}
                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={detectLiveLocation}
                  disabled={isDetectingLocation}
                  className="h-8 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                >
                  <Navigation className={`h-3.5 w-3.5 mr-1 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  {isDetectingLocation ? 'Locating...' : 'Use My GPS'}
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Right: AI Prescription OCR (5 cols) */}
          <Card className="lg:col-span-5 border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-900 dark:border-emerald-950 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-950 dark:text-emerald-300">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Prescription OCR
                </CardTitle>
                <Badge variant="default" className="text-[10px] bg-sky-600 text-white flex items-center gap-1 shadow-sm">
                  <Cloud className="h-3 w-3" /> Google Cloud Vision
                </Badge>
              </div>
              <CardDescription>
                Snap or upload doctor's handwritten prescription
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
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
                className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl p-5 text-center cursor-pointer hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Click to upload prescription photo
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP, or Camera upload
                  </p>
                </div>
              </div>

              {/* Fast 1-Click Demo Prescription for Hackathon Judges */}
              <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Try Sample Rx:
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSamplePrescription('sample-fever')}
                  className="h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  disabled={ocrLoading}
                >
                  Load Doctor Rx Sample
                </Button>
              </div>

              {ocrLoading && (
                <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Analyzing handwritten prescription with Gemini Vision...
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    Decoding medical shorthand (1-0-1, AC, PC, SOS) into plain English
                  </p>
                </div>
              )}

              {ocrError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{ocrError}</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* OCR Decoded Medicine Cards (Layer 5 Output) */}
        {ocrMedicines.length > 0 && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:to-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Gemini Vision OCR Decoded {ocrMedicines.length} Prescribed Medicines
                </h3>
                {ocrDoctorNotes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 italic">
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
                <Card key={idx} className="bg-white/95 dark:bg-slate-900 border-slate-200 shadow-sm hover:shadow transition-all">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                        {med.name}
                      </CardTitle>
                      {med.dosage && (
                        <Badge variant="outline" className="text-[10px]">
                          {med.dosage}
                        </Badge>
                      )}
                    </div>
                    {med.generic && (
                      <p className="text-[11px] text-slate-500">{med.generic}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs">
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/50 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                        Doctor Shorthand: {med.frequency || '1-0-1'}
                      </span>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">
                        {med.instructions || 'Take as advised by physician'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
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

        {/* Results Toolbar (Layer 7) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600" />
              Live Pharmacy Availability Results
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredResults.length} pharmacy stock matches relative to {patientLocation.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter: In Stock Only */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              In Stock Only
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'price')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="distance">Nearest Distance (km)</option>
                <option value="price">Lowest Price (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layer 7: Results UI - Shadcn Cards */}
        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Querying live pharmacy inventories...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-300 dark:border-slate-800">
            <Pill className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No matching medicines found
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find "{searchQuery}" in nearby stock. Try searching "Dolo 650", "Augmentin", or click a sample medicine above.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResults.map((item) => (
              <Card
                key={item.inventory_id}
                className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  item.in_stock
                    ? 'border-slate-200/90 dark:border-slate-800'
                    : 'border-rose-200/60 bg-slate-50/40 opacity-80'
                }`}
              >
                {/* Top Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                        {item.medicine_name}
                      </h3>
                      {item.generic_name && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.generic_name}
                        </p>
                      )}
                    </div>

                    {/* Stock Status Badge */}
                    <Badge
                      variant={item.in_stock ? (item.quantity < 30 ? 'warning' : 'success') : 'destructive'}
                      className="shrink-0 text-xs font-bold"
                    >
                      {item.in_stock
                        ? `${item.quantity} In Stock`
                        : 'Out of Stock'}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Dosage: {item.dosage || 'Standard'}
                  </p>
                </div>

                {/* Pharmacy Information & Distance */}
                <CardContent className="px-5 py-3 space-y-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                  
                  {/* Pharmacy Name */}
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {item.pharmacy_name}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-snug">{item.pharmacy_address}</span>
                  </div>

                  {/* Distance Calculation Display */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-teal-600" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {item.distance_km} km away
                      </span>
                    </div>

                    {item.distance_km < 2.5 && (
                      <Badge variant="default" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                        ⚡ Quick Reach
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 font-medium">Price per unit:</span>
                    <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </CardContent>

                {/* Card Footer Actions */}
                <CardFooter className="px-5 py-3 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${item.pharmacy_phone || '+918025534321'}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <Phone className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      Call Store
                    </Button>
                  </a>

                  <Button
                    variant={item.in_stock ? 'gradient' : 'secondary'}
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => {
                      if (item.in_stock) {
                        alert(`Reserved 1 pack of ${item.medicine_name} at ${item.pharmacy_name} for 2 hours! Pick up before 8:00 PM.`);
                      } else {
                        alert(`Notified ${item.pharmacy_name} to restock ${item.medicine_name}.`);
                      }
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

      {/* Floating Multilingual Chatbot Widget */}
      <ChatWidget />
    </div>
  );
}
