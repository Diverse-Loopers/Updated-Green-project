import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Shared utility: verifies the incoming request has a valid executive session.
 * Reads the `x-executive-session` header sent by all executive dashboards.
 * Returns { ok: true, executive } on success, or { ok: false, response } on failure.
 *
 * Executive session flow:
 *  1. Client logs in via POST /api/executives/login
 *  2. Server returns the executive object (no password) + a signed session token
 *  3. Client stores token in sessionStorage (NOT localStorage — cleared on tab close)
 *  4. Every subsequent API call sends: Authorization: Bearer <token>
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verifies an executive session token from the Authorization header.
 * Token format: base64(JSON({ id, role, email, exp })) — signed with EXEC_SECRET
 */
export async function verifyExecutiveSession(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
    };
  }

  try {
    // Decode and verify the token
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    // Check expiry (tokens valid for 8 hours)
    if (!payload.exp || Date.now() > payload.exp) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Session expired. Please log in again.' },
          { status: 401 }
        ),
      };
    }

    // Verify the executive still exists and is active in DB
    const { data: exec, error } = await supabase
      .from('executives')
      .select('id, email, name, role, is_active')
      .eq('id', payload.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !exec) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Account not found or deactivated.' },
          { status: 401 }
        ),
      };
    }

    return { ok: true, executive: exec };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid session token.' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Creates a signed session token for an executive.
 * Expires in 8 hours.
 */
export function createExecutiveToken(executive) {
  const payload = {
    id: executive.id,
    email: executive.email,
    role: executive.role,
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours from now
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Simple password hashing using SHA-256 + salt.
 * For production, use bcrypt. This is a significant improvement over plain text.
 */
import { createHash } from 'crypto';

export function hashPassword(password) {
  const salt = process.env.EXEC_PASSWORD_SALT || 'dl-exec-salt-2024';
  return createHash('sha256').update(password + salt).digest('hex');
}

export function verifyPassword(plain, hashed) {
  return hashPassword(plain) === hashed;
}
