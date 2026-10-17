'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Store, 
  User, 
  Mail, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { 
    signInWithPassword, 
    signUpWithPassword, 
    sendOtp, 
    verifyOtp, 
    signInWithGoogle, 
    switchDemoRole,
    loading 
  } = useAuth();

  // Mode: 'login' | 'signup' | 'otp'
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [role, setRole] = useState<UserRole>('Patient');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Handle Returning User (Email & Password)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signInWithPassword(email, password);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Logged in successfully!');
        router.push(role === 'Pharmacy Owner' ? '/pharmacy' : '/patient');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Sign Up with Role
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signUpWithPassword(email, password, role, fullName || 'MediTrack User');
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage(`Account created as ${role}! Redirecting...`);
        router.push(role === 'Pharmacy Owner' ? '/pharmacy' : '/patient');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Email OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await sendOtp(email, role);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setOtpSent(true);
        setSuccessMessage(`OTP code sent to ${email}. Check your inbox! (Demo code: 123456)`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await verifyOtp(email, otpToken, role);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Verified successfully!');
        router.push(role === 'Pharmacy Owner' ? '/pharmacy' : '/patient');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Google OAuth
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle(role);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Google OAuth failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      
      {/* Brand Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 items-center justify-center text-white shadow-xl shadow-emerald-500/25 mb-4">
          <Pill className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Medi<span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Track</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Dual-sided real-time pharmacy inventory & prescription verification
        </p>
      </div>

      {/* Main Authentication Card */}
      <Card className="w-full max-w-lg border-slate-200 shadow-xl dark:border-slate-800">
        <CardHeader className="pb-4">
          
          {/* Role Selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Your Access Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Patient')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  role === 'Patient'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 font-semibold shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">Patient Portal</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Find medicine & OCR
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('Pharmacy Owner')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  role === 'Pharmacy Owner'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 font-semibold shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-teal-600" />
                  <span className="text-sm">Pharmacy Owner</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Manage live stock
                </span>
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-emerald-600 text-emerald-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In (Password)
            </button>
            <button
              onClick={() => { setMode('otp'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                mode === 'otp'
                  ? 'border-emerald-600 text-emerald-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Email OTP (New Users)
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                mode === 'signup'
                  ? 'border-emerald-600 text-emerald-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google as {role}</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs uppercase text-slate-400 font-semibold tracking-wider">
              Or with email
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* MODE 1: Returning User (Password) */}
          {mode === 'login' && (
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating...' : `Sign In to ${role} Portal`}
              </Button>
            </form>
          )}

          {/* MODE 2: Email OTP */}
          {mode === 'otp' && (
            <div className="space-y-3.5">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email Address for One-Time Password
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Sending OTP...' : `Send OTP for ${role}`}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit OTP received on {email}
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="text-center text-lg tracking-widest font-mono"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Verifying...' : `Verify & Enter as ${role}`}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-xs text-slate-500 hover:text-slate-800 text-center"
                  >
                    Resend code or change email
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 3: Register / Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Pharmacy Name
                </label>
                <Input
                  type="text"
                  required
                  placeholder={role === 'Pharmacy Owner' ? 'e.g. Apollo Pharmacy Koramangala' : 'e.g. Rahul Sharma'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Create Password (min 6 chars)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : `Register as ${role}`}
              </Button>
            </form>
          )}

        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          {/* Quick Demo Fast Pass for Hackathon Judges */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Hackathon 1-Click Fast Pass Logins:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => switchDemoRole('Pharmacy Owner')}
                className="text-xs justify-start border-teal-200 hover:bg-teal-50 hover:text-teal-800"
              >
                <Store className="h-3.5 w-3.5 text-teal-600 mr-1.5" />
                Apollo Pharmacy Owner
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => switchDemoRole('Patient')}
                className="text-xs justify-start border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <User className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                Patient Demo User
              </Button>
            </div>
          </div>

        </CardFooter>
      </Card>
    </div>
  );
}
