"use client";

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// Inner component that uses useSearchParams — must be inside <Suspense>
function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Authenticating...");

    useEffect(() => {
        const handleAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                const isBusiness = searchParams.get('is_business') === 'true';
                const next = searchParams.get('next') || '/';

                if (session) {
                    if (isBusiness) {
                        setMessage("Setting up business account...");
                        await supabase.auth.updateUser({
                            data: { is_business: true }
                        });
                        window.location.href = '/products/dashboard';
                    } else {
                        window.location.href = next;
                    }
                } else {
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                        if (event === 'SIGNED_IN' && currentSession) {
                            subscription?.unsubscribe();
                            if (isBusiness) {
                                setMessage("Setting up business account...");
                                await supabase.auth.updateUser({
                                    data: { is_business: true }
                                });
                                window.location.href = '/products/dashboard';
                            } else {
                                window.location.href = next;
                            }
                        }
                    });

                    // Fallback timeout
                    setTimeout(() => {
                        setMessage("Authentication taking longer than expected. If you are not redirected, please return to login.");
                    }, 5000);
                }
            } catch (err) {
                console.error("Auth callback error:", err);
                setMessage("Authentication failed. Redirecting to login...");
                setTimeout(() => {
                    window.location.href = '/login?error=auth_callback_failed';
                }, 2000);
            }
        };

        handleAuth();
    }, [searchParams, router]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', color: '#334155', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 20 }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{message}</h2>
        </div>
    );
}

// Outer component wraps inner in Suspense — required by Next.js for useSearchParams
export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', color: '#334155', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 20 }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading...</h2>
            </div>
        }>
            <AuthCallbackInner />
        </Suspense>
    );
}
