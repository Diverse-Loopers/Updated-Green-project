import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createExecutiveToken, verifyPassword, hashPassword } from '@/lib/executive-auth';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Missing Supabase environment variables on server.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Database environment variables (SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL) are missing in Vercel settings.' },
        { status: 500 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Look up executive by email (case-insensitive)
    const { data: exec, error } = await supabase
      .from('executives')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.warn('Executive lookup error for:', cleanEmail, error.message);
      return NextResponse.json(
        { success: false, error: `Database error during login: ${error.message}` },
        { status: 500 }
      );
    }

    if (!exec) {
      console.warn('Executive not found:', cleanEmail);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is explicitly deactivated
    if (exec.is_active === false) {
      return NextResponse.json(
        { success: false, error: 'This executive account is deactivated. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password with multi-salt and plain-text fallback
    const passwordValid = verifyPassword(password, exec.password);

    if (!passwordValid) {
      console.warn('Password verification failed for executive:', cleanEmail);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Auto-upgrade to current standard salted hash if stored format differs
    const standardHash = hashPassword(password);
    if (exec.password !== standardHash) {
      try {
        await supabase
          .from('executives')
          .update({ password: standardHash })
          .eq('id', exec.id);
      } catch (updErr) {
        console.warn('Note: updating executive password hash:', updErr.message);
      }
    }

    // Create a signed session token
    const token = createExecutiveToken(exec);

    // Return executive data WITHOUT the password field
    const { password: _, ...safeExec } = exec;

    return NextResponse.json({
      success: true,
      executive: safeExec,
      token, // Client stores this in sessionStorage and sends as Authorization header
    });

  } catch (err) {
    console.error('Executive login error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
