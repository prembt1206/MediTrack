'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/ChatWidget';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pill,
  Store,
  Search,
  Sparkles,
  MapPin,
  Bot,
  ShieldCheck,
  Languages,
  CheckCircle2,
  ArrowRight,
  Database,
  ScanText,
  Activity,
  HeartHandshake,
  Cloud,
  Zap,
  TrendingUp,
  Clock,
  Compass,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col relative overflow-hidden selection:bg-[#0071e3] selection:text-white">
      
      {/* Subtle Apple Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] apple-subtle-glow pointer-events-none" />

      <Navbar />

      <main className="flex-1 z-10">
        
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
            
            {/* Top Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1d1d1f] text-[#86868b] border border-[#333336] text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-[#2997ff]" />
                <span className="text-[#f5f5f7]">Next.js App Router</span>
                <span className="text-[#424245]">•</span>
                <span>Supabase RLS</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1d1d1f] text-[#86868b] border border-[#333336] text-xs font-medium">
                <Cloud className="h-3.5 w-3.5 text-[#2997ff]" />
                <span className="text-[#f5f5f7]">Google Cloud & Gemini 3.8 Flash</span>
              </div>
            </div>

            {/* Primary Headline */}
            <h1 className="headline-hero text-white max-w-4xl mx-auto tracking-tight">
              Live medicine availability for{' '}
              <span className="bg-gradient-to-r from-white via-[#f5f5f7] to-[#86868b] bg-clip-text text-transparent">
                patients & pharmacies.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-apple-sub max-w-2xl mx-auto text-center font-normal">
              Eliminate emergency pharmacy runs. Check live inventory stock nearby in real-time, decode handwritten prescriptions using <strong>Google Cloud Vision & Gemini OCR</strong>, and converse with our AI chatbot in Kannada, Hindi, and English.
            </p>

            {/* DUAL-PORTAL LAUNCHPAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pt-8 text-left">
              
              {/* Demand Side Portal Card (Patient) */}
              <div className="group relative rounded-[28px] p-8 sm:p-9 bg-[#161617] border border-[#333336] hover:border-[#424245] transition-all duration-300 apple-card-interactive overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-[#1d1d1f] border border-[#333336] flex items-center justify-center text-[#2997ff]">
                      <Search className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-[#1d1d1f] text-[#86868b] border border-[#333336]">
                      Demand Side Portal
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold text-white tracking-tight">
                    For Patients & Caregivers
                  </h3>
                  <p className="text-sm text-[#86868b] mt-2.5 mb-7 leading-relaxed">
                    Search verified stock in real-time across nearby stores, upload doctor prescriptions for Google Cloud Vision OCR, and compute precise distance in kilometers.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-[#a1a1a6]">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>Real-time Live Stock</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>Gemini Prescription OCR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>GPS & Distance in KM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>Direct Call & Hold</span>
                    </div>
                  </div>
                </div>

                <Link href="/patient" className="block pt-2">
                  <Button variant="default" className="w-full justify-between h-12 text-sm px-6">
                    <span>Enter Patient Search</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Supply Side Portal Card (Pharmacy Owner) */}
              <div className="group relative rounded-[28px] p-8 sm:p-9 bg-[#161617] border border-[#333336] hover:border-[#424245] transition-all duration-300 apple-card-interactive overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-[#1d1d1f] border border-[#333336] flex items-center justify-center text-[#f5f5f7]">
                      <Store className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-[#1d1d1f] text-[#86868b] border border-[#333336]">
                      Supply Side Portal
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold text-white tracking-tight">
                    For Pharmacy Owners
                  </h3>
                  <p className="text-sm text-[#86868b] mt-2.5 mb-7 leading-relaxed">
                    Enterprise-grade dashboard protected by Supabase Row Level Security. Add medicine inventory SKUs, manage live stock quantities, and publish prices directly to local patients.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-[#a1a1a6]">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>Supabase RLS Protected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>Live Stock Adjustments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>Instant Price (₹) Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#2997ff]" />
                      <span>Low Stock Alerts</span>
                    </div>
                  </div>
                </div>

                <Link href="/pharmacy" className="block pt-2">
                  <Button variant="outline" className="w-full justify-between h-12 text-sm px-6">
                    <span>Enter Pharmacy Portal</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

            </div>

            {/* LIVE METRICS STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-10">
              <div className="bg-[#161617] p-5 rounded-2xl border border-[#333336] text-center">
                <p className="text-3xl font-semibold text-white tracking-tight">
                  8 Stores
                </p>
                <p className="text-xs text-[#86868b] font-normal mt-1">Verified Bengaluru Network</p>
              </div>
              <div className="bg-[#161617] p-5 rounded-2xl border border-[#333336] text-center">
                <p className="text-3xl font-semibold text-white tracking-tight">
                  50+ Meds
                </p>
                <p className="text-xs text-[#86868b] font-normal mt-1">Live Cataloged Inventory</p>
              </div>
              <div className="bg-[#161617] p-5 rounded-2xl border border-[#333336] text-center">
                <p className="text-3xl font-semibold text-white tracking-tight">
                  &lt; 1.2s
                </p>
                <p className="text-xs text-[#86868b] font-normal mt-1">Google Cloud Vision OCR</p>
              </div>
              <div className="bg-[#161617] p-5 rounded-2xl border border-[#333336] text-center">
                <p className="text-3xl font-semibold text-white tracking-tight">
                  5+
                </p>
                <p className="text-xs text-[#86868b] font-normal mt-1">Regional Indian Languages</p>
              </div>
            </div>

          </div>
        </section>

        {/* 7-LAYER ARCHITECTURE SHOWCASE */}
        <section className="py-24 bg-[#0e0e0e] border-t border-[#333336]/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="secondary" className="text-xs py-1 px-3">
                Full-Stack Engineering
              </Badge>
              <h2 className="headline-section text-white">
                Engineered with Modern Technologies
              </h2>
              <p className="text-apple-sub text-sm sm:text-base">
                Every layer built for rapid sub-second performance, strict data isolation, and maximum reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-[#161617] p-7 rounded-[28px] space-y-4 border border-[#333336] hover:border-[#424245] transition-all">
                <div className="h-11 w-11 rounded-xl bg-[#1d1d1f] border border-[#333336] text-[#2997ff] flex items-center justify-center">
                  <ScanText className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-white tracking-tight">
                  1. Google Cloud Vision & Gemini OCR
                </h3>
                <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                  Powered by Google Cloud Vision and Gemini 3.8 Flash. Decodes doctor handwriting, parses shorthand (e.g. <code className="text-[#f5f5f7] bg-[#1d1d1f] px-1 rounded">1-0-1, AC</code>) into patient instructions, and produces validated JSON to query the database.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#2997ff] font-medium">
                  <span>Try Prescription Upload</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#161617] p-7 rounded-[28px] space-y-4 border border-[#333336] hover:border-[#424245] transition-all">
                <div className="h-11 w-11 rounded-xl bg-[#1d1d1f] border border-[#333336] text-[#2997ff] flex items-center justify-center">
                  <Languages className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-white tracking-tight">
                  2. Google Cloud Multilingual Assistant
                </h3>
                <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                  Floating AI chat widget powered by Google Cloud Gemini 3.8 Flash answering stock inquiries in Kannada, Hindi, English, Tamil, and Telugu, strictly grounded on real Supabase inventory records.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#2997ff] font-medium">
                  <span>Multilingual Support</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#161617] p-7 rounded-[28px] space-y-4 border border-[#333336] hover:border-[#424245] transition-all">
                <div className="h-11 w-11 rounded-xl bg-[#1d1d1f] border border-[#333336] text-[#2997ff] flex items-center justify-center">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-white tracking-tight">
                  3. Supabase RLS Authorization
                </h3>
                <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                  Row Level Security guarantees pharmacy owners can only modify their own inventory, while patients have read-only access. Full schema SQL with foreign keys and cascade rules included.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#2997ff] font-medium">
                  <span>Row Level Security Active</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#333336] py-12 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#86868b]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[#1d1d1f] border border-[#333336] flex items-center justify-center text-[#f5f5f7]">
              <Pill className="h-4 w-4 text-[#2997ff]" />
            </div>
            <div>
              <span className="font-semibold text-white text-sm">MediTrack</span>
              <p className="text-[11px] text-[#86868b]">Real-Time Healthcare Inventory & Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-6 font-normal">
            <Link href="/patient" className="hover:text-white transition-colors">Patient Portal</Link>
            <Link href="/pharmacy" className="hover:text-white transition-colors">Pharmacy Portal</Link>
            <Link href="/login" className="hover:text-white transition-colors">Authentication</Link>
          </div>
        </div>
      </footer>

      {/* Multilingual Floating Chatbot */}
      <ChatWidget />
    </div>
  );
}
