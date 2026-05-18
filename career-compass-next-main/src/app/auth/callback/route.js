import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Auth callback handler for Supabase PKCE flow.
 * Supabase sends: /auth/callback?code=xxx&next=/update-password
 * This route exchanges the code for a session, then redirects.
 */
export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/';
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Handle PKCE flow (code exchange)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Handle token_hash flow (older Supabase or email links with hash)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Fallback: redirect to error page
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
