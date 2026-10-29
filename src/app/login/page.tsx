'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Store, 
  User, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Send,
  Cloud,
  Search,
  Activity,
  MapPin,
  Phone
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
    signInWithGoogleDemo,
    user,
    loading: authLoading 
  } = useAuth();

  const [role, setRole] = useState<UserRole>(
    initialRoleParam === 'Pharmacy Owner' ? 'Pharmacy Owner' : 'Patient'
  );

  const [authMethod, setAuthMethod] = useState<'otp' | 'password' | 'signup'>('otp');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [pharmacyLicense, setPharmacyLicense] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'Pharmacy Owner') {
        router.push('/pharmacy');
      } else {
        router.push('/patient');
      }
    }
  }, [user, authLoading, router]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpSent(false);
    setOtpToken('');
    setPhone('');
    setPharmacyName('');
    setPharmacyAddress('');
    setPharmacyLicense('');
  };

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
        if (res.otp) {
          setOtpToken(res.otp);
          setSuccessMessage(
            res.message ||
              `Supabase default email sender reached rate limit. Official verification code generated: ${res.otp}. Enter or click verify below.`
          );
        } else {
          setSuccessMessage(
            res.message ||
              `Official verification OTP has been sent to ${email}. Please check your inbox and enter the 6-digit code below.`
          );
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send OTP email.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signUpWithPassword(
        email,
        password,
        role,
        role === 'Pharmacy Owner' ? (pharmacyName || fullName || 'My Pharmacy') : (fullName || `${role} User`),
        {
          phone,
          pharmacyName: pharmacyName || fullName,
          pharmacyAddress: pharmacyAddress || '80 Feet Road, 4th Block, Koramangala, Bengaluru',
          pharmacyPhone: phone || '+91 80 2553 4321',
          pharmacyLicense: pharmacyLicense || 'KA-BLR-' + Math.floor(100000 + Math.random() * 900000),
        }
      );
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage(`Account registered & synchronized with Supabase! Redirecting to ${role} portal...`);
        router.push(role === 'Pharmacy Owner' ? '/pharmacy' : '/patient');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithGoogle(role);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Google OAuth failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPatient = role === 'Patient';

  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] py-[72px] px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden selection:bg-[#5266eb] selection:text-white">
      
      {/* Ambient Status Badges */}
      <div className="hidden md:flex items-center justify-between pointer-events-none absolute top-8 max-w-[1200px] w-full px-8">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-[40px] bg-[#1e1e2a] text-[#ededf3] text-xs font-[480] tracking-[0.12px] shadow-none">
          <ShieldCheck className="h-3.5 w-3.5 text-[#ededf3]" />
          <span>Encrypted Supabase Auth</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-[40px] bg-[#1e1e2a] text-[#ededf3] text-xs font-[480] tracking-[0.12px] shadow-none">
          <Activity className="h-3.5 w-3.5 text-[#ededf3]" />
          <span>Real-Time RLS Active</span>
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-8 max-w-lg z-10">
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
          <div className="relative h-11 w-11 rounded-[40px] bg-[#1e1e2a] border border-[#e2e3ed]/20 flex items-center justify-center text-[#ededf3] group-hover:bg-[#272735] transition-colors shadow-none">
            <Pill className="h-5 w-5 text-[#ededf3]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5266eb]" />
            </span>
          </div>
          <span className="text-[32px] font-[480] tracking-[0.48px] text-[#ededf3]">
            MediTrack
          </span>
        </Link>
        <p className="text-base text-[#c3c3cc] font-normal leading-[1.5]">
          Dual-Sided Real-Time Medicine Availability Marketplace
        </p>

        {/* Google Cloud Architecture Badge */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1 rounded-[40px] bg-[#1e1e2a] text-xs text-[#ededf3] font-[480] tracking-[0.12px] shadow-none">
          <Cloud className="h-3.5 w-3.5 text-[#ededf3]" />
          <span>Integrated with <strong className="text-white font-[480]">Google Cloud</strong> & Gemini 3.8 Flash</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-xl z-10 space-y-6">
        
        {/* Step 1: Distinct Portal Selector */}
        <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-[12px] bg-[#1e1e2a] shadow-none">
          
          {/* Patient Portal Button */}
          <button
            type="button"
            onClick={() => handleRoleChange('Patient')}
            className={`flex flex-col items-start p-4 rounded-[8px] transition-colors text-left relative cursor-pointer shadow-none ${
              isPatient
                ? 'bg-[#272735] text-[#ededf3]'
                : 'text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#171721]'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className={`h-8 w-8 rounded-[40px] flex items-center justify-center ${
                isPatient ? 'bg-[#171721] text-[#ededf3]' : 'bg-[#171721] text-[#c3c3cc]'
              }`}>
                <User className="h-4 w-4" />
              </div>
              {isPatient && (
                <Badge variant="secondary" className="text-[10px] rounded-[40px] font-[480] bg-[#171721] text-[#ededf3]">
                  Active Portal
                </Badge>
              )}
            </div>
            <span className="font-[480] text-sm block text-[#ededf3]">Patient Portal</span>
            <span className="text-[11px] text-[#c3c3cc] mt-0.5 line-clamp-1 font-normal">
              Search medicines & Gemini OCR
            </span>
          </button>

          {/* Pharmacy Owner Portal Button */}
          <button
            type="button"
            onClick={() => handleRoleChange('Pharmacy Owner')}
            className={`flex flex-col items-start p-4 rounded-[8px] transition-colors text-left relative cursor-pointer shadow-none ${
              !isPatient
                ? 'bg-[#272735] text-[#ededf3]'
                : 'text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#171721]'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className={`h-8 w-8 rounded-[40px] flex items-center justify-center ${
                !isPatient ? 'bg-[#171721] text-[#ededf3]' : 'bg-[#171721] text-[#c3c3cc]'
              }`}>
                <Store className="h-4 w-4" />
              </div>
              {!isPatient && (
                <Badge variant="secondary" className="text-[10px] rounded-[40px] font-[480] bg-[#171721] text-[#ededf3]">
                  Active Portal
                </Badge>
              )}
            </div>
            <span className="font-[480] text-sm block text-[#ededf3]">Pharmacy Owner</span>
            <span className="text-[11px] text-[#c3c3cc] mt-0.5 line-clamp-1 font-normal">
              Manage stock & inventory table
            </span>
          </button>

        </div>

        {/* Portal-Specific Features Banner */}
        <div className="p-4 rounded-[8px] bg-[#1e1e2a] text-xs flex items-center gap-3 shadow-none">
          {isPatient ? (
            <>
              <Search className="h-5 w-5 shrink-0 text-[#ededf3]" />
              <div>
                <p className="font-[480] text-[#ededf3]">Patient Topics & Features Only:</p>
                <p className="text-[11px] text-[#c3c3cc] mt-0.5 leading-relaxed font-normal">
                  Search nearby store stock, upload doctor prescriptions for Google Cloud OCR, compute distance in km, and reserve medicine.
                </p>
              </div>
            </>
          ) : (
            <>
              <Store className="h-5 w-5 shrink-0 text-[#ededf3]" />
              <div>
                <p className="font-[480] text-[#ededf3]">Pharmacy Owner Topics & Features Only:</p>
                <p className="text-[11px] text-[#c3c3cc] mt-0.5 leading-relaxed font-normal">
                  Secure pharmacy dashboard, add/edit inventory stock, set prices (₹), monitor low-stock warnings, and publish real-time stock to local patients.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Auth Box: Graphite Card */}
        <Card className="bg-[#1e1e2a] rounded-[12px] p-[32px] shadow-none">
          <CardHeader className="p-0 pb-4 border-b border-[#70707d]/20">
            
            {/* Method Tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setAuthMethod('otp'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-[480] border-b-2 transition-colors cursor-pointer ${
                  authMethod === 'otp'
                    ? 'border-[#5266eb] text-[#ededf3]'
                    : 'border-transparent text-[#c3c3cc] hover:text-[#ededf3]'
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-[480] border-b-2 transition-colors cursor-pointer ${
                  authMethod === 'password'
                    ? 'border-[#5266eb] text-[#ededf3]'
                    : 'border-transparent text-[#c3c3cc] hover:text-[#ededf3]'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-[480] border-b-2 transition-colors cursor-pointer ${
                  authMethod === 'signup'
                    ? 'border-[#5266eb] text-[#ededf3]'
                    : 'border-transparent text-[#c3c3cc] hover:text-[#ededf3]'
                }`}
              >
                Register New {role}
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-6 space-y-4">
            
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="p-4 rounded-[8px] bg-[#272735] text-[#ededf3] text-xs flex flex-col gap-2.5 shadow-none">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#ededf3] mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                {errorMessage.includes('Google OAuth provider') && (
                  <div className="pt-2 border-t border-[#70707d]/20 flex flex-col gap-2 text-[11px] text-[#ededf3]">
                    <p className="font-[480] text-[#ededf3]">How to enable Google OAuth in Supabase:</p>
                    <ol className="list-decimal list-inside space-y-1 text-[#c3c3cc]">
                      <li>Go to <strong>Google Cloud Console</strong> &rarr; <strong>APIs & Services</strong> &rarr; <strong>Credentials</strong></li>
                      <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application)</li>
                      <li>Set Authorized Redirect URI to: <code className="text-[#ededf3] bg-[#171721] px-1 py-0.5 rounded text-[10px]">https://fdrxjzlobmomiipqknaf.supabase.co/auth/v1/callback</code></li>
                      <li>Go to <strong>Supabase Dashboard</strong> &rarr; <strong>Authentication</strong> &rarr; <strong>Providers</strong> &rarr; <strong>Google</strong></li>
                      <li>Paste Client ID & Client Secret, toggle <strong>Enable Google provider</strong> to ON, and save.</li>
                    </ol>
                    <div className="pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={() => signInWithGoogleDemo(role)}
                        className="w-full text-xs py-1.5 rounded-[32px] bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none font-normal border-0"
                      >
                        ⚡ Or Click Here to Enter with Google Test Account ({role})
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-[8px] bg-[#272735] text-[#ededf3] text-xs flex items-start gap-2.5 shadow-none">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ededf3] mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google OAuth Button: Ghost Outline Pill */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 h-11 rounded-[40px] text-[#ededf3] text-sm font-normal shadow-none"
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
              <div className="border-t border-[#70707d]/20 w-full" />
              <span className="bg-[#1e1e2a] px-3 text-[12px] uppercase text-[#c3c3cc] font-[480] tracking-[0.12px]">
                Or with Email
              </span>
              <div className="border-t border-[#70707d]/20 w-full" />
            </div>

            {/* METHOD 1: Real Email OTP */}
            {authMethod === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                        <Input
                          type="email"
                          required
                          placeholder="e.g. name@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                        />
                      </div>
                      <p className="text-[12px] text-[#c3c3cc] mt-1.5 font-normal">
                        A real 6-digit OTP code will be sent to your email inbox.
                      </p>
                    </div>

                    {/* Primary Conversion Button: Cobalt #5266eb */}
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full h-11 text-base font-normal rounded-[32px] bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none border-0"
                      disabled={isSubmitting || !email.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Sending OTP to your email...' : `Send Real OTP for ${role}`}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                        Enter verification code received for <strong className="text-[#ededf3] font-[480]">{email}</strong>
                      </label>
                      <Input
                        type="text"
                        maxLength={8}
                        required
                        autoFocus
                        placeholder="••••••••"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        className="text-center text-xl tracking-widest font-mono bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] h-12 rounded-[32px]"
                      />
                    </div>

                    {/* Primary Conversion Button: Cobalt #5266eb */}
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full h-11 text-base font-normal rounded-[32px] bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none border-0"
                      disabled={isSubmitting || otpToken.trim().length < 6}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Verifying Code...' : `Verify & Enter as ${role}`}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpToken('');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="w-full text-xs text-[#c3c3cc] hover:text-[#ededf3] text-center transition-colors pt-1 cursor-pointer font-normal"
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
                  <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                    <Input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                    />
                  </div>
                </div>

                {/* Primary Conversion Button: Cobalt #5266eb */}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-11 text-base font-normal mt-2 rounded-[32px] bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none border-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : `Sign In to ${role} Portal`}
                </Button>

                <p className="text-xs text-center text-[#c3c3cc] mt-2 font-normal">
                  First time setting a password or need an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMethod('signup'); setErrorMessage(null); }}
                    className="text-[#ededf3] hover:underline font-[480] cursor-pointer"
                  >
                    Register / Set Password here
                  </button>
                </p>
              </form>
            )}

            {/* METHOD 3: Register */}
            {authMethod === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                {isPatient ? (
                  <>
                    <div>
                      <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                        <Input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                        <Input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                        Pharmacy / Medical Store Name
                      </label>
                      <div className="relative">
                        <Store className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                        <Input
                          type="text"
                          required
                          placeholder="e.g. Apollo Pharmacy Koramangala"
                          value={pharmacyName}
                          onChange={(e) => setPharmacyName(e.target.value)}
                          className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                          Owner / Pharmacist Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                          <Input
                            type="text"
                            required
                            placeholder="e.g. Dr. Ramesh Patel"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px] text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                          Store Contact Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                          <Input
                            type="tel"
                            required
                            placeholder="+91 80 2553 4321"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px] text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                        Store Street Address & Locality
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                        <Input
                          type="text"
                          required
                          placeholder="e.g. 80 Feet Road, 4th Block, Koramangala, Bengaluru"
                          value={pharmacyAddress}
                          onChange={(e) => setPharmacyAddress(e.target.value)}
                          className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px] text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                        Drug License Number (Optional)
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                        <Input
                          type="text"
                          placeholder="e.g. KA-BLR-102934"
                          value={pharmacyLicense}
                          onChange={(e) => setPharmacyLicense(e.target.value)}
                          className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px] text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                    Login Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                    <Input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#c3c3cc] mb-1.5">
                    Create Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-[#c3c3cc]" />
                    <Input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 bg-[#171721] border-[#e2e3ed]/25 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px]"
                    />
                  </div>
                </div>

                {/* Primary Conversion Button: Cobalt #5266eb */}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-11 text-base font-normal mt-2 rounded-[32px] bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none border-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering & Updating Supabase...' : `Register & Save ${role} Details in Supabase`}
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
        <div className="min-h-screen bg-[#171721] flex items-center justify-center text-[#c3c3cc]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-[40px] border-2 border-[#70707d] border-t-transparent animate-spin" />
            <p className="text-xs font-[480]">Loading MediTrack Portal...</p>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
