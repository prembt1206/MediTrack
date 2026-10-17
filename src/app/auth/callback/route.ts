import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role') || 'Patient';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (code && supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = role === 'Pharmacy Owner' ? '/pharmacy' : '/patient';
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  // Redirect to role portal or login
  const redirectUrl = role === 'Pharmacy Owner' ? '/pharmacy' : '/patient';
  return NextResponse.redirect(`${origin}${redirectUrl}`);
}
