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
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-[#393737]" />
          <p className="text-base font-normal text-[#888787]">Loading Pharmacy Portal...</p>
        </div>
      </div>
    );
  }

  // Role Gate check
  if (user && user.role !== 'Pharmacy Owner') {
    return (
      <div className="min-h-screen bg-[#f7f7f7] text-[#393737] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full rounded-[15px] p-[24px] bg-[#ffffff] border border-[#393737]/8 space-y-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="h-12 w-12 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <AlertCircle className="h-6 w-6 text-[#393737]" />
            </div>
            <div>
              <h2 className="text-[22px] font-serif font-normal text-[#393737] tracking-[-0.55px] leading-[1.2]">
                Pharmacy Owner Access Required
              </h2>
              <p className="text-base text-[#888787] mt-2 leading-[1.5] font-normal font-sans">
                You are currently logged in as a <strong className="text-[#393737] font-semibold">{user.role}</strong>. This dashboard is restricted to verified pharmacy owners with Row Level Security.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Link href="/patient" className="block w-full">
                <Button variant="default" className="w-full rounded-[100px] bg-[#393737] hover:bg-[#2b2929] text-white shadow-none font-semibold border-0 text-base font-sans">
                  Return to Patient Medicine Search
                </Button>
              </Link>
              <Link href="/login?role=Pharmacy+Owner" className="block w-full text-center text-sm text-[#888787] hover:text-[#393737] transition-colors font-sans">
                Sign in with a Pharmacy Owner account
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#393737] flex flex-col selection:bg-[#393737] selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-[72px] sm:py-[96px] space-y-[72px] sm:space-y-[96px]">
        
        {/* Pharmacy Profile Banner: Paper White Card */}
        <div className="rounded-[15px] bg-[#ffffff] border border-[#393737]/8 p-[24px] sm:p-[32px] text-[#393737] relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="secondary" className="bg-[#f7f7f7] text-[#393737] border border-[#393737]/15 text-[11px] py-1 px-3.5 rounded-[100px] font-sans shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-[#393737]" />
                  Verified Pharmacy Partner
                </Badge>
                <Badge variant="secondary" className="border border-[#393737]/15 bg-[#f7f7f7] text-[#393737] text-[11px] py-1 px-3.5 rounded-[100px] font-sans shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  Supabase RLS Enabled
                </Badge>
              </div>

              <h1 className="text-[32px] sm:text-[40px] font-serif font-normal tracking-[-1px] leading-[1.2] text-[#393737]">
                {pharmacy?.name || 'Apollo Pharmacy - Koramangala'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#888787] pt-1 font-normal font-sans">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#393737]" />
                  {pharmacy?.address || 'Koramangala 4th Block, Bengaluru'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-[#393737]" />
                  {pharmacy?.phone || '+91 80 2553 4321'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-[#393737]" />
                  License: {pharmacy?.license_number || 'KA-B1-102934'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right bg-[#f7f7f7] border border-[#393737]/10 px-5 py-3 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <p className="text-[11px] uppercase tracking-wider text-[#888787] font-sans">Live Operating Status</p>
                <p className="text-sm font-semibold text-[#393737] flex items-center justify-end gap-1.5 mt-0.5 font-sans">
                  <span className="h-2 w-2 rounded-full bg-[#393737]" />
                  {pharmacy?.opening_hours || '24 Hours Open'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-[12px] p-[24px] flex items-center justify-between bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div>
              <p className="text-[11px] font-sans text-[#888787] uppercase tracking-wider">Total SKUs</p>
              <h3 className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2] mt-1">{totalSKUs}</h3>
              <p className="text-xs text-[#888787] mt-0.5 font-normal font-sans">Cataloged medicines</p>
            </div>
            <div className="h-12 w-12 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <Package className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-[12px] p-[24px] flex items-center justify-between bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div>
              <p className="text-[11px] font-sans text-[#888787] uppercase tracking-wider">Total Units</p>
              <h3 className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2] mt-1">{totalUnits}</h3>
              <p className="text-xs text-[#888787] mt-0.5 font-normal font-sans">In physical stock</p>
            </div>
            <div className="h-12 w-12 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-[12px] p-[24px] flex items-center justify-between bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div>
              <p className="text-[11px] font-sans text-[#888787] uppercase tracking-wider">Low Stock</p>
              <h3 className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2] mt-1">{lowStockCount}</h3>
              <p className="text-xs text-[#888787] mt-0.5 font-normal font-sans">&lt; 30 units left</p>
            </div>
            <div className="h-12 w-12 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-[12px] p-[24px] flex items-center justify-between bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div>
              <p className="text-[11px] font-sans text-[#888787] uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2] mt-1">{outOfStockCount}</h3>
              <p className="text-xs text-[#888787] mt-0.5 font-normal font-sans">Needs restock</p>
            </div>
            <div className="h-12 w-12 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <AlertCircle className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Two-Column Section: Form to Add Stock + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Supply Form (Left column - 1/3): Paper White Card */}
          <Card className="rounded-[12px] bg-[#ffffff] border border-[#393737]/8 overflow-hidden lg:col-span-1 h-fit shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-[24px]">
            <CardHeader className="p-0 pb-4 border-b border-[#393737]/10">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-[#393737]" />
                <CardTitle className="text-[22px] font-serif font-normal text-[#393737] leading-[1.2] tracking-[-0.55px]">Add New Inventory</CardTitle>
              </div>
              <CardDescription className="text-xs text-[#888787] mt-1 font-normal font-sans">
                Sync medicine quantity, price, and expiry to live database.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-6 space-y-4">
              {formSuccess && (
                <div className="p-3.5 rounded-[12px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] text-xs flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#393737]" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="p-3.5 rounded-[12px] bg-[#ffffff] border border-[#393737]/20 text-[#393737] text-xs flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#393737]" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Fast Presets: Paper White Pills */}
              <div>
                <label className="block text-[11px] font-sans uppercase text-[#888787] tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#393737]" />
                  Quick Fill Demo Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('Dolo 650', 'Paracetamol', '650mg tablet', 120, 32.5)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + Dolo 650
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Tazloc AM 40/5', 'Telmisartan + Amlodipine', '40mg / 5mg tablet', 85, 185.0)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + Tazloc AM 40/5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('TriAzulix DS-2', 'Glimepiride + Metformin + Pioglitazone', 'DS-2 (2mg + 500mg + 15mg)', 60, 240.0)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + TriAzulix DS-2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Istamet XR', 'Sitagliptin + Metformin Hydrochloride Extended Release', '100/1000mg tablet', 45, 310.0)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + Istamet XR
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Cap Pregalin', 'Pregabalin', '75mg capsule', 50, 215.0)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + Cap Pregalin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Mecobal SL 1500', 'Methylcobalamin (Mecobalamin)', '1500mcg sublingual tablet', 110, 165.0)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + Mecobal SL
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '625mg tablet', 50, 204.0)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + Augmentin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Pan 40', 'Pantoprazole', '40mg tablet', 90, 155.0)}
                    className="text-[11px] px-3.5 py-1.5 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  >
                    + Pan 40
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3.5 pt-1 font-sans">
                <div>
                  <label className="block text-xs font-normal text-[#393737] mb-1.5 font-sans">
                    Medicine Brand Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dolo 650, Azithral 500"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="bg-[#f7f7f7] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#393737] mb-1.5 font-sans">
                    Generic / Active Formula
                  </label>
                  <Input
                    placeholder="e.g. Paracetamol, Azithromycin"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="bg-[#f7f7f7] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#393737] mb-1.5 font-sans">
                    Dosage & Packaging
                  </label>
                  <Input
                    placeholder="e.g. 650mg tablet (Strip of 15)"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="bg-[#f7f7f7] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-normal text-[#393737] mb-1.5 font-sans">
                      Quantity (Units) *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      placeholder="100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-[#f7f7f7] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-normal text-[#393737] mb-1.5 font-sans">
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
                      className="bg-[#f7f7f7] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#393737] mb-1.5 font-sans">
                    Expiry Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="bg-[#f7f7f7] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                  />
                </div>

                {/* Primary Pill CTA Button: Warm Graphite #393737 */}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full mt-3 h-11 rounded-[100px] bg-[#393737] hover:bg-[#2b2929] text-white shadow-none font-semibold border-0 text-base font-sans"
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
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#888787]" />
                <Input
                  placeholder="Filter by medicine name or generic composition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 bg-[#ffffff] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                />
              </div>

              <div className="text-xs text-[#888787] flex items-center gap-2 self-end sm:self-auto font-sans">
                <span>Showing {filteredInventory.length} of {inventory.length} items</span>
              </div>
            </div>

            {/* Paper White Data Table: 12px radius, soft shadow */}
            <Card className="rounded-[12px] bg-[#ffffff] border border-[#393737]/8 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-0">
              {loading ? (
                <div className="p-12 text-center text-[#888787] flex flex-col items-center gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-[#393737]" />
                  <p className="text-sm font-normal font-sans">Fetching your live stock from Supabase...</p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="p-12 text-center text-[#888787]">
                  <Package className="h-10 w-10 mx-auto text-[#888787] mb-2" />
                  <h4 className="font-serif font-normal text-lg text-[#393737]">No medicines found</h4>
                  <p className="text-xs text-[#888787] mt-1 font-normal font-sans">
                    {searchQuery ? 'Try matching another name' : 'Add your first medicine using the form on the left'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#393737]/10 hover:bg-transparent bg-[#f7f7f7]">
                      <TableHead className="text-[#888787] text-xs font-sans">Medicine & Composition</TableHead>
                      <TableHead className="text-[#888787] text-xs font-sans">Dosage</TableHead>
                      <TableHead className="text-[#888787] text-xs font-sans">Current Stock</TableHead>
                      <TableHead className="text-[#888787] text-xs font-sans">Price</TableHead>
                      <TableHead className="text-[#888787] text-xs font-sans">Expiry Date</TableHead>
                      <TableHead className="text-right text-[#888787] text-xs font-sans">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => {
                      const isLow = item.quantity > 0 && item.quantity < 30;
                      const isOut = item.quantity === 0;

                      return (
                        <TableRow key={item.id} className="border-b border-[#393737]/10 hover:bg-[#f7f7f7]/80 transition-colors">
                          <TableCell className="font-normal">
                            <div className="text-sm font-semibold text-[#393737] font-sans">
                              {item.medicine_name}
                            </div>
                            {item.generic_name && (
                              <div className="text-xs text-[#888787] font-sans">
                                {item.generic_name}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-[#888787] font-sans">
                            {item.dosage || 'Standard'}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-xs font-sans rounded-[100px]"
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
                                  className="h-7 w-7 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-xs font-semibold text-[#393737] flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                                >
                                  -10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustQuantity(item, 10)}
                                  disabled={actionLoadingId === item.id}
                                  title="Increase 10 units"
                                  className="h-7 w-7 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 hover:bg-[#ececec] text-xs font-semibold text-[#393737] flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
                                >
                                  +10
                                </button>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-serif font-normal text-[#393737]">
                            {formatCurrency(Number(item.price))}
                          </TableCell>

                          <TableCell className="text-xs text-[#888787] font-sans">
                            {formatDate(item.expiry_date)}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={actionLoadingId === item.id}
                              className="text-[#888787] hover:text-[#393737] hover:bg-[#f7f7f7] h-8 w-8 p-0 rounded-[100px] transition-colors"
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
