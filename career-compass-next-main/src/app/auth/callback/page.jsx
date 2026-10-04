"use client";

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// Inner component that uses useSearchParams — must be inside <Suspense>
function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Authenticating with Google...");

    useEffect(() => {
        let isCancelled = false;

        const handleAuth = async () => {
            const isBusiness = searchParams.get('is_business') === 'true';
            const next = searchParams.get('next') || '/';
            const targetLogin = isBusiness ? '/products/login' : '/login';

            try {
                // 1. Check for error parameters returned from Google / Supabase OAuth
                const errorParam = searchParams.get('error');
                const errorDesc = searchParams.get('error_description');
                if (errorParam) {
                    const errorMsg = errorDesc || errorParam;
                    console.error("OAuth error received in callback:", errorParam, errorDesc);
                    if (!isCancelled) setMessage(`Authentication error: ${errorMsg}`);
                    setTimeout(() => {
                        window.location.href = `${targetLogin}?error=${encodeURIComponent(errorMsg)}`;
                    }, 2000);
                    return;
                }

                const code = searchParams.get('code');
                let session = null;

                // 2. PKCE code exchange (Standard flow for Supabase OAuth)
                if (code) {
                    if (!isCancelled) setMessage("Exchanging authorization code...");
                    try {
                        const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
                        if (exchangeErr) {
                            throw exchangeErr;
                        }
                        session = data?.session;
                    } catch (codeErr) {
                        const isPkceMissing = codeErr?.message?.includes('PKCE code verifier not found') ||
                                              codeErr?.code === 'pkce_code_verifier_not_found';

                        // If verifier was stored on the other subdomain (www vs non-www), automatically try the sibling domain once
                        if (isPkceMissing && typeof window !== 'undefined' && window.location.hostname.includes('diverseloopers.com')) {
                            const currentUrl = new URL(window.location.href);
                            const hasRetried = currentUrl.searchParams.get('pkce_retry') === '1';

                            if (!hasRetried) {
                                currentUrl.searchParams.set('pkce_retry', '1');

                                const currentHost = window.location.hostname;
                                const targetHost = currentHost.startsWith('www.')
                                    ? currentHost.replace(/^www\./, '')
                                    : `www.${currentHost}`;

                                currentUrl.hostname = targetHost;

                                if (!isCancelled) {
                                    setMessage("Completing authentication on primary domain...");
                                }

                                window.location.href = currentUrl.toString();
                                return;
                            }
                        }
                        console.error("PKCE exchange error:", codeErr);
                        throw codeErr;
                    }
                }

                // 3. Fallback: Check hash fragment if implicit flow was used
                if (!session && typeof window !== 'undefined' && window.location.hash) {
                    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');
                    if (accessToken && refreshToken) {
                        if (!isCancelled) setMessage("Completing session setup...");
                        const { data, error: setSessionErr } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        });
                        if (setSessionErr) throw setSessionErr;
                        session = data?.session;
                    }
                }

                // 4. Fallback: Check if session is already stored
                if (!session) {
                    const { data: { session: existingSession } } = await supabase.auth.getSession();
                    session = existingSession;
                }

                // 5. If session is ready, process routing
                if (session) {
                    if (!isCancelled) setMessage("Authentication successful! Redirecting...");

                    if (isBusiness) {
                        if (!isCancelled) setMessage("Setting up business account...");
                        try {
                            await supabase.auth.updateUser({
                                data: { is_business: true }
                            });
                        } catch (uErr) {
                            console.warn("Failed to set business user metadata:", uErr);
                        }
                        window.location.href = next !== '/' ? next : '/products/dashboard';
                        return;
                    }

                    // Check placement program enrollment for students
                    const userEmail = session.user?.email;
                    if (userEmail && next === '/') {
                        try {
                            const placementCheck = await fetch(`/api/placement-program/student-portal?email=${encodeURIComponent(userEmail)}`);
                            const pData = await placementCheck.json();
                            if (pData.success && pData.student) {
                                sessionStorage.setItem('placement_student', JSON.stringify(pData.student));
                                sessionStorage.setItem('placement_student_id', pData.student.id);
                                if (!isCancelled) setMessage("Welcome! Redirecting to your Placement Dashboard...");
                                window.location.href = '/placement-dashboard';
                                return;
                            }
                        } catch (pErr) {
                            console.warn('Placement check error:', pErr);
                        }
                    }

                    // Check if already marked as business user
                    if (session.user?.user_metadata?.is_business === true && next === '/') {
                        window.location.href = '/products/dashboard';
                        return;
                    }

                    window.location.href = next;
                    return;
                }

                // 6. Listen for auth change if exchange is asynchronous
                let handled = false;
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                    if (handled) return;
                    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && currentSession) {
                        handled = true;
                        subscription?.unsubscribe();
                        if (isBusiness) {
                            try {
                                await supabase.auth.updateUser({
                                    data: { is_business: true }
                                });
                            } catch (uErr) {}
                            window.location.href = next !== '/' ? next : '/products/dashboard';
                        } else {
                            window.location.href = next;
                        }
                    }
                });

                // 7. Timeout fallback if no session received
                setTimeout(() => {
                    if (!handled && !isCancelled) {
                        subscription?.unsubscribe();
                        setMessage("Authentication taking longer than expected. Redirecting to login...");
                        setTimeout(() => {
                            window.location.href = `${targetLogin}?error=auth_timeout`;
                        }, 1500);
                    }
                }, 6000);

            } catch (err) {
                console.error("Auth callback error:", err);
                if (!isCancelled) {
                    setMessage(`Authentication failed: ${err.message || 'Please try again.'}`);
                }
                setTimeout(() => {
                    window.location.href = `${targetLogin}?error=${encodeURIComponent(err.message || 'auth_callback_failed')}`;
                }, 2000);
            }
        };

        handleAuth();

        return () => {
            isCancelled = true;
        };
    }, [searchParams, router]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', color: '#334155', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 20 }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, maxWidth: '90%', textAlign: 'center' }}>{message}</h2>
        </div>
    );
}

// Outer component wraps inner in Suspense — required by Next.js for useSearchParams
export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', color: '#334155', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 20 }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading...</h2>
            </div>
        }>
            <AuthCallbackInner />
        </Suspense>
    );
}
