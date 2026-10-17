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
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, switchDemoRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold shadow-sm animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>12-Hour Hackathon MVP • Built with Next.js App Router & Supabase RLS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
              Real-Time Medicine Availability for Patients & Pharmacies
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Never visit pharmacy after pharmacy in an emergency. Check verified live stocks nearby, scan handwritten prescriptions with Gemini Vision OCR, and chat in Kannada, Hindi, or English.
            </p>

            {/* Main Portal Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6 text-left">
              
              {/* Demand Side - Patient */}
              <div className="group relative rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all hover:-translate-y-1">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6" />
                </div>
                <Badge variant="success" className="mb-2 text-[10px]">
                  Demand Side Portal
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  For Patients & Caregivers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
                  Search medicine stock in real-time, upload handwritten prescriptions for Gemini OCR, and view exact distances in km.
                </p>
                <Link href="/patient">
                  <Button variant="gradient" className="w-full justify-between">
                    <span>Enter Patient Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Supply Side - Pharmacy Owner */}
              <div className="group relative rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all hover:-translate-y-1">
                <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Store className="h-6 w-6" />
                </div>
                <Badge variant="purple" className="mb-2 text-[10px]">
                  Supply Side Portal
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  For Pharmacy Owners
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
                  Secure dashboard protected by Supabase RLS. Add medicine inventory, manage quantities, and publish live stock.
                </p>
                <Link href="/pharmacy">
                  <Button variant="outline" className="w-full justify-between border-teal-300 text-teal-800 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300">
                    <span>Enter Pharmacy Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Complete 7-Layer Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Engineered according to the hackathon specifications with production safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ScanText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                1. Gemini Vision Prescription OCR
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Decodes doctor handwriting, parses shorthand (e.g. <code>1-0-1, AC</code>) into patient instructions, and produces validated JSON to query the database.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                2. Multilingual AI Chatbot
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Floating AI chat widget answering stock inquiries in Kannada, Hindi, English, Tamil, and Telugu, strictly grounded on real Supabase inventory records.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                3. Supabase RLS Authorization
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Row Level Security guarantees pharmacy owners can only modify their own inventory, while patients have read-only access. Full schema SQL included.
              </p>
            </Card>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">MediTrack</span>
            <span>• Hackathon MVP Release</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/patient" className="hover:text-emerald-600">Patient Portal</Link>
            <Link href="/pharmacy" className="hover:text-emerald-600">Pharmacy Portal</Link>
            <Link href="/login" className="hover:text-emerald-600">Authentication</Link>
          </div>
        </div>
      </footer>

      {/* Multilingual Floating Chatbot */}
      <ChatWidget />
    </div>
  );
}
