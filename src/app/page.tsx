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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none animate-float-delayed" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 z-10">
        
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
            
            {/* FLOATING AMBIENT ICONS (Floating around hero for high visual energy) */}
            <div className="hidden lg:block absolute -top-4 left-8 animate-float-slow">
              <div className="glass-card p-3 rounded-2xl flex items-center gap-2.5 shadow-xl border border-emerald-500/30">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Pill className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-medium">Real-Time Stocks</p>
                  <p className="text-xs font-bold text-white">Live Availability</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute top-8 right-8 animate-float-reverse">
              <div className="glass-card p-3 rounded-2xl flex items-center gap-2.5 shadow-xl border border-sky-500/30">
                <div className="h-9 w-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Cloud className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-medium">Google Cloud AI</p>
                  <p className="text-xs font-bold text-white">Gemini 3.8 OCR</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-6 left-12 animate-float-delayed">
              <div className="glass-card p-3 rounded-2xl flex items-center gap-2.5 shadow-xl border border-teal-500/30">
                <div className="h-9 w-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-medium">Sub-Second Lookup</p>
                  <p className="text-xs font-bold text-white">&lt; 1.5s Response</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-4 right-12 animate-float-slow">
              <div className="glass-card p-3 rounded-2xl flex items-center gap-2.5 shadow-xl border border-cyan-500/30">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-medium">Supabase RLS</p>
                  <p className="text-xs font-bold text-white">Secure Auth</p>
                </div>
              </div>
            </div>

            {/* Top Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" />
                <span>Next.js App Router • Supabase RLS</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/70 text-sky-300 border border-sky-500/30 text-xs font-semibold backdrop-blur-md shadow-sm">
                <Cloud className="h-3.5 w-3.5 text-sky-400" />
                <span>Integrated with Google Cloud & Gemini 3.8 Flash</span>
              </div>
            </div>

            {/* Primary Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
              Live Medicine Availability for{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Patients & Pharmacies
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              Eliminate emergency pharmacy runs. Check live inventory stock nearby in real-time, decode handwritten prescriptions using <strong>Google Cloud Vision & Gemini OCR</strong>, and converse with our AI chatbot in Kannada, Hindi, and English.
            </p>

            {/* INTERACTIVE DUAL-PORTAL LAUNCHPAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-6 text-left">
              
              {/* Demand Side Portal Card (Patient) */}
              <div className="group relative rounded-3xl p-7 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400/80 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.25)] interactive-card overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                
                <div className="flex items-center justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <Search className="h-7 w-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Demand Side Portal
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  For Patients & Caregivers
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
                  Search verified stock in real-time across nearby stores, upload doctor prescriptions for Google Cloud Vision OCR, and compute precise distance in kilometers.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Real-time Live Stock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Gemini Prescription OCR</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>GPS & Distance in KM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Direct Call & Hold</span>
                  </div>
                </div>

                <Link href="/patient" className="block">
                  <Button variant="gradient" className="w-full justify-between h-12 text-sm shadow-emerald-500/20">
                    <span>Enter Patient Search</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Supply Side Portal Card (Pharmacy Owner) */}
              <div className="group relative rounded-3xl p-7 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-teal-950/30 border border-teal-500/30 hover:border-teal-400/80 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(20,184,166,0.25)] interactive-card overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />
                
                <div className="flex items-center justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                    <Store className="h-7 w-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Supply Side Portal
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white group-hover:text-teal-300 transition-colors">
                  For Pharmacy Owners
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
                  Enterprise-grade dashboard protected by Supabase Row Level Security. Add medicine inventory SKUs, manage live stock quantities, and publish prices directly to local patients.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Supabase RLS Protected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Live Stock Adjustments</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Instant Price (₹) Updates</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Low Stock Alerts</span>
                  </div>
                </div>

                <Link href="/pharmacy" className="block">
                  <Button variant="outline" className="w-full justify-between h-12 text-sm border-teal-500/50 text-teal-200 hover:bg-teal-950/60 hover:border-teal-400">
                    <span>Enter Pharmacy Portal</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

            </div>

            {/* LIVE INTERACTIVE METRICS STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
              <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  100%
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Verified Real-Time Stocks</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                  &lt; 1.5s
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Google Cloud Vision OCR</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                  5+
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Regional Indian Languages</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  99.9%
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Supabase Cloud PostgreSQL</p>
              </div>
            </div>

          </div>
        </section>

        {/* 7-LAYER ARCHITECTURE SHOWCASE */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 border-t border-slate-900">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-xs py-1 px-3">
              Full-Stack Engineering
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered with Modern Technologies
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every layer built for rapid sub-second performance, strict data isolation, and maximum reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-card p-7 rounded-2xl space-y-4 border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md">
                <ScanText className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-white">
                1. Google Cloud Vision & Gemini OCR
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by Google Cloud Vision and Gemini 3.8 Flash. Decodes doctor handwriting, parses shorthand (e.g. <code>1-0-1, AC</code>) into patient instructions, and produces validated JSON to query the database.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span>Try Prescription Upload</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-7 rounded-2xl space-y-4 border border-slate-800 hover:border-teal-500/50 transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shadow-md">
                <Languages className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-white">
                2. Google Cloud Multilingual Assistant
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Floating AI chat widget powered by Google Cloud Gemini 3.8 Flash answering stock inquiries in Kannada, Hindi, English, Tamil, and Telugu, strictly grounded on real Supabase inventory records.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-teal-400 font-semibold">
                <span>Multilingual Support</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-7 rounded-2xl space-y-4 border border-slate-800 hover:border-cyan-500/50 transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-white">
                3. Supabase RLS Authorization
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Row Level Security guarantees pharmacy owners can only modify their own inventory, while patients have read-only access. Full schema SQL with foreign keys and cascade rules included.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                <span>Row Level Security Active</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">MediTrack</span>
              <p className="text-[11px] text-slate-500">Real-Time Healthcare Inventory & Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/patient" className="hover:text-emerald-400 transition-colors">Patient Portal</Link>
            <Link href="/pharmacy" className="hover:text-teal-400 transition-colors">Pharmacy Portal</Link>
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Authentication</Link>
          </div>
        </div>
      </footer>

      {/* Multilingual Floating Chatbot */}
      <ChatWidget />
    </div>
  );
}
