'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { dataService } from '@/lib/supabase/data-service';
import { Profile, UserRole } from '@/types/database';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserSession | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string, role: UserRole, fullName: string) => Promise<{ error?: string }>;
  sendOtp: (email: string, role?: UserRole) => Promise<{ error?: string }>;
  verifyOtp: (email: string, token: string, role: UserRole) => Promise<{ error?: string }>;
  signInWithGoogle: (role: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from storage or Supabase session
  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const prof = await dataService.getProfile(session.user.id);
            const userRole = (prof?.role || (session.user.user_metadata?.role as UserRole) || 'Patient');
            const fullName = prof?.full_name || (session.user.user_metadata?.full_name as string) || session.user.email?.split('@')[0] || 'User';

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName,
              role: userRole,
            });
            setProfile(prof || { id: session.user.id, role: userRole, full_name: fullName, phone: null });
          } else {
            // Check demo session
            loadSavedDemoSession();
          }

          // Listen to auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const prof = await dataService.getProfile(session.user.id);
              const userRole = (prof?.role || (session.user.user_metadata?.role as UserRole) || 'Patient');
              const fullName = prof?.full_name || (session.user.user_metadata?.full_name as string) || 'User';

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                fullName,
                role: userRole,
              });
              setProfile(prof || { id: session.user.id, role: userRole, full_name: fullName, phone: null });
            } else {
              setUser(null);
              setProfile(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          loadSavedDemoSession();
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        loadSavedDemoSession();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  function loadSavedDemoSession() {
    try {
      const saved = localStorage.getItem('meditrack_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setProfile({
          id: parsed.id,
          role: parsed.role,
          full_name: parsed.fullName,
          phone: '+91 9876543210',
        });
      } else {
        // Default hackathon initial state: demo patient
        const defaultUser: UserSession = {
          id: 'patient-demo-1',
          email: 'patient@meditrack.org',
          fullName: 'Rahul Sharma (Patient)',
          role: 'Patient',
        };
        setUser(defaultUser);
        setProfile({
          id: defaultUser.id,
          role: defaultUser.role,
          full_name: defaultUser.fullName,
          phone: '+91 9823456789',
        });
        localStorage.setItem('meditrack_current_user', JSON.stringify(defaultUser));
      }
    } catch {
      // fallback
    }
  }

  // 1. Email / Password Sign In
  const signInWithPassword = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const prof = await dataService.getProfile(data.user.id);
          const role = prof?.role || (data.user.user_metadata?.role as UserRole) || 'Patient';
          const sessionUser: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: prof?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
            role,
          };
          setUser(sessionUser);
          setProfile(prof);
          localStorage.setItem('meditrack_current_user', JSON.stringify(sessionUser));
          return {};
        }
      }

      // Demo fallback login
      const role: UserRole = email.toLowerCase().includes('pharmacy') ? 'Pharmacy Owner' : 'Patient';
      const id = role === 'Pharmacy Owner' ? 'owner-apollo-1' : 'patient-demo-1';
      const sessionUser: UserSession = {
        id,
        email,
        fullName: role === 'Pharmacy Owner' ? 'Apollo Store Manager' : 'Rahul Sharma (Patient)',
        role,
      };
      setUser(sessionUser);
      localStorage.setItem('meditrack_current_user', JSON.stringify(sessionUser));
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // 2. Email / Password Sign Up
  const signUpWithPassword = async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            role,
            full_name: fullName,
            phone: null,
          };
          await dataService.saveProfile(newProfile);

          const sessionUser: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            fullName,
            role,
          };
          setUser(sessionUser);
          setProfile(newProfile);
          localStorage.setItem('meditrack_current_user', JSON.stringify(sessionUser));
          return {};
        }
      }

      // Demo signup
      const newId = 'user-' + Math.random().toString(36).substring(2, 9);
      const sessionUser: UserSession = {
        id: newId,
        email,
        fullName,
        role,
      };
      setUser(sessionUser);
      setProfile({
        id: newId,
        role,
        full_name: fullName,
        phone: null,
      });
      localStorage.setItem('meditrack_current_user', JSON.stringify(sessionUser));
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // 3. Email OTP (for new users)
  const sendOtp = async (email: string, role: UserRole = 'Patient'): Promise<{ error?: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: { role },
          },
        });
        if (error) throw error;
        return {};
      }
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      return { error: message };
    }
  };

  const verifyOtp = async (email: string, token: string, role: UserRole): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });
        if (error) throw error;
        if (data.user) {
          const prof = await dataService.getProfile(data.user.id);
          const userRole = prof?.role || role;
          const sessionUser: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: prof?.full_name || email.split('@')[0],
            role: userRole,
          };
          setUser(sessionUser);
          localStorage.setItem('meditrack_current_user', JSON.stringify(sessionUser));
          return {};
        }
      }

      // Demo OTP verify
      const newId = 'otp-user-' + Math.random().toString(36).substring(2, 9);
      const sessionUser: UserSession = {
        id: newId,
        email,
        fullName: email.split('@')[0],
        role,
      };
      setUser(sessionUser);
      localStorage.setItem('meditrack_current_user', JSON.stringify(sessionUser));
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // 4. Google OAuth
  const signInWithGoogle = async (role: UserRole): Promise<{ error?: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });
        if (error) throw error;
        return {};
      }

      // Demo simulation
      const googleUser: UserSession = {
        id: 'google-user-' + Math.random().toString(36).substring(2, 8),
        email: 'alex.google@meditrack.org',
        fullName: 'Alex Google User',
        role,
      };
      setUser(googleUser);
      localStorage.setItem('meditrack_current_user', JSON.stringify(googleUser));
      router.push(role === 'Pharmacy Owner' ? '/pharmacy' : '/patient');
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      return { error: message };
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('meditrack_current_user');
      setUser(null);
      setProfile(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Switch role for quick testing & hackathon demonstration
  const switchDemoRole = (role: UserRole) => {
    const isOwner = role === 'Pharmacy Owner';
    const updatedUser: UserSession = {
      id: isOwner ? 'owner-apollo-1' : 'patient-demo-1',
      email: isOwner ? 'apollo.owner@meditrack.org' : 'patient@meditrack.org',
      fullName: isOwner ? 'Apollo Pharmacy Manager' : 'Rahul Sharma (Patient)',
      role,
    };
    setUser(updatedUser);
    setProfile({
      id: updatedUser.id,
      role,
      full_name: updatedUser.fullName,
      phone: '+91 9876543210',
    });
    localStorage.setItem('meditrack_current_user', JSON.stringify(updatedUser));
    router.push(isOwner ? '/pharmacy' : '/patient');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithPassword,
        signUpWithPassword,
        sendOtp,
        verifyOtp,
        signInWithGoogle,
        signOut,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
