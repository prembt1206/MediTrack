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
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col relative overflow-hidden selection:bg-[#5266eb] selection:text-white">
      
      <Navbar />

      <main className="flex-1 z-10">
        
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-10">
            
            {/* Top Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1e1e2a] text-[#c3c3cc] border border-[#70707d]/30 text-xs font-normal shadow-none">
                <Sparkles className="h-3.5 w-3.5 text-[#c3c3cc]" />
                <span className="text-[#ededf3]">Next.js App Router</span>
                <span className="text-[#70707d]">•</span>
                <span>Supabase RLS</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1e1e2a] text-[#c3c3cc] border border-[#70707d]/30 text-xs font-normal shadow-none">
                <Cloud className="h-3.5 w-3.5 text-[#c3c3cc]" />
                <span className="text-[#ededf3]">Google Cloud & Gemini 3.8 Flash</span>
              </div>
            </div>

            {/* Primary Headline */}
            <h1 className="headline-hero text-[#ededf3] max-w-4xl mx-auto tracking-[0.015em] font-medium leading-[1.12]">
              Live medicine availability for{' '}
              <span className="text-[#c3c3cc]">
                patients & pharmacies.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-[#c3c3cc] max-w-2xl mx-auto text-center font-normal text-base leading-normal">
              Eliminate emergency pharmacy runs. Check live inventory stock nearby in real-time, decode handwritten prescriptions using <strong className="text-[#ededf3] font-normal">Google Cloud Vision & Gemini OCR</strong>, and converse with our AI chatbot in Kannada, Hindi, and English.
            </p>

            {/* DUAL-PORTAL LAUNCHPAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1200px] mx-auto pt-6 text-left">
              
              {/* Demand Side Portal Card (Patient) */}
              <div className="group relative rounded-[12px] p-8 bg-[#1e1e2a] border border-[#70707d]/30 hover:border-[#70707d]/50 transition-colors shadow-none overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 flex items-center justify-center text-[#ededf3]">
                      <Search className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-normal tracking-wide uppercase px-3 py-1 rounded-full bg-[#171721] text-[#c3c3cc] border border-[#70707d]/30">
                      Demand Side Portal
                    </span>
                  </div>

                  <h3 className="text-2xl font-medium text-[#ededf3] tracking-[0.015em]">
                    For Patients & Caregivers
                  </h3>
                  <p className="text-sm text-[#c3c3cc] mt-2.5 mb-7 leading-relaxed font-normal">
                    Search verified stock in real-time across nearby stores, upload doctor prescriptions for Google Cloud Vision OCR, and compute precise distance in kilometers.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-[#c3c3cc]">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>Real-time Live Stock</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>Gemini Prescription OCR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>GPS & Distance in KM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>Direct Call & Hold</span>
                    </div>
                  </div>
                </div>

                {/* Primary Conversion Button: ONLY Cobalt #5266eb element */}
                <Link href="/patient" className="block pt-2">
                  <Button variant="default" className="w-full justify-between h-12 text-sm px-6 rounded-full bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none font-normal">
                    <span>Enter Patient Search</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Supply Side Portal Card (Pharmacy Owner) */}
              <div className="group relative rounded-[12px] p-8 bg-[#1e1e2a] border border-[#70707d]/30 hover:border-[#70707d]/50 transition-colors shadow-none overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 flex items-center justify-center text-[#ededf3]">
                      <Store className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-normal tracking-wide uppercase px-3 py-1 rounded-full bg-[#171721] text-[#c3c3cc] border border-[#70707d]/30">
                      Supply Side Portal
                    </span>
                  </div>

                  <h3 className="text-2xl font-medium text-[#ededf3] tracking-[0.015em]">
                    For Pharmacy Owners
                  </h3>
                  <p className="text-sm text-[#c3c3cc] mt-2.5 mb-7 leading-relaxed font-normal">
                    Enterprise-grade dashboard protected by Supabase Row Level Security. Add medicine inventory SKUs, manage live stock quantities, and publish prices directly to local patients.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-[#c3c3cc]">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>Supabase RLS Protected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>Live Stock Adjustments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>Instant Price (₹) Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#ededf3]" />
                      <span>Low Stock Alerts</span>
                    </div>
                  </div>
                </div>

                <Link href="/pharmacy" className="block pt-2">
                  <Button variant="outline" className="w-full justify-between h-12 text-sm px-6 rounded-full bg-[#242432] hover:bg-[#2c2c3e] border border-[#70707d]/35 text-[#ededf3] shadow-none font-normal">
                    <span>Enter Pharmacy Portal</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

            </div>

            {/* LIVE METRICS STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1200px] mx-auto pt-8">
              <div className="bg-[#1e1e2a] p-8 rounded-[12px] border border-[#70707d]/30 text-center shadow-none">
                <p className="text-3xl font-medium text-[#ededf3] tracking-[0.015em]">
                  8 Stores
                </p>
                <p className="text-xs text-[#c3c3cc] font-normal mt-1">Verified Bengaluru Network</p>
              </div>
              <div className="bg-[#1e1e2a] p-8 rounded-[12px] border border-[#70707d]/30 text-center shadow-none">
                <p className="text-3xl font-medium text-[#ededf3] tracking-[0.015em]">
                  50+ Meds
                </p>
                <p className="text-xs text-[#c3c3cc] font-normal mt-1">Live Cataloged Inventory</p>
              </div>
              <div className="bg-[#1e1e2a] p-8 rounded-[12px] border border-[#70707d]/30 text-center shadow-none">
                <p className="text-3xl font-medium text-[#ededf3] tracking-[0.015em]">
                  &lt; 1.2s
                </p>
                <p className="text-xs text-[#c3c3cc] font-normal mt-1">Google Cloud Vision OCR</p>
              </div>
              <div className="bg-[#1e1e2a] p-8 rounded-[12px] border border-[#70707d]/30 text-center shadow-none">
                <p className="text-3xl font-medium text-[#ededf3] tracking-[0.015em]">
                  5+
                </p>
                <p className="text-xs text-[#c3c3cc] font-normal mt-1">Regional Indian Languages</p>
              </div>
            </div>

          </div>
        </section>

        {/* 7-LAYER ARCHITECTURE SHOWCASE */}
        <section className="py-24 bg-[#171721] border-t border-[#70707d]/25">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="secondary" className="text-xs py-1 px-3.5 rounded-full bg-[#1e1e2a] text-[#c3c3cc] border-[#70707d]/30 shadow-none font-normal">
                Full-Stack Engineering
              </Badge>
              <h2 className="headline-section text-[#ededf3] font-medium tracking-[0.015em]">
                Engineered with Modern Technologies
              </h2>
              <p className="text-[#c3c3cc] text-sm sm:text-base font-normal leading-normal">
                Every layer built for rapid sub-second performance, strict data isolation, and maximum reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-[#1e1e2a] p-8 rounded-[12px] space-y-4 border border-[#70707d]/30 hover:border-[#70707d]/50 transition-colors shadow-none">
                <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
                  <ScanText className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-lg text-[#ededf3] tracking-[0.015em]">
                  1. Google Cloud Vision & Gemini OCR
                </h3>
                <p className="text-xs sm:text-sm text-[#c3c3cc] leading-relaxed font-normal">
                  Powered by Google Cloud Vision and Gemini 3.8 Flash. Decodes doctor handwriting, parses shorthand (e.g. <code className="text-[#ededf3] bg-[#171721] px-1 py-0.5 rounded font-mono text-xs">1-0-1, AC</code>) into patient instructions, and produces validated JSON to query the database.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#ededf3] hover:text-white font-normal transition-colors">
                  <span>Try Prescription Upload</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#1e1e2a] p-8 rounded-[12px] space-y-4 border border-[#70707d]/30 hover:border-[#70707d]/50 transition-colors shadow-none">
                <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
                  <Languages className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-lg text-[#ededf3] tracking-[0.015em]">
                  2. Google Cloud Multilingual Assistant
                </h3>
                <p className="text-xs sm:text-sm text-[#c3c3cc] leading-relaxed font-normal">
                  Floating AI chat widget powered by Google Cloud Gemini 3.8 Flash answering stock inquiries in Kannada, Hindi, English, Tamil, and Telugu, strictly grounded on real Supabase inventory records.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#ededf3] hover:text-white font-normal transition-colors">
                  <span>Multilingual Support</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#1e1e2a] p-8 rounded-[12px] space-y-4 border border-[#70707d]/30 hover:border-[#70707d]/50 transition-colors shadow-none">
                <div className="h-11 w-11 rounded-full bg-[#171721] border border-[#70707d]/30 text-[#ededf3] flex items-center justify-center">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-lg text-[#ededf3] tracking-[0.015em]">
                  3. Supabase RLS Authorization
                </h3>
                <p className="text-xs sm:text-sm text-[#c3c3cc] leading-relaxed font-normal">
                  Row Level Security guarantees pharmacy owners can only modify their own inventory, while patients have read-only access. Full schema SQL with foreign keys and cascade rules included.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#ededf3] hover:text-white font-normal transition-colors">
                  <span>Row Level Security Active</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#70707d]/25 py-12 bg-[#171721]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#c3c3cc]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#1e1e2a] border border-[#70707d]/30 flex items-center justify-center text-[#ededf3]">
              <Pill className="h-4 w-4 text-[#ededf3]" />
            </div>
            <div>
              <span className="font-medium text-[#ededf3] text-sm">MediTrack</span>
              <p className="text-[11px] text-[#c3c3cc]">Real-Time Healthcare Inventory & Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-6 font-normal">
            <Link href="/patient" className="hover:text-[#ededf3] transition-colors">Patient Portal</Link>
            <Link href="/pharmacy" className="hover:text-[#ededf3] transition-colors">Pharmacy Portal</Link>
            <Link href="/login" className="hover:text-[#ededf3] transition-colors">Authentication</Link>
          </div>
        </div>
      </footer>

      {/* Multilingual Floating Chatbot */}
      <ChatWidget />
    </div>
  );
}
