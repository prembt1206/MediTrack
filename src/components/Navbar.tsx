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
    <header className="sticky top-0 z-40 w-full border-b border-[#333336]/80 bg-black/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-6">
            <Link href={isOwner ? '/pharmacy' : '/patient'} className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-xl bg-[#1d1d1f] border border-[#333336] flex items-center justify-center text-[#f5f5f7] group-hover:border-[#424245] group-hover:bg-[#2c2c2e] active:scale-95 transition-all duration-200">
                <Pill className="h-4 w-4 text-[#2997ff]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2997ff]" />
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-lg tracking-tight text-white group-hover:text-[#f5f5f7] transition-colors">
                  MediTrack
                </span>
                {user && (
                  <span className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full border border-[#333336] bg-[#1d1d1f] text-[#2997ff]">
                    {isPatient ? 'Patient Portal' : 'Owner Portal'}
                  </span>
                )}
              </div>
            </Link>

            {/* Strict Role-Specific Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              
              {/* If PATIENT: Show ONLY Patient topics */}
              {isPatient && (
                <>
                  <Link
                    href="/patient"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all ${
                      pathname === '/patient'
                        ? 'bg-[#1d1d1f] text-white border border-[#424245]'
                        : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1d1d1f]/60'
                    }`}
                  >
                    <Search className="h-3.5 w-3.5 text-[#2997ff]" />
                    <span>Find Medicine</span>
                  </Link>
                  <Link
                    href="/patient"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1d1d1f]/60 transition-all"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#2997ff]" />
                    <span>Prescription OCR</span>
                  </Link>
                </>
              )}

              {/* If PHARMACY OWNER: Show ONLY Owner topics */}
              {isOwner && (
                <>
                  <Link
                    href="/pharmacy"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all ${
                      pathname === '/pharmacy'
                        ? 'bg-[#1d1d1f] text-white border border-[#424245]'
                        : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1d1d1f]/60'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5 text-[#2997ff]" />
                    <span>Store Inventory</span>
                  </Link>
                  <Link
                    href="/pharmacy"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1d1d1f]/60 transition-all"
                  >
                    <PackagePlus className="h-3.5 w-3.5 text-[#2997ff]" />
                    <span>Add Stock</span>
                  </Link>
                </>
              )}

            </nav>
          </div>

          {/* Right Action Center */}
          <div className="flex items-center gap-2.5">
            
            {/* Google Cloud Badge */}
            <Badge
              variant="outline"
              className="hidden lg:inline-flex items-center gap-1.5 border-[#333336] bg-[#1d1d1f] text-[#86868b] text-[11px] py-1 px-3 rounded-full font-medium"
            >
              <Cloud className="h-3 w-3 text-[#2997ff]" />
              <span>Google Cloud AI</span>
            </Badge>

            {/* Supabase Connection Status Badge */}
            <Badge
              variant={isConfigured ? 'success' : 'secondary'}
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] py-1 px-3 rounded-full font-medium"
            >
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConfigured ? 'bg-[#30d158]' : 'bg-[#86868b]'}`} />
              <Database className="h-3 w-3" />
              <span>{isConfigured ? 'Supabase Live' : 'Demo DB Synced'}</span>
            </Badge>

            {/* User Info / Sign Out OR Dedicated Login Links */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-white leading-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-[#86868b]">
                    {user.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#ff453a] hover:border-[#ff453a]/40"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login?role=Patient">
                  <Button size="sm" variant="default" className="text-xs px-3.5 h-8">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Patient Sign In
                  </Button>
                </Link>
                <Link href="/login?role=Pharmacy+Owner">
                  <Button size="sm" variant="outline" className="text-xs px-3.5 h-8">
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
