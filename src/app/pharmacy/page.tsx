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
  AlertCircle,
  Edit2
} from 'lucide-react';
import Link from 'next/link';

export default function PharmacyDashboardPage() {
  const { user, loading: authLoading, switchDemoRole } = useAuth();

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
        // Fetch pharmacy for this owner or default to first pharmacy
        let pharm = await dataService.getPharmacyByOwner(user.id);
        if (!pharm) {
          // If no pharmacy found for this owner, create or link one for smooth UX
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
    // 1 year from now
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Pharmacy Portal...</p>
        </div>
      </div>
    );
  }

  // Role Gate check
  if (user && user.role !== 'Pharmacy Owner') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6" />
              </div>
              <CardTitle className="text-amber-900 dark:text-amber-200">
                Pharmacy Owner Access Required
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                You are currently logged in as a <strong>{user.role}</strong>. This dashboard is restricted to verified pharmacy owners with Row Level Security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patient" className="block w-full">
                <Button variant="gradient" className="w-full">
                  Return to Patient Medicine Search
                </Button>
              </Link>
              <Link href="/login?role=Pharmacy+Owner" className="block w-full text-center text-xs text-slate-400 hover:text-white">
                Sign in with a Pharmacy Owner account
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
      <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Pharmacy Profile Banner with Floating Badges */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-teal-700/60 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden glass-card">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          
          {/* Floating Badges */}
          <div className="hidden lg:flex items-center gap-3 absolute top-6 right-8 pointer-events-none">
            <div className="animate-float-slow flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/40 text-teal-300 text-xs shadow-lg backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Real-Time Catalog Sync</span>
            </div>
            <div className="animate-float-reverse flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs shadow-lg backdrop-blur-md">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Row-Level Security Active</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-950/60 text-emerald-300 border-emerald-700/80 text-[11px] py-0.5 px-2.5 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  Verified Pharmacy Partner
                </Badge>
                <Badge variant="outline" className="border-teal-700/80 bg-teal-950/60 text-teal-300 text-[11px] py-0.5 px-2.5 rounded-full">
                  Supabase RLS Enabled
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {pharmacy?.name || 'Apollo Pharmacy - Koramangala'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  {pharmacy?.address || 'Koramangala 4th Block, Bengaluru'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  {pharmacy?.phone || '+91 80 2553 4321'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-emerald-400" />
                  License: {pharmacy?.license_number || 'KA-B1-102934'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-inner">
                <p className="text-xs uppercase tracking-wider text-teal-300 font-semibold">Live Operating Status</p>
                <p className="text-sm font-bold text-white flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {pharmacy?.opening_hours || '24 Hours Open'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock KPI Summary Cards with Hover Lift */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-lg hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 glass-card">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total SKUs</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{totalSKUs}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Cataloged medicines</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Package className="h-6 w-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-lg hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-300 glass-card">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Units</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{totalUnits}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">In physical stock</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-teal-950/80 border border-teal-700/60 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-950/40">
              <TrendingUp className="h-6 w-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-lg hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 glass-card">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock</p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{lowStockCount}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">&lt; 30 units left</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-950/80 border border-amber-700/60 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-lg hover:border-rose-500/50 hover:-translate-y-1 transition-all duration-300 glass-card">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">{outOfStockCount}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Needs restock</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <AlertCircle className="h-6 w-6" />
            </div>
          </Card>
        </div>

        {/* Two-Column Section: Form to Add Stock + Fast Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Supply Form (Left column - 1/3) */}
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl glass-card lg:col-span-1 h-fit">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-lg text-white">Add New Inventory</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Sync medicine quantity, price, and expiry to live database.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Form Feedback Alerts */}
              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Fast presets for hackathon demo with Tactile Buttons */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  Quick Fill Demo Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('Dolo 650', 'Paracetamol', '650mg tablet', 120, 32.5)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-950/80 hover:border-emerald-600 border border-slate-700 text-slate-300 hover:text-emerald-300 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    + Dolo 650
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 50, 204.0)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-950/80 hover:border-emerald-600 border border-slate-700 text-slate-300 hover:text-emerald-300 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    + Augmentin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Pan 40', 'Pantoprazole', '40mg tablet', 90, 155.0)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-950/80 hover:border-emerald-600 border border-slate-700 text-slate-300 hover:text-emerald-300 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    + Pan 40
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Medicine Brand Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dolo 650, Azithral 500"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Generic / Active Formula
                  </label>
                  <Input
                    placeholder="e.g. Paracetamol, Azithromycin"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dosage & Packaging
                  </label>
                  <Input
                    placeholder="e.g. 650mg tablet (Strip of 15)"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Quantity (Units) *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      placeholder="100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      className="bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expiry Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full mt-3 h-11 active:scale-95 shadow-lg shadow-emerald-500/20"
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
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                <Input
                  placeholder="Filter by medicine name or generic composition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2 self-end sm:self-auto font-medium">
                <span>Showing {filteredInventory.length} of {inventory.length} items</span>
              </div>
            </div>

            {/* Glassmorphic Data Table */}
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl glass-card">
              {loading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                  <p className="text-sm">Fetching your live stock from Supabase...</p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Package className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                  <h4 className="font-semibold text-slate-200">No medicines found</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery ? 'Try matching another name' : 'Add your first medicine using the form on the left'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Medicine & Composition</TableHead>
                      <TableHead className="text-slate-400">Dosage</TableHead>
                      <TableHead className="text-slate-400">Current Stock</TableHead>
                      <TableHead className="text-slate-400">Price</TableHead>
                      <TableHead className="text-slate-400">Expiry Date</TableHead>
                      <TableHead className="text-right text-slate-400">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => {
                      const isLow = item.quantity > 0 && item.quantity < 30;
                      const isOut = item.quantity === 0;

                      return (
                        <TableRow key={item.id} className="border-slate-800/80 hover:bg-slate-850/60 transition-colors">
                          <TableCell className="font-medium">
                            <div className="text-sm font-bold text-white">
                              {item.medicine_name}
                            </div>
                            {item.generic_name && (
                              <div className="text-xs text-slate-400">
                                {item.generic_name}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-slate-300">
                            {item.dosage || 'Standard'}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={isOut ? 'destructive' : isLow ? 'warning' : 'success'}
                                className="text-xs font-semibold"
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
                                  className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer"
                                >
                                  -10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustQuantity(item, 10)}
                                  disabled={actionLoadingId === item.id}
                                  title="Increase 10 units"
                                  className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-slate-700 flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer"
                                >
                                  +10
                                </button>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-bold text-emerald-400">
                            {formatCurrency(Number(item.price))}
                          </TableCell>

                          <TableCell className="text-xs text-slate-300">
                            {formatDate(item.expiry_date)}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={actionLoadingId === item.id}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 h-8 w-8 p-0 rounded-lg active:scale-90 transition-all"
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
