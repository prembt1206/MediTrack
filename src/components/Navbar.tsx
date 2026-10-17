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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-6">
            <Link href={isOwner ? '/pharmacy' : '/patient'} className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                    MediTrack
                  </span>
                  {user && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isPatient
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-teal-950 text-teal-300 border-teal-800'
                    }`}>
                      {isPatient ? 'Patient Portal' : 'Owner Portal'}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Strict Role-Specific Navigation Links (NO COMBINING) */}
            <nav className="hidden md:flex items-center gap-1.5">
              
              {/* If PATIENT: Show ONLY Patient topics */}
              {isPatient && (
                <>
                  <Link
                    href="/patient"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/patient'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Search className="h-4 w-4 text-emerald-400" />
                    <span>Find Medicine</span>
                  </Link>
                  <Link
                    href="/patient"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span>Prescription OCR</span>
                  </Link>
                </>
              )}

              {/* If PHARMACY OWNER: Show ONLY Owner topics */}
              {isOwner && (
                <>
                  <Link
                    href="/pharmacy"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/pharmacy'
                        ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Store className="h-4 w-4 text-teal-400" />
                    <span>Store Inventory</span>
                  </Link>
                  <Link
                    href="/pharmacy"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                  >
                    <PackagePlus className="h-4 w-4 text-teal-400" />
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
              className="hidden lg:inline-flex items-center gap-1.5 border-sky-800/80 bg-sky-950/40 text-sky-300 text-[11px] py-1 px-2.5"
            >
              <Cloud className="h-3 w-3 text-sky-400" />
              <span>Google Cloud AI</span>
            </Badge>

            {/* Supabase Connection Status Badge */}
            <Badge
              variant={isConfigured ? 'success' : 'secondary'}
              className="hidden sm:inline-flex items-center gap-1 text-[11px]"
            >
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
                  className="flex items-center gap-1 text-xs border-rose-800 text-rose-300 hover:bg-rose-950/60"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login?role=Patient">
                  <Button size="sm" variant="gradient" className="text-xs">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Patient Sign In
                  </Button>
                </Link>
                <Link href="/login?role=Pharmacy+Owner">
                  <Button size="sm" variant="outline" className="text-xs border-teal-700 text-teal-300 hover:bg-teal-950/50">
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
