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
    <header className="sticky top-0 z-40 w-full border-b border-[#70707d]/20 bg-[#171721]/90 backdrop-blur-md transition-colors shadow-none">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-6">
            <Link href={isOwner ? '/pharmacy' : '/patient'} className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-[40px] bg-[#1e1e2a] border border-[#e2e3ed]/20 flex items-center justify-center text-[#ededf3] group-hover:bg-[#272735] transition-colors">
                <Pill className="h-4 w-4 text-[#ededf3]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5266eb]" />
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-[480] text-lg tracking-[0.015em] text-[#ededf3] group-hover:text-white transition-colors">
                  MediTrack
                </span>
                {user && (
                  <span className="text-[12px] font-[480] tracking-[0.12px] uppercase px-3 py-1 rounded-[40px] bg-[#272735] text-[#ededf3]">
                    {isPatient ? 'Patient Portal' : 'Owner Portal'}
                  </span>
                )}
              </div>
            </Link>

            {/* Strict Role-Specific Navigation Links — Navigation Pill Link */}
            <nav className="hidden md:flex items-center gap-1.5">
              
              {/* If PATIENT: Show ONLY Patient topics */}
              {isPatient && (
                <>
                  <Link
                    href="/patient"
                    className={`flex items-center gap-2 px-5 py-2 rounded-[40px] text-base font-normal transition-colors ${
                      pathname === '/patient'
                        ? 'bg-[#272735] text-[#ededf3]'
                        : 'text-[#ededf3] hover:bg-[#272735]/60'
                    }`}
                  >
                    <Search className="h-4 w-4 text-[#ededf3]" />
                    <span>Find Medicine</span>
                  </Link>
                  <Link
                    href="/patient"
                    className="flex items-center gap-2 px-5 py-2 rounded-[40px] text-base font-normal text-[#ededf3] hover:bg-[#272735]/60 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-[#ededf3]" />
                    <span>Prescription OCR</span>
                  </Link>
                </>
              )}

              {/* If PHARMACY OWNER: Show ONLY Owner topics */}
              {isOwner && (
                <>
                  <Link
                    href="/pharmacy"
                    className={`flex items-center gap-2 px-5 py-2 rounded-[40px] text-base font-normal transition-colors ${
                      pathname === '/pharmacy'
                        ? 'bg-[#272735] text-[#ededf3]'
                        : 'text-[#ededf3] hover:bg-[#272735]/60'
                    }`}
                  >
                    <Store className="h-4 w-4 text-[#ededf3]" />
                    <span>Store Inventory</span>
                  </Link>
                  <Link
                    href="/pharmacy"
                    className="flex items-center gap-2 px-5 py-2 rounded-[40px] text-base font-normal text-[#ededf3] hover:bg-[#272735]/60 transition-colors"
                  >
                    <PackagePlus className="h-4 w-4 text-[#ededf3]" />
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
              className="hidden lg:inline-flex items-center gap-1.5 border-[#e2e3ed]/20 bg-transparent text-[#ededf3] text-[12px] py-1 px-3.5 rounded-[40px] font-[480] shadow-none"
            >
              <Cloud className="h-3.5 w-3.5 text-[#ededf3]" />
              <span>Google Cloud AI</span>
            </Badge>

            {/* Supabase Connection Status Badge */}
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] py-1 px-3.5 rounded-[40px] font-[480] bg-[#272735] text-[#ededf3] shadow-none"
            >
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConfigured ? 'bg-[#5266eb]' : 'bg-[#70707d]'}`} />
              <Database className="h-3.5 w-3.5 text-[#ededf3]" />
              <span>{isConfigured ? 'Supabase Live' : 'Demo DB Synced'}</span>
            </Badge>

            {/* User Info / Sign Out OR Dedicated Login Links */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-[480] text-[#ededf3] leading-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[12px] text-[#c3c3cc]">
                    {user.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-xs text-[#ededf3] rounded-[40px]"
                >
                  <LogOut className="h-3.5 w-3.5 text-[#ededf3]" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login?role=Patient">
                  <Button size="sm" variant="default" className="text-sm px-5 h-9 rounded-[32px]">
                    <User className="h-4 w-4 mr-1.5" />
                    Patient Sign In
                  </Button>
                </Link>
                <Link href="/login?role=Pharmacy+Owner">
                  <Button size="sm" variant="outline" className="text-sm px-5 h-9 rounded-[40px]">
                    <Store className="h-4 w-4 mr-1.5 text-[#ededf3]" />
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
