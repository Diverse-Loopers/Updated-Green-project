import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/executive-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/executives/reset-password
 * Public endpoint to reset an executive's password.
 * Secured by requiring the SUPABASE_SERVICE_ROLE_KEY as a master secret.
 * 
 * Body: { email, new_password, master_key }
 */
export async function POST(req) {
  try {
    const { email, new_password, master_key } = await req.json();

    if (!email || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Email and new_password are required' },
        { status: 400 }
      );
    }

    // Verify master key — must match the service role key
    if (master_key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid master key' },
        { status: 403 }
      );
    }

    // Find the executive
    const { data: exec, error: findErr } = await supabase
      .from('executives')
      .select('id, email, name, role')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (findErr || !exec) {
      return NextResponse.json(
        { success: false, error: 'Executive not found with this email' },
        { status: 404 }
      );
    }

    // Hash and store the new password
    const hashed = hashPassword(new_password);
    const { error: updateErr } = await supabase
      .from('executives')
      .update({ password: hashed })
      .eq('id', exec.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `Password reset successful for ${exec.name} (${exec.email})`,
    });

  } catch (err) {
    console.error('Password reset error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
