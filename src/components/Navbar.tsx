'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Pill, 
  Store, 
  Search, 
  LogOut, 
  Sparkles, 
  Database,
  Cloud,
  FileText,
  PackagePlus,
  User,
  ShieldCheck
} from 'lucide-react';

export function Navbar() {
  const { user, signOut, isConfigured } = useAuth();
  const pathname = usePathname();

  const isPatient = user?.role === 'Patient';
  const isOwner = user?.role === 'Pharmacy Owner';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-6">
            <Link href={isOwner ? '/pharmacy' : '/patient'} className="flex items-center gap-2.5 group">
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 group-hover:rotate-3 active:scale-95 transition-all duration-300">
                <Pill className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-200 transition-all">
                    MediTrack
                  </span>
                  {user && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm transition-all ${
                      isPatient
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-emerald-950/50'
                        : 'bg-teal-950/80 text-teal-300 border-teal-700/60 shadow-teal-950/50'
                    }`}>
                      {isPatient ? 'Patient Portal' : 'Owner Portal'}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Strict Role-Specific Navigation Links (NO COMBINING) */}
            <nav className="hidden md:flex items-center gap-2">
              
              {/* If PATIENT: Show ONLY Patient topics */}
              {isPatient && (
                <>
                  <Link
                    href="/patient"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-95 ${
                      pathname === '/patient'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm shadow-emerald-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                    }`}
                  >
                    <Search className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Find Medicine</span>
                  </Link>
                  <Link
                    href="/patient"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all active:scale-95"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Prescription OCR</span>
                  </Link>
                </>
              )}

              {/* If PHARMACY OWNER: Show ONLY Owner topics */}
              {isOwner && (
                <>
                  <Link
                    href="/pharmacy"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-95 ${
                      pathname === '/pharmacy'
                        ? 'bg-teal-950/80 text-teal-300 border border-teal-700/60 shadow-sm shadow-teal-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5 text-teal-400" />
                    <span>Store Inventory</span>
                  </Link>
                  <Link
                    href="/pharmacy"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all active:scale-95"
                  >
                    <PackagePlus className="h-3.5 w-3.5 text-teal-400" />
                    <span>Add Stock</span>
                  </Link>
                </>
              )}

            </nav>
          </div>

          {/* Right Action Center */}
          <div className="flex items-center gap-3">
            
            {/* Google Cloud Badge */}
            <Badge
              variant="outline"
              className="hidden lg:inline-flex items-center gap-1.5 border-sky-800/80 bg-sky-950/40 text-sky-300 text-[11px] py-1 px-2.5 rounded-full shadow-inner"
            >
              <Cloud className="h-3 w-3 text-sky-400 animate-pulse" />
              <span>Google Cloud AI</span>
            </Badge>

            {/* Supabase Connection Status Badge */}
            <Badge
              variant={isConfigured ? 'success' : 'secondary'}
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] py-1 px-2.5 rounded-full shadow-inner"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Database className="h-3 w-3" />
              {isConfigured ? 'Supabase Live' : 'Demo DB Synced'}
            </Badge>

            {/* User Info / Sign Out OR Dedicated Login Links */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    {user.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-xs border-rose-800/80 text-rose-300 hover:bg-rose-950/80 hover:border-rose-700 active:scale-95 transition-all shadow-sm"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login?role=Patient">
                  <Button size="sm" variant="gradient" className="text-xs active:scale-95 transition-transform">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Patient Sign In
                  </Button>
                </Link>
                <Link href="/login?role=Pharmacy+Owner">
                  <Button size="sm" variant="outline" className="text-xs border-teal-700 text-teal-300 hover:bg-teal-950/60 active:scale-95 transition-transform">
                    <Store className="h-3.5 w-3.5 mr-1" />
                    Pharmacy Owner Sign In
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
