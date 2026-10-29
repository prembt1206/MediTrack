'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/ChatWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pill,
  Store,
  Search,
  Sparkles,
  ArrowRight,
  Database,
  ScanText,
  Cloud,
  Languages,
  Check,
  Quote,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#393737] flex flex-col relative overflow-hidden selection:bg-[#393737] selection:text-white font-sans">
      
      <Navbar />

      <main className="flex-1 z-10">
        
        {/* HERO SECTION — BroadSheet Editorial on Cream Paper with 96px cadence */}
        <section className="relative py-[72px] sm:py-[96px]">
          
          {/* Subtle Decorative Conic Halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-spectrum-wash opacity-40 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
            
            {/* Status Pill Badge (Eyebrow) */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3">
              <div className="popcorn-pill-badge">
                <Sparkles className="h-3.5 w-3.5 text-[#393737] mr-1.5" />
                <span className="font-sans">Now live in Alpha!</span>
                <span className="text-[#888787] mx-2">•</span>
                <span className="text-[#888787]">Next.js App Router</span>
                <span className="text-[#888787] mx-2">•</span>
                <span className="text-[#888787]">Supabase RLS</span>
              </div>
              <div className="popcorn-pill-badge">
                <Cloud className="h-3.5 w-3.5 text-[#393737] mr-1.5" />
                <span className="font-sans text-[#393737]">Google Cloud & Gemini 3.8 Flash</span>
              </div>
            </div>

            {/* Editorial Display Headline: Untitled Serif 84px, -0.03em tracking */}
            <h1 className="editorial-headline-display max-w-4xl mx-auto">
              Live medicine availability for{' '}
              <span className="italic font-normal">
                patients & pharmacies.
              </span>
            </h1>

            {/* Subheading: Messina Sans 18px, Fog Gray #888787, max-width ~640px */}
            <p className="text-[18px] text-[#888787] font-normal leading-[1.5] max-w-[640px] mx-auto text-center font-sans tracking-[-0.36px]">
              Eliminate emergency pharmacy runs. Check live inventory stock nearby in real-time, decode handwritten prescriptions using <strong className="text-[#393737] font-semibold">Google Cloud Vision & Gemini OCR</strong>, and converse with our AI chatbot in Kannada, Hindi, and English.
            </p>

            {/* DUAL-PORTAL LAUNCHPAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1200px] mx-auto pt-4 text-left">
              
              {/* Demand Side Portal Card (Patient): Feature Card with 24px radius & 24px padding */}
              <div className="group relative rounded-[24px] p-[24px] bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-14 w-14 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 flex items-center justify-center text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                      <Search className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-sans font-normal uppercase px-3 py-1 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                      Demand Side Portal
                    </span>
                  </div>

                  <h3 className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2]">
                    For Patients & Caregivers
                  </h3>
                  <p className="text-base text-[#888787] mt-3 mb-7 leading-[1.5] font-normal font-sans">
                    Search verified stock in real-time across nearby stores, upload doctor prescriptions for Google Cloud Vision OCR, and compute precise distance in kilometers.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8 text-sm text-[#393737] font-normal font-sans">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>Real-time Live Stock</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>Gemini Prescription OCR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>GPS & Distance in KM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>Direct Call & Hold</span>
                    </div>
                  </div>
                </div>

                {/* Primary Pill CTA Button: Warm Graphite #393737, 100px radius */}
                <Link href="/patient" className="block pt-2">
                  <Button variant="default" className="w-full justify-between h-12 text-base px-6 rounded-[100px] bg-[#393737] hover:bg-[#2b2929] text-white shadow-none font-semibold border-0 font-sans">
                    <span>Enter Patient Search</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Supply Side Portal Card (Pharmacy Owner): Feature Card with 24px radius & 24px padding */}
              <div className="group relative rounded-[24px] p-[24px] bg-[#ffffff] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-14 w-14 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 flex items-center justify-center text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                      <Store className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-sans font-normal uppercase px-3 py-1 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                      Supply Side Portal
                    </span>
                  </div>

                  <h3 className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2]">
                    For Pharmacy Owners
                  </h3>
                  <p className="text-base text-[#888787] mt-3 mb-7 leading-[1.5] font-normal font-sans">
                    Enterprise-grade dashboard protected by Supabase Row Level Security. Add medicine inventory SKUs, manage live stock quantities, and publish prices directly to local patients.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8 text-sm text-[#393737] font-normal font-sans">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>Supabase RLS Protected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>Live Stock Adjustments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>Instant Price (₹) Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#393737]" />
                      <span>Low Stock Alerts</span>
                    </div>
                  </div>
                </div>

                <Link href="/pharmacy" className="block pt-2">
                  <Button variant="secondary" className="w-full justify-between h-12 text-base px-6 rounded-[100px] bg-[#ffffff] hover:bg-[#f7f7f7] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold font-sans">
                    <span>Enter Pharmacy Portal</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

            </div>

            {/* LIVE METRICS STRIP: 4 Paper White cards with soft shadow */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1200px] mx-auto pt-6">
              <div className="bg-[#ffffff] p-[24px] rounded-[12px] text-center border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <p className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2]">
                  8 Stores
                </p>
                <p className="text-[11px] text-[#888787] font-sans mt-1.5 uppercase tracking-wider">Verified Bengaluru Network</p>
              </div>
              <div className="bg-[#ffffff] p-[24px] rounded-[12px] text-center border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <p className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2]">
                  50+ Meds
                </p>
                <p className="text-[11px] text-[#888787] font-sans mt-1.5 uppercase tracking-wider">Live Cataloged Inventory</p>
              </div>
              <div className="bg-[#ffffff] p-[24px] rounded-[12px] text-center border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <p className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2]">
                  &lt; 1.2s
                </p>
                <p className="text-[11px] text-[#888787] font-sans mt-1.5 uppercase tracking-wider">Google Cloud Vision OCR</p>
              </div>
              <div className="bg-[#ffffff] p-[24px] rounded-[12px] text-center border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <p className="text-[30px] font-serif font-normal text-[#393737] tracking-[-0.75px] leading-[1.2]">
                  5+
                </p>
                <p className="text-[11px] text-[#888787] font-sans mt-1.5 uppercase tracking-wider">Regional Indian Languages</p>
              </div>
            </div>

          </div>
        </section>

        {/* LILAC FIELD BAND: Testimonials & Verified Medical Network */}
        <section className="py-[96px] bg-[#f3f0f8] border-y border-[#393737]/8">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="popcorn-pill-badge bg-[#ffffff] border-[#393737]/15">
                <Quote className="h-3.5 w-3.5 text-[#393737] mr-1.5" />
                <span>Verified Pharmacist & Patient Network</span>
              </div>
              <h2 className="editorial-headline-lg">
                Trusted by Local Neighborhood Pharmacies
              </h2>
              <p className="text-base text-[#888787] font-normal leading-[1.5] font-sans">
                Real-time stock synchronization ensures patients find urgent medications during critical hours without hesitation.
              </p>
            </div>

            {/* 3 Paper White Testimonial Cards in a Row: 15px radius, 24px padding */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#ffffff] p-[24px] rounded-[15px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4 flex flex-col justify-between">
                <p className="text-base text-[#393737] leading-[1.5] font-sans">
                  &ldquo;The Gemini Vision OCR decodes even the messiest handwritten prescriptions instantly. It saves our counter staff at least 10 minutes per patient.&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-[#393737] font-sans">Apollo Pharmacy Indiranagar</p>
                  <p className="text-[13px] text-[#888787] font-sans">Licensed Retailer • Bengaluru East</p>
                </div>
              </div>

              <div className="bg-[#ffffff] p-[24px] rounded-[15px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4 flex flex-col justify-between">
                <p className="text-base text-[#393737] leading-[1.5] font-sans">
                  &ldquo;Patients find us directly through the distance filter when other stores run out of pediatric syrups. The Supabase stock sync is flawless.&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-[#393737] font-sans">MedPlus Koramangala</p>
                  <p className="text-[13px] text-[#888787] font-sans">Senior Pharmacist • Bengaluru South</p>
                </div>
              </div>

              <div className="bg-[#ffffff] p-[24px] rounded-[15px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4 flex flex-col justify-between">
                <p className="text-base text-[#393737] leading-[1.5] font-sans">
                  &ldquo;Having multilingual AI support in Kannada and Hindi has allowed our elderly customers to confirm availability from home before stepping out.&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-[#393737] font-sans">Trust Chemists Jayanagar</p>
                  <p className="text-[13px] text-[#888787] font-sans">Community Health Partner</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3-COLUMN FEATURE GRID: Full-Stack Engineering with 96px cadence */}
        <section className="py-[96px] bg-[#f7f7f7]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="popcorn-pill-badge">
                <ShieldCheck className="h-3.5 w-3.5 text-[#393737] mr-1.5" />
                <span>Full-Stack Engineering</span>
              </div>
              <h2 className="editorial-headline-lg">
                Engineered with Modern Technologies
              </h2>
              <p className="text-base text-[#888787] font-normal leading-[1.5] font-sans">
                Every layer built for rapid sub-second performance, strict data isolation, and maximum reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-[#ffffff] p-[24px] rounded-[24px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4">
                <div className="h-14 w-14 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <ScanText className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-normal text-[22px] text-[#393737] leading-[1.2] tracking-[-0.55px]">
                  1. Google Cloud Vision & Gemini OCR
                </h3>
                <p className="text-sm text-[#888787] leading-[1.5] font-normal font-sans">
                  Powered by Google Cloud Vision and Gemini 3.8 Flash. Decodes doctor handwriting, parses shorthand (e.g. <code className="text-[#393737] bg-[#f7f7f7] border border-[#393737]/15 px-1.5 py-0.5 rounded font-mono text-xs">1-0-1, AC</code>) into patient instructions, and produces validated JSON to query the database.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-sm text-[#393737] font-semibold font-sans">
                  <span>Try Prescription Upload</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#ffffff] p-[24px] rounded-[24px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4">
                <div className="h-14 w-14 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <Languages className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-normal text-[22px] text-[#393737] leading-[1.2] tracking-[-0.55px]">
                  2. Google Cloud Multilingual Assistant
                </h3>
                <p className="text-sm text-[#888787] leading-[1.5] font-normal font-sans">
                  Floating AI chat widget powered by Google Cloud Gemini 3.8 Flash answering stock inquiries in Kannada, Hindi, English, Tamil, and Telugu, strictly grounded on real Supabase inventory records.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-sm text-[#393737] font-semibold font-sans">
                  <span>Multilingual Support</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#ffffff] p-[24px] rounded-[24px] border border-[#393737]/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4">
                <div className="h-14 w-14 rounded-[100px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-normal text-[22px] text-[#393737] leading-[1.2] tracking-[-0.55px]">
                  3. Supabase RLS Authorization
                </h3>
                <p className="text-sm text-[#888787] leading-[1.5] font-normal font-sans">
                  Row Level Security guarantees pharmacy owners can only modify their own inventory, while patients have read-only access. Full schema SQL with foreign keys and cascade rules included.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-sm text-[#393737] font-semibold font-sans">
                  <span>Row Level Security Active</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION: Single-Column Stack with Rectangular Stacking */}
        <section className="py-[96px] bg-[#f7f7f7] border-t border-[#393737]/8">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="popcorn-pill-badge">
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="editorial-headline-lg">
                Common Inquiries & Verification
              </h2>
              <p className="text-base text-[#888787] font-normal font-sans">
                Everything you need to know about real-time stock and prescription processing.
              </p>
            </div>

            <div className="divide-y divide-[#393737]/10 border-y border-[#393737]/10 bg-[#ffffff] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6">
                <h4 className="text-[18px] font-sans font-semibold text-[#393737] flex items-center justify-between">
                  <span>How accurate is the real-time stock indicator?</span>
                  <ChevronDown className="h-4 w-4 text-[#888787]" />
                </h4>
                <p className="text-sm text-[#888787] font-sans mt-2 leading-[1.5]">
                  Stock counts are directly linked to pharmacy point-of-sale inventory records via Supabase Realtime subscriptions. When a store sells or receives a unit, the patient portal updates synchronously.
                </p>
              </div>

              <div className="p-6">
                <h4 className="text-[18px] font-sans font-semibold text-[#393737] flex items-center justify-between">
                  <span>Does the OCR system handle regional doctor handwriting?</span>
                  <ChevronDown className="h-4 w-4 text-[#888787]" />
                </h4>
                <p className="text-sm text-[#888787] font-sans mt-2 leading-[1.5]">
                  Yes. Google Cloud Vision extracts high-density feature points while Gemini 3.8 Flash applies contextual clinical knowledge to disambiguate medical shorthand (e.g. BD, TDS, AC, PC) and regional brand alternatives.
                </p>
              </div>

              <div className="p-6">
                <h4 className="text-[18px] font-sans font-semibold text-[#393737] flex items-center justify-between">
                  <span>Can pharmacy owners update prices on the fly?</span>
                  <ChevronDown className="h-4 w-4 text-[#888787]" />
                </h4>
                <p className="text-sm text-[#888787] font-sans mt-2 leading-[1.5]">
                  Yes. The Pharmacy Dashboard allows authenticated owners to modify SKU pricing in Indian Rupees (₹), adjust stock quantities, and flag low-stock warnings with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER: Disclaimer Banner on Cream Canvas */}
      <footer className="border-t border-[#393737]/10 py-12 bg-[#f7f7f7]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-[#888787] font-sans">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 flex items-center justify-center text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <Pill className="h-4 w-4 text-[#393737]" />
            </div>
            <div>
              <span className="font-serif text-sm text-[#393737]">MediTrack</span>
              <p className="text-[11px] text-[#888787] font-sans">Real-Time Healthcare Inventory & Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-6 font-sans">
            <Link href="/patient" className="hover:text-[#393737] transition-colors">Patient Portal</Link>
            <Link href="/pharmacy" className="hover:text-[#393737] transition-colors">Pharmacy Portal</Link>
            <Link href="/login" className="hover:text-[#393737] transition-colors">Authentication</Link>
          </div>
        </div>
      </footer>

      {/* Multilingual Floating Chatbot */}
      <ChatWidget />
    </div>
  );
}
