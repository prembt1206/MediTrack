'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase/data-service';
import { InventoryItem, Pharmacy } from '@/types/database';
import { formatCurrency, formatDate, toValidUUID } from '@/lib/utils';
import { DEMO_UUIDS } from '@/lib/supabase/mock-data';
import { Navbar } from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Store,
  PlusCircle,
  Package,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Search,
  Sparkles,
  RefreshCw,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PharmacyDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState('');

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load pharmacy and inventory
  useEffect(() => {
    async function fetchPharmacyData() {
      if (!user) return;
      setLoading(true);
      try {
        let pharm = await dataService.getPharmacyByOwner(user.id);
        if (!pharm) {
          pharm = await dataService.createOrUpdatePharmacy({
            owner_id: user.id,
            name: `${user.fullName}'s Pharmacy`,
            address: '80 Feet Road, 4th Block, Koramangala, Bengaluru',
            latitude: 12.9345,
            longitude: 77.6265,
            phone: '+91 80 2553 4321',
            license_number: 'KA-BLR-' + Math.floor(100000 + Math.random() * 900000),
            opening_hours: '24 Hours Open',
          });
        }
        setPharmacy(pharm);

        if (pharm) {
          const items = await dataService.getPharmacyInventory(pharm.id);
          setInventory(items);
        }
      } catch (err) {
        console.error('Error fetching pharmacy inventory:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchPharmacyData();
    }
  }, [user, authLoading]);

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy) return;

    setFormError(null);
    setFormSuccess(null);

    const qtyNum = parseInt(quantity, 10);
    const priceNum = parseFloat(price);

    if (!medicineName.trim()) {
      setFormError('Please enter a medicine name.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      setFormError('Please enter a valid non-negative quantity.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Please enter a valid price in INR.');
      return;
    }
    if (!expiryDate) {
      setFormError('Please select a valid expiry date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const validPharmId = toValidUUID(pharmacy.id, DEMO_UUIDS.PHARM_APOLLO);
      const newItem = await dataService.addInventoryItem({
        pharmacy_id: validPharmId,
        medicine_name: medicineName.trim(),
        generic_name: genericName.trim() || null,
        dosage: dosage.trim() || 'Standard dose',
        quantity: qtyNum,
        price: priceNum,
        expiry_date: expiryDate,
      });

      setInventory((prev) => [newItem, ...prev]);
      setFormSuccess(`Added "${newItem.medicine_name}" to your inventory!`);

      // Reset form
      setMedicineName('');
      setGenericName('');
      setDosage('');
      setQuantity('');
      setPrice('');
      setExpiryDate('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add item to inventory.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Preset Helper for Demo
  const applyPreset = (name: string, generic: string, dose: string, qty: number, pr: number) => {
    setMedicineName(name);
    setGenericName(generic);
    setDosage(dose);
    setQuantity(qty.toString());
    setPrice(pr.toString());
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  // Quick Quantity Update (+10 / -10)
  const handleAdjustQuantity = async (item: InventoryItem, delta: number) => {
    setActionLoadingId(item.id);
    try {
      const newQty = Math.max(0, item.quantity + delta);
      const updated = await dataService.updateInventoryItem(item.id, { quantity: newQty });
      setInventory((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item from your inventory?')) return;
    setActionLoadingId(itemId);
    try {
      await dataService.deleteInventoryItem(itemId);
      setInventory((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered inventory based on search query
  const filteredInventory = inventory.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.medicine_name.toLowerCase().includes(q) ||
      (item.generic_name && item.generic_name.toLowerCase().includes(q))
    );
  });

  // KPI calculations
  const totalSKUs = inventory.length;
  const totalUnits = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = inventory.filter((item) => item.quantity > 0 && item.quantity < 30).length;
  const outOfStockCount = inventory.filter((item) => item.quantity === 0).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#171721] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-[#ededf3]" />
          <p className="text-sm font-normal text-[#c3c3cc]">Loading Pharmacy Portal...</p>
        </div>
      </div>
    );
  }

  // Role Gate check
  if (user && user.role !== 'Pharmacy Owner') {
    return (
      <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full rounded-[12px] border border-[#70707d]/30 bg-[#1e1e2a] p-8 space-y-6 text-center shadow-none">
            <div className="h-12 w-12 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-[#c3c3cc]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[#ededf3] tracking-[0.015em]">
                Pharmacy Owner Access Required
              </h2>
              <p className="text-xs text-[#c3c3cc] mt-2 leading-relaxed font-normal">
                You are currently logged in as a <strong className="text-[#ededf3] font-normal">{user.role}</strong>. This dashboard is restricted to verified pharmacy owners with Row Level Security.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Link href="/patient" className="block w-full">
                <Button variant="default" className="w-full rounded-full bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none font-normal">
                  Return to Patient Medicine Search
                </Button>
              </Link>
              <Link href="/login?role=Pharmacy+Owner" className="block w-full text-center text-xs text-[#c3c3cc] hover:text-[#ededf3] transition-colors">
                Sign in with a Pharmacy Owner account
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col selection:bg-[#5266eb] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Pharmacy Profile Banner */}
        <div className="rounded-[12px] bg-[#1e1e2a] border border-[#70707d]/30 p-8 text-[#ededf3] relative overflow-hidden shadow-none">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-[#171721] text-[#c3c3cc] border-[#70707d]/30 text-[11px] py-0.5 px-3 rounded-full font-normal shadow-none">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-[#ededf3]" />
                  Verified Pharmacy Partner
                </Badge>
                <Badge variant="outline" className="border-[#70707d]/30 bg-[#171721] text-[#c3c3cc] text-[11px] py-0.5 px-3 rounded-full font-normal shadow-none">
                  Supabase RLS Enabled
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-medium tracking-[0.015em] text-[#ededf3]">
                {pharmacy?.name || 'Apollo Pharmacy - Koramangala'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#c3c3cc] pt-1 font-normal">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#c3c3cc]" />
                  {pharmacy?.address || 'Koramangala 4th Block, Bengaluru'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-[#c3c3cc]" />
                  {pharmacy?.phone || '+91 80 2553 4321'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-[#c3c3cc]" />
                  License: {pharmacy?.license_number || 'KA-B1-102934'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right bg-[#171721] px-4 py-2.5 rounded-[8px] border border-[#70707d]/30">
                <p className="text-[11px] uppercase tracking-wider text-[#c3c3cc] font-normal">Live Operating Status</p>
                <p className="text-sm font-normal text-[#ededf3] flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-[#ededf3]" />
                  {pharmacy?.opening_hours || '24 Hours Open'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-[12px] p-8 flex items-center justify-between border border-[#70707d]/30 bg-[#1e1e2a] hover:border-[#70707d]/50 transition-colors shadow-none">
            <div>
              <p className="text-xs font-normal text-[#c3c3cc] uppercase tracking-wider">Total SKUs</p>
              <h3 className="text-2xl sm:text-3xl font-medium text-[#ededf3] tracking-[0.015em] mt-1">{totalSKUs}</h3>
              <p className="text-[11px] text-[#c3c3cc] mt-0.5 font-normal">Cataloged medicines</p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-[12px] p-8 flex items-center justify-between border border-[#70707d]/30 bg-[#1e1e2a] hover:border-[#70707d]/50 transition-colors shadow-none">
            <div>
              <p className="text-xs font-normal text-[#c3c3cc] uppercase tracking-wider">Total Units</p>
              <h3 className="text-2xl sm:text-3xl font-medium text-[#ededf3] tracking-[0.015em] mt-1">{totalUnits}</h3>
              <p className="text-[11px] text-[#c3c3cc] mt-0.5 font-normal">In physical stock</p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-[12px] p-8 flex items-center justify-between border border-[#70707d]/30 bg-[#1e1e2a] hover:border-[#70707d]/50 transition-colors shadow-none">
            <div>
              <p className="text-xs font-normal text-[#c3c3cc] uppercase tracking-wider">Low Stock</p>
              <h3 className="text-2xl sm:text-3xl font-medium text-[#ededf3] tracking-[0.015em] mt-1">{lowStockCount}</h3>
              <p className="text-[11px] text-[#c3c3cc] mt-0.5 font-normal">&lt; 30 units left</p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-[12px] p-8 flex items-center justify-between border border-[#70707d]/30 bg-[#1e1e2a] hover:border-[#70707d]/50 transition-colors shadow-none">
            <div>
              <p className="text-xs font-normal text-[#c3c3cc] uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-2xl sm:text-3xl font-medium text-[#ededf3] tracking-[0.015em] mt-1">{outOfStockCount}</h3>
              <p className="text-[11px] text-[#c3c3cc] mt-0.5 font-normal">Needs restock</p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Two-Column Section: Form to Add Stock + Fast Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Supply Form (Left column - 1/3) */}
          <Card className="rounded-[12px] border border-[#70707d]/30 bg-[#1e1e2a] overflow-hidden lg:col-span-1 h-fit shadow-none p-8">
            <CardHeader className="p-0 pb-4 border-b border-[#70707d]/25">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-[#c3c3cc]" />
                <CardTitle className="text-lg font-medium text-[#ededf3] tracking-[0.015em]">Add New Inventory</CardTitle>
              </div>
              <CardDescription className="text-xs text-[#c3c3cc] mt-1 font-normal">
                Sync medicine quantity, price, and expiry to live database.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-6 space-y-4">
              {/* Form Feedback Alerts */}
              {formSuccess && (
                <div className="p-3.5 rounded-[8px] bg-[#242432] border border-[#70707d]/40 text-[#ededf3] text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ededf3]" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="p-3.5 rounded-[8px] bg-[#242432] border border-[#70707d]/40 text-[#ededf3] text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#c3c3cc]" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Fast presets for hackathon demo with strict pill buttons */}
              <div>
                <label className="block text-[11px] font-normal uppercase text-[#c3c3cc] mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#c3c3cc]" />
                  Quick Fill Demo Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('Dolo 650', 'Paracetamol', '650mg tablet', 120, 32.5)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + Dolo 650
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Tazloc AM 40/5', 'Telmisartan + Amlodipine', '40mg / 5mg tablet', 85, 185.0)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + Tazloc AM 40/5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('TriAzulix DS-2', 'Glimepiride + Metformin + Pioglitazone', 'DS-2 (2mg + 500mg + 15mg)', 60, 240.0)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + TriAzulix DS-2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Istamet XR', 'Sitagliptin + Metformin Hydrochloride Extended Release', '100/1000mg tablet', 45, 310.0)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + Istamet XR
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Cap Pregalin', 'Pregabalin', '75mg capsule', 50, 215.0)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + Cap Pregalin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Mecobal SL 1500', 'Methylcobalamin (Mecobalamin)', '1500mcg sublingual tablet', 110, 165.0)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + Mecobal SL
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 50, 204.0)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + Augmentin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Pan 40', 'Pantoprazole', '40mg tablet', 90, 155.0)}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#171721] hover:bg-[#242432] border border-[#70707d]/30 text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer shadow-none font-normal"
                  >
                    + Pan 40
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-normal text-[#ededf3] mb-1.5">
                    Medicine Brand Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dolo 650, Azithral 500"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="bg-[#171721] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#ededf3] mb-1.5">
                    Generic / Active Formula
                  </label>
                  <Input
                    placeholder="e.g. Paracetamol, Azithromycin"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="bg-[#171721] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#ededf3] mb-1.5">
                    Dosage & Packaging
                  </label>
                  <Input
                    placeholder="e.g. 650mg tablet (Strip of 15)"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="bg-[#171721] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-normal text-[#ededf3] mb-1.5">
                      Quantity (Units) *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      placeholder="100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-[#171721] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-normal text-[#ededf3] mb-1.5">
                      Price (₹ INR) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="35.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-[#171721] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#ededf3] mb-1.5">
                    Expiry Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="bg-[#171721] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                  />
                </div>

                {/* Primary Conversion Button: Single Cobalt #5266eb CTA */}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full mt-3 h-11 rounded-full bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none font-normal"
                  disabled={isSubmitting}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving to Database...' : 'Add Medicine to Stock'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Stock Data Table (Right column - 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#c3c3cc]" />
                <Input
                  placeholder="Filter by medicine name or generic composition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-[#1e1e2a] border-[#70707d]/30 text-[#ededf3] placeholder:text-[#c3c3cc]/50 rounded-full focus:border-[#70707d]"
                />
              </div>

              <div className="text-xs text-[#c3c3cc] flex items-center gap-2 self-end sm:self-auto font-normal">
                <span>Showing {filteredInventory.length} of {inventory.length} items</span>
              </div>
            </div>

            {/* Flat Alpine Data Table */}
            <Card className="rounded-[12px] border border-[#70707d]/30 bg-[#1e1e2a] overflow-hidden shadow-none p-0">
              {loading ? (
                <div className="p-12 text-center text-[#c3c3cc] flex flex-col items-center gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-[#ededf3]" />
                  <p className="text-sm font-normal">Fetching your live stock from Supabase...</p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="p-12 text-center text-[#c3c3cc]">
                  <Package className="h-10 w-10 mx-auto text-[#70707d] mb-2" />
                  <h4 className="font-medium text-[#ededf3]">No medicines found</h4>
                  <p className="text-xs text-[#c3c3cc] mt-1 font-normal">
                    {searchQuery ? 'Try matching another name' : 'Add your first medicine using the form on the left'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#70707d]/25 hover:bg-transparent">
                      <TableHead className="text-[#c3c3cc] text-xs font-normal">Medicine & Composition</TableHead>
                      <TableHead className="text-[#c3c3cc] text-xs font-normal">Dosage</TableHead>
                      <TableHead className="text-[#c3c3cc] text-xs font-normal">Current Stock</TableHead>
                      <TableHead className="text-[#c3c3cc] text-xs font-normal">Price</TableHead>
                      <TableHead className="text-[#c3c3cc] text-xs font-normal">Expiry Date</TableHead>
                      <TableHead className="text-right text-[#c3c3cc] text-xs font-normal">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => {
                      const isLow = item.quantity > 0 && item.quantity < 30;
                      const isOut = item.quantity === 0;

                      return (
                        <TableRow key={item.id} className="border-b border-[#70707d]/20 hover:bg-[#242432]/60 transition-colors">
                          <TableCell className="font-normal">
                            <div className="text-sm font-medium text-[#ededf3]">
                              {item.medicine_name}
                            </div>
                            {item.generic_name && (
                              <div className="text-xs text-[#c3c3cc]">
                                {item.generic_name}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-[#c3c3cc]">
                            {item.dosage || 'Standard'}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal rounded-full border-[#70707d]/30 bg-[#171721] text-[#ededf3]"
                              >
                                {isOut ? '0 (Out)' : `${item.quantity} units`}
                              </Badge>

                              {/* Tactile Stock Adjustment Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustQuantity(item, -10)}
                                  disabled={actionLoadingId === item.id || item.quantity <= 0}
                                  title="Decrease 10 units"
                                  className="h-7 w-7 rounded-full bg-[#171721] hover:bg-[#242432] text-xs font-normal text-[#ededf3] border border-[#70707d]/30 flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer shadow-none"
                                >
                                  -10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustQuantity(item, 10)}
                                  disabled={actionLoadingId === item.id}
                                  title="Increase 10 units"
                                  className="h-7 w-7 rounded-full bg-[#171721] hover:bg-[#242432] text-xs font-normal text-[#ededf3] border border-[#70707d]/30 flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer shadow-none"
                                >
                                  +10
                                </button>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-normal text-[#ededf3]">
                            {formatCurrency(Number(item.price))}
                          </TableCell>

                          <TableCell className="text-xs text-[#c3c3cc]">
                            {formatDate(item.expiry_date)}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={actionLoadingId === item.id}
                              className="text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#171721] h-8 w-8 p-0 rounded-full transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>

          </div>
        </div>

      </main>
    </div>
  );
}
