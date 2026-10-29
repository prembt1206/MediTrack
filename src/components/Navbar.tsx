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
    <header className="sticky top-0 z-40 w-full border-b border-[#70707d]/25 bg-[#171721] transition-colors shadow-none">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-6">
            <Link href={isOwner ? '/pharmacy' : '/patient'} className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-full bg-[#1e1e2a] border border-[#70707d]/30 flex items-center justify-center text-[#ededf3] group-hover:border-[#70707d]/60 group-hover:bg-[#242432] transition-colors">
                <Pill className="h-4 w-4 text-[#ededf3]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70707d]" />
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-medium text-lg tracking-[0.015em] text-[#ededf3] group-hover:text-white transition-colors">
                  MediTrack
                </span>
                {user && (
                  <span className="text-[10px] font-normal tracking-wide uppercase px-2.5 py-0.5 rounded-full border border-[#70707d]/30 bg-[#1e1e2a] text-[#c3c3cc]">
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
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-normal tracking-[0.005em] transition-colors ${
                      pathname === '/patient'
                        ? 'bg-[#242432] text-[#ededf3] border border-[#70707d]/40'
                        : 'text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#1e1e2a]'
                    }`}
                  >
                    <Search className="h-3.5 w-3.5 text-[#c3c3cc]" />
                    <span>Find Medicine</span>
                  </Link>
                  <Link
                    href="/patient"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-normal tracking-[0.005em] text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#1e1e2a] transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#c3c3cc]" />
                    <span>Prescription OCR</span>
                  </Link>
                </>
              )}

              {/* If PHARMACY OWNER: Show ONLY Owner topics */}
              {isOwner && (
                <>
                  <Link
                    href="/pharmacy"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-normal tracking-[0.005em] transition-colors ${
                      pathname === '/pharmacy'
                        ? 'bg-[#242432] text-[#ededf3] border border-[#70707d]/40'
                        : 'text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#1e1e2a]'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5 text-[#c3c3cc]" />
                    <span>Store Inventory</span>
                  </Link>
                  <Link
                    href="/pharmacy"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-normal tracking-[0.005em] text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#1e1e2a] transition-colors"
                  >
                    <PackagePlus className="h-3.5 w-3.5 text-[#c3c3cc]" />
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
              className="hidden lg:inline-flex items-center gap-1.5 border-[#70707d]/30 bg-[#1e1e2a] text-[#c3c3cc] text-[11px] py-1 px-3 rounded-full font-normal shadow-none"
            >
              <Cloud className="h-3 w-3 text-[#c3c3cc]" />
              <span>Google Cloud AI</span>
            </Badge>

            {/* Supabase Connection Status Badge */}
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] py-1 px-3 rounded-full font-normal border-[#70707d]/30 bg-[#1e1e2a] text-[#c3c3cc] shadow-none"
            >
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConfigured ? 'bg-[#ededf3]' : 'bg-[#70707d]'}`} />
              <Database className="h-3 w-3 text-[#c3c3cc]" />
              <span>{isConfigured ? 'Supabase Live' : 'Demo DB Synced'}</span>
            </Badge>

            {/* User Info / Sign Out OR Dedicated Login Links */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-[#ededf3] leading-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-[#c3c3cc]">
                    {user.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-xs text-[#c3c3cc] hover:text-[#ededf3] border-[#70707d]/30 rounded-full"
                >
                  <LogOut className="h-3.5 w-3.5 text-[#c3c3cc]" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login?role=Patient">
                  <Button size="sm" variant="default" className="text-xs px-3.5 h-8 rounded-full">
                    <User className="h-3.5 w-3.5 mr-1" />
                    Patient Sign In
                  </Button>
                </Link>
                <Link href="/login?role=Pharmacy+Owner">
                  <Button size="sm" variant="outline" className="text-xs px-3.5 h-8 rounded-full border-[#70707d]/35">
                    <Store className="h-3.5 w-3.5 mr-1 text-[#c3c3cc]" />
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
