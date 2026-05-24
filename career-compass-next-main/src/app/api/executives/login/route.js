import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createExecutiveToken, verifyPassword, hashPassword } from '@/lib/executive-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Look up executive
    const { data: exec, error } = await supabase
      .from('executives')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !exec) {
      // Generic error — don't reveal whether email exists
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Support both legacy plain-text passwords and new hashed passwords.
    // If the stored password doesn't look like a SHA-256 hex (64 chars),
    // treat it as plain text and auto-migrate to hashed on first successful login.
    const isLegacyPlainText = exec.password && exec.password.length !== 64;
    let passwordValid = false;

    if (isLegacyPlainText) {
      // Legacy plain-text comparison
      passwordValid = exec.password === password;
      if (passwordValid) {
        // Auto-migrate to hashed password
        const hashed = hashPassword(password);
        await supabase
          .from('executives')
          .update({ password: hashed })
          .eq('id', exec.id);
      }
    } else {
      // Hashed password comparison
      passwordValid = verifyPassword(password, exec.password);
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
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
