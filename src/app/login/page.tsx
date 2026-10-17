'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
  Send,
  Cloud,
  Search,
  ScanText,
  Activity
} from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');

  const { 
    signInWithPassword, 
    signUpWithPassword, 
    sendOtp, 
    verifyOtp, 
    signInWithGoogle, 
    user,
    loading: authLoading 
  } = useAuth();

  // Primary Role differentiation: 'Patient' vs 'Pharmacy Owner'
  const [role, setRole] = useState<UserRole>(
    initialRoleParam === 'Pharmacy Owner' ? 'Pharmacy Owner' : 'Patient'
  );

  // Authentication method inside selected portal: 'otp' | 'password' | 'signup'
  const [authMethod, setAuthMethod] = useState<'otp' | 'password' | 'signup'>('otp');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated with that role, redirect to matching portal
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'Pharmacy Owner') {
        router.push('/pharmacy');
      } else {
        router.push('/patient');
      }
    }
  }, [user, authLoading, router]);

  // Reset alert states when switching role or method
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpSent(false);
    setOtpToken('');
  };

  // 1. Send Real Email OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await sendOtp(email, role);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setOtpSent(true);
        setSuccessMessage(`Official verification OTP has been sent to ${email}. Please check your inbox and enter the 6-digit code below.`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send OTP email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Verify Real OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await verifyOtp(email, otpToken, role);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Email verified successfully! Redirecting to your portal...');
        router.push(role === 'Pharmacy Owner' ? '/pharmacy' : '/patient');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid OTP. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Email & Password Sign In
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

  // 4. Sign Up / Register
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signUpWithPassword(email, password, role, fullName || `${role} User`);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage(`Account created as ${role}! Redirecting to portal...`);
        router.push(role === 'Pharmacy Owner' ? '/pharmacy' : '/patient');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Google OAuth
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

  const isPatient = role === 'Patient';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 max-w-lg z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Pill className="h-6 w-6" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            MediTrack
          </span>
        </Link>
        <p className="text-sm text-slate-400">
          Dual-Sided Real-Time Medicine Availability Marketplace
        </p>

        {/* Google Cloud Architecture Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Cloud className="h-3.5 w-3.5 text-sky-400" />
          <span>Integrated with <strong>Google Cloud</strong> & Gemini 3.8 Flash</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-xl z-10 space-y-6">
        
        {/* Step 1: Distinct Portal Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          
          {/* Patient Portal Button */}
          <button
            type="button"
            onClick={() => handleRoleChange('Patient')}
            className={`flex flex-col items-start p-4 rounded-xl transition-all text-left relative ${
              isPatient
                ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'border-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                isPatient ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                <User className="h-4 w-4" />
              </div>
              {isPatient && (
                <Badge variant="success" className="text-[10px]">
                  Active Portal
                </Badge>
              )}
            </div>
            <span className="font-bold text-sm block text-white">Patient Portal</span>
            <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Search medicines & Gemini OCR
            </span>
          </button>

          {/* Pharmacy Owner Portal Button */}
          <button
            type="button"
            onClick={() => handleRoleChange('Pharmacy Owner')}
            className={`flex flex-col items-start p-4 rounded-xl transition-all text-left relative ${
              !isPatient
                ? 'bg-gradient-to-br from-teal-950/80 to-slate-900 border-2 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                : 'border-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                !isPatient ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                <Store className="h-4 w-4" />
              </div>
              {!isPatient && (
                <Badge variant="purple" className="text-[10px]">
                  Active Portal
                </Badge>
              )}
            </div>
            <span className="font-bold text-sm block text-white">Pharmacy Owner</span>
            <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Manage stock & inventory table
            </span>
          </button>

        </div>

        {/* Portal-Specific Features Banner (Explaining exact topics the user gets) */}
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 transition-colors ${
          isPatient
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            : 'bg-teal-950/40 border-teal-800/60 text-teal-200'
        }`}>
          {isPatient ? (
            <>
              <Search className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-100">Patient Topics & Features Only:</p>
                <p className="text-[11px] text-emerald-300/80">
                  Search nearby store stock, upload doctor prescriptions for Google Cloud OCR, compute distance in km, and reserve medicine.
                </p>
              </div>
            </>
          ) : (
            <>
              <Store className="h-5 w-5 shrink-0 text-teal-400" />
              <div>
                <p className="font-semibold text-teal-100">Pharmacy Owner Topics & Features Only:</p>
                <p className="text-[11px] text-teal-300/80">
                  Secure pharmacy dashboard, add/edit inventory stock, set prices (₹), monitor low-stock warnings, and publish real-time stock to local patients.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Auth Box */}
        <Card className="border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            
            {/* Method Tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setAuthMethod('otp'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  authMethod === 'otp'
                    ? isPatient ? 'border-emerald-500 text-emerald-400' : 'border-teal-500 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  authMethod === 'password'
                    ? isPatient ? 'border-emerald-500 text-emerald-400' : 'border-teal-500 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  authMethod === 'signup'
                    ? isPatient ? 'border-emerald-500 text-emerald-400' : 'border-teal-500 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Register New {role}
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-2.5 border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                Or with Email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* METHOD 1: Real Email OTP */}
            {authMethod === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input
                          type="email"
                          required
                          placeholder="e.g. name@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 bg-slate-800/90 border-slate-700 text-white"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        A real 6-digit OTP code will be sent to your email inbox.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full"
                      disabled={isSubmitting || !email.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Sending OTP to your email...' : `Send Real OTP for ${role}`}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Enter 6-Digit OTP received on <strong>{email}</strong>
                      </label>
                      <Input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="••••••"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        className="text-center text-xl tracking-widest font-mono bg-slate-800/90 border-slate-700 text-white h-12"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full"
                      disabled={isSubmitting || otpToken.length < 6}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Verifying OTP...' : `Verify & Enter as ${role}`}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpToken('');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="w-full text-xs text-slate-400 hover:text-white text-center transition-colors"
                    >
                      Wrong email? Click here to change email or resend
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: Password Sign In */}
            {authMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-slate-800/90 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-slate-800/90 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : `Sign In to ${role} Portal`}
                </Button>
              </form>
            )}

            {/* METHOD 3: Register */}
            {authMethod === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isPatient ? 'Your Full Name' : 'Pharmacy Store Name'}
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder={isPatient ? 'e.g. Rahul Sharma' : 'e.g. Apollo Pharmacy Koramangala'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-800/90 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-slate-800/90 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-slate-800/90 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : `Create ${role} Account`}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-xs">Loading MediTrack Portal...</p>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
