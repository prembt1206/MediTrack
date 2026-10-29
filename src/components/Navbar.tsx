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
  Cloud,
  FileText,
  PackagePlus,
  User,
  Database
} from 'lucide-react';

export function Navbar() {
  const { user, signOut, isConfigured } = useAuth();
  const pathname = usePathname();

  const isPatient = user?.role === 'Patient';
  const isOwner = user?.role === 'Pharmacy Owner';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#393737]/10 bg-[#f7f7f7]/90 backdrop-blur-md transition-colors shadow-none">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-6">
            <Link href={isOwner ? '/pharmacy' : '/patient'} className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 flex items-center justify-center text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)] group-hover:bg-[#f7f7f7] transition-colors">
                <Pill className="h-4 w-4 text-[#393737]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#393737]" />
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-serif font-normal text-xl tracking-[-0.5px] text-[#393737] group-hover:text-[#1e1d1d] transition-colors">
                  MediTrack
                </span>
                {user && (
                  <span className="text-[11px] font-sans font-normal uppercase px-3 py-1 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                    {isPatient ? 'Patient Portal' : 'Owner Portal'}
                  </span>
                )}
              </div>
            </Link>

            {/* Strict Role-Specific Navigation Links — Ghost Nav Link with Underline */}
            <nav className="hidden md:flex items-center gap-2">
              
              {/* If PATIENT: Show ONLY Patient topics */}
              {isPatient && (
                <>
                  <Link
                    href="/patient"
                    className={`relative flex items-center gap-2 px-4 py-2 text-base font-normal font-sans transition-colors ${
                      pathname === '/patient'
                        ? 'text-[#393737] font-semibold after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#393737]'
                        : 'text-[#888787] hover:text-[#393737]'
                    }`}
                  >
                    <Search className="h-4 w-4" />
                    <span>Find Medicine</span>
                  </Link>
                  <Link
                    href="/patient"
                    className="relative flex items-center gap-2 px-4 py-2 text-base font-normal font-sans text-[#888787] hover:text-[#393737] transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Prescription OCR</span>
                  </Link>
                </>
              )}

              {/* If PHARMACY OWNER: Show ONLY Owner topics */}
              {isOwner && (
                <>
                  <Link
                    href="/pharmacy"
                    className={`relative flex items-center gap-2 px-4 py-2 text-base font-normal font-sans transition-colors ${
                      pathname === '/pharmacy'
                        ? 'text-[#393737] font-semibold after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#393737]'
                        : 'text-[#888787] hover:text-[#393737]'
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    <span>Store Inventory</span>
                  </Link>
                  <Link
                    href="/pharmacy"
                    className="relative flex items-center gap-2 px-4 py-2 text-base font-normal font-sans text-[#888787] hover:text-[#393737] transition-colors"
                  >
                    <PackagePlus className="h-4 w-4" />
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
              variant="secondary"
              className="hidden lg:inline-flex items-center gap-1.5 border-[#393737]/15 bg-[#ffffff] text-[#393737] text-[11px] py-1 px-3.5 rounded-[100px] font-sans shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <Cloud className="h-3.5 w-3.5 text-[#393737]" />
              <span>Google Cloud AI</span>
            </Badge>

            {/* Supabase Connection Status Badge */}
            <Badge
              variant="default"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] py-1 px-3.5 rounded-[100px] font-sans bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConfigured ? 'bg-[#393737]' : 'bg-[#888787]'}`} />
              <Database className="h-3.5 w-3.5 text-[#393737]" />
              <span>{isConfigured ? 'Supabase Live' : 'Demo DB Synced'}</span>
            </Badge>

            {/* User Info / Sign Out OR Dedicated Login Links */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-[#393737] leading-tight font-sans">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-[#888787] font-sans">
                    {user.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-xs text-[#393737] rounded-[100px]"
                >
                  <LogOut className="h-3.5 w-3.5 text-[#393737]" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login?role=Patient">
                  <Button size="sm" variant="default" className="text-sm px-5 h-9 rounded-[100px]">
                    <User className="h-4 w-4 mr-1.5" />
                    Patient Sign In
                  </Button>
                </Link>
                <Link href="/login?role=Pharmacy+Owner">
                  <Button size="sm" variant="secondary" className="text-sm px-5 h-9 rounded-[100px]">
                    <Store className="h-4 w-4 mr-1.5 text-[#393737]" />
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
