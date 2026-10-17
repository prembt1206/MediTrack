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
  ArrowRightLeft
} from 'lucide-react';

export function Navbar() {
  const { user, signOut, switchDemoRole, isConfigured } = useAuth();
  const pathname = usePathname();

  const isPharmacyRoute = pathname?.startsWith('/pharmacy');
  const isPatientRoute = pathname?.startsWith('/patient');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  MediTrack
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                  Realtime Health
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/patient"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isPatientRoute
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Patient Search</span>
              </Link>

              <Link
                href="/pharmacy"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isPharmacyRoute
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Store className="h-4 w-4" />
                <span>Pharmacy Portal</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Center */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Role Switcher (Hackathon MVP Winner UX) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" />
                Switch Role:
              </span>
              <button
                type="button"
                onClick={() => switchDemoRole('Patient')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  user?.role === 'Patient'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => switchDemoRole('Pharmacy Owner')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  user?.role === 'Pharmacy Owner'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Pharmacy Owner
              </button>
            </div>

            {/* Supabase Connection Status Badge */}
            <Badge
              variant={isConfigured ? 'success' : 'secondary'}
              className="hidden sm:inline-flex items-center gap-1"
            >
              <Database className="h-3 w-3" />
              {isConfigured ? 'Supabase Live' : 'Demo DB Synced'}
            </Badge>

            {/* User Info / Sign Out */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {user.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="gradient">
                  Sign In
                </Button>
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
