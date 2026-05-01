import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Look up executive
    const { data: exec, error } = await supabase
      .from('executives')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !exec) {
      return NextResponse.json({ success: false, error: 'Invalid email or account not found' }, { status: 401 });
    }

    // Simple password check (stored as plain text for now — in production use bcrypt)
    if (exec.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    // Return executive data (without password)
    const { password: _, ...safeExec } = exec;
    return NextResponse.json({ success: true, executive: safeExec });

  } catch (err) {
    console.error('Executive login error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
