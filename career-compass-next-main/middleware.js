import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require a logged-in business user
const BUSINESS_PROTECTED = ['/products/dashboard', '/products/loopmail/app'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Only run on protected business routes
    const isBusinessRoute = BUSINESS_PROTECTED.some(r => pathname.startsWith(r));
    if (!isBusinessRoute) return NextResponse.next();

    // Build a response object so @supabase/ssr can set refreshed cookies on it
    let response = NextResponse.next({ request });

    // Create a Supabase client that reads+writes cookies on this request/response
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Write refreshed cookies back to both request and response
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // getUser() validates the JWT with Supabase server (not just local storage)
    // It will also refresh an expired access token automatically using the refresh token cookie
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // No valid session — send to business login
        const loginUrl = new URL('/products/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check if this is a business account
    const isBusiness = user.user_metadata?.is_business === true;
    if (!isBusiness) {
        // Logged in but as a student — show the "wrong account" page
        const loginUrl = new URL('/products/login', request.url);
        loginUrl.searchParams.set('error', 'business_only');
        return NextResponse.redirect(loginUrl);
    }

    // Valid business user — let them through (with any refreshed cookies)
    return response;
}

export const config = {
    matcher: ['/products/dashboard/:path*', '/products/loopmail/app/:path*'],
};
