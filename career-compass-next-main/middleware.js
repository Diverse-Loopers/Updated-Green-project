import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Routes that require business auth
const BUSINESS_PROTECTED = ['/products/dashboard', '/products/loopmail/app'];
// Routes that are public within /products
const BUSINESS_PUBLIC = ['/products/login', '/products/loopmail/pricing', '/products/loopmail'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Only protect /products/* routes (except public ones)
    const isBusinessRoute = BUSINESS_PROTECTED.some(r => pathname.startsWith(r));
    if (!isBusinessRoute) return NextResponse.next();

    // Check for Supabase auth cookie
    const accessToken = request.cookies.get('sb-access-token')?.value
        || request.cookies.get(`sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`)?.value;

    // Try to get token from the cookie that Supabase JS client sets
    let token = null;
    for (const [name, cookie] of request.cookies) {
        if (name.includes('auth-token') || name.includes('sb-') && name.includes('-auth')) {
            try {
                const parsed = JSON.parse(cookie.value);
                if (parsed?.[0]?.access_token) {
                    token = parsed[0].access_token;
                    break;
                }
                if (typeof parsed === 'string') {
                    token = parsed;
                    break;
                }
            } catch {
                // Not JSON, might be the token itself
                if (cookie.value && cookie.value.length > 20) {
                    token = cookie.value;
                }
            }
        }
    }

    if (!token) {
        // No auth at all → redirect to business login
        const loginUrl = new URL('/products/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Verify the token and check if user is a business user
    try {
        if (!supabaseUrl || !supabaseServiceKey) {
            // Can't verify without service key, let the page handle it
            return NextResponse.next();
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            const loginUrl = new URL('/products/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check if user is a business user
        const isBusiness = user.user_metadata?.is_business === true;
        if (!isBusiness) {
            // Not a business user → redirect to business login with error
            const loginUrl = new URL('/products/login', request.url);
            loginUrl.searchParams.set('error', 'business_only');
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.next();
    } catch (err) {
        // On any verification error, let the page-level auth handle it
        console.error('Middleware auth error:', err);
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/products/dashboard/:path*', '/products/loopmail/app/:path*'],
};
