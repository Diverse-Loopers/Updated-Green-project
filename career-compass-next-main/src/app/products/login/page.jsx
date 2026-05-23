"use client";

import { useEffect } from "react";
import "../../../app/login/login.css";
import { supabase } from "@/lib/supabase";
import { validateOrgEmail } from "@/lib/emailValidation";
import Footer from "@/components/ui/Footer";

function showMessage(msg, isError = false) {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = msg;
        messageBox.className = 'message-box show' + (isError ? ' error' : ' success');
        setTimeout(() => messageBox.classList.remove('show'), 5000);
    }
}

let tempEmailForOtp = '';

export default function BusinessLoginPage() {
    useEffect(() => {
        // Show error from middleware redirect
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'business_only') {
            setTimeout(() => showMessage('This area is for business accounts only. Students should use the student login at /login', true), 300);
        }

        // Check if already logged in AS A BUSINESS USER
        supabase.auth.getUser().then(async ({ data: { user }, error }) => {
            if (error) {
                await supabase.auth.signOut();
                return;
            }
            if (user && user?.user_metadata?.is_business === true) {
                window.location.href = '/products/dashboard';
            }
        });

        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const forgotForm = document.getElementById('forgot-form');
        const otpForm = document.getElementById('otp-form');
        const forgotTrigger = document.getElementById('forgot-password-trigger');

        if (loginForm) loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) { showMessage(error.message, true); return; }

            // CRITICAL: Check if user is a business user
            const isBusiness = data?.user?.user_metadata?.is_business === true;
            if (!isBusiness) {
                await supabase.auth.signOut();
                showMessage('This login is for business accounts only. If you are a student, please use the student login page.', true);
                return;
            }

            showMessage('Welcome back!');
            const redirect = params.get('redirect') || '/products/dashboard';
            setTimeout(() => window.location.href = redirect, 1500);
        };

        if (registerForm) registerForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const username = document.getElementById('register-username').value;
            const company = document.getElementById('register-company')?.value || '';

            // Validate organizational email
            const emailCheck = validateOrgEmail(email);
            if (!emailCheck.valid) {
                showMessage(emailCheck.error, true);
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email, password,
                options: { data: { username, company, is_business: true } }
            });

            if (error) { showMessage(error.message, true); }
            else if (data?.user?.identities?.length === 0) {
                // Email already exists (likely a student account) — try to upgrade to dual-role
                showMessage('Account exists. Verifying credentials to enable business access...', false);

                const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
                if (loginErr) {
                    showMessage('This email already has an account. Please enter the correct password to enable business access, or use Sign In.', true);
                    return;
                }

                // Successfully signed in — upgrade metadata to include is_business
                const existingMeta = loginData.user?.user_metadata || {};
                const { error: updateErr } = await supabase.auth.updateUser({
                    data: {
                        ...existingMeta,
                        is_business: true,
                        company: company || existingMeta.company || '',
                    }
                });

                if (updateErr) {
                    showMessage('Failed to enable business access: ' + updateErr.message, true);
                    return;
                }

                // Create client_profile if not exists (via API or direct)
                try {
                    const { error: profileErr } = await supabase.from('client_profiles').upsert({
                        id: loginData.user.id,
                        email: email,
                        username: existingMeta.username || username,
                        company: company || existingMeta.company || '',
                        plan: 'basic',
                    }, { onConflict: 'id' });
                } catch {}

                showMessage('✅ Business access enabled! Redirecting to dashboard...');
                setTimeout(() => window.location.href = '/products/dashboard', 1500);
            }
            else if (data?.session) {
                showMessage('Account created successfully!');
                setTimeout(() => window.location.href = '/products/dashboard', 1500);
            } else {
                showMessage('Check your email for the verification code!');
                tempEmailForOtp = email;
                const otpOverlay = document.getElementById('otp-overlay');
                if (otpOverlay) otpOverlay.style.display = 'flex';
            }
        };

        if (forgotTrigger) forgotTrigger.onclick = () => {
            const el = document.getElementById('forgot-overlay');
            if (el) el.style.display = 'flex';
        };

        if (forgotForm) forgotForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/auth/callback?next=/update-password'
            });
            if (error) showMessage(error.message, true);
            else showMessage('Reset link sent! Check your inbox.');
        };

        if (otpForm) otpForm.onsubmit = async (e) => {
            e.preventDefault();
            const token = document.getElementById('otp-token').value;
            const { error } = await supabase.auth.verifyOtp({ email: tempEmailForOtp, token, type: 'signup' });
            if (error) showMessage(error.message, true);
            else { showMessage('Verified!'); setTimeout(() => window.location.href = '/products/dashboard', 1500); }
        };

        const handleGoogleLogin = async (e) => {
            if (e) e.preventDefault();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // Send parameter to callback so it can set is_business=true
                    redirectTo: window.location.origin + '/auth/callback?is_business=true'
                }
            });
            if (error) showMessage(error.message, true);
        };

        const googleLoginBtn = document.getElementById('google-login-btn');
        const googleRegisterBtn = document.getElementById('google-register-btn');
        if (googleLoginBtn) googleLoginBtn.onclick = handleGoogleLogin;
        if (googleRegisterBtn) googleRegisterBtn.onclick = handleGoogleLogin;
    }, []);

    const handleShowRegister = () => document.getElementById("authWrapper")?.classList.add("panel-active");
    const handleShowLogin = () => document.getElementById("authWrapper")?.classList.remove("panel-active");

    return (
        <>
            <div className="auth-topbar">
                <a href="/business" className="home-link">
                    <img src="/DIVERSE LOOPERS (1) bg.png" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/120x44?text=DL")} alt="Diverse Loopers" />
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }} className="back-link">
                    <i className="bx bx-arrow-back"></i> Back
                </a>
            </div>

            <div className="auth-wrapper" id="authWrapper">
                {/* LOGIN FORM */}
                <div className="auth-form-box login-form-box">
                    <form id="login-form">
                        <h1>Business Login</h1>
                        <span>Access your SaaS tools dashboard</span>
                        <div className="input-group">
                            <input type="email" id="login-email" placeholder="Email" required />
                        </div>
                        <div className="input-group">
                            <input type="password" id="login-password" placeholder="Password" required />
                        </div>
                        <a className="forgot-link" id="forgot-password-trigger">Forgot your password?</a>
                        <button type="submit">Sign In</button>
                        <div className="flex items-center my-4 before:flex-1 before:border-t before:border-slate-300 before:mr-3 after:flex-1 after:border-t after:border-slate-300 after:ml-3">
                            <span className="text-slate-400 text-xs font-bold uppercase">Or</span>
                        </div>
                        <button type="button" id="google-login-btn" className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors py-3 rounded-[30px] font-bold mt-2 shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </button>
                        <div className="mobile-switch">
                            <p>Don&apos;t have an account?</p>
                            <button type="button" onClick={handleShowRegister}>Sign Up</button>
                        </div>
                    </form>
                </div>

                {/* REGISTER FORM */}
                <div className="auth-form-box register-form-box">
                    <form id="register-form">
                        <h1>Business Sign Up</h1>
                        <span>Create your business account</span>
                        <div className="input-group">
                            <input type="text" id="register-username" placeholder="Full Name" required />
                        </div>
                        <div className="input-group">
                            <input type="text" id="register-company" placeholder="Company Name (optional)" />
                        </div>
                        <div className="input-group">
                            <input type="email" id="register-email" placeholder="Business Email" required />
                        </div>
                        <div className="input-group">
                            <input type="password" id="register-password" placeholder="Password" required />
                        </div>
                        <button type="submit">Create Account</button>
                        <div className="flex items-center my-4 before:flex-1 before:border-t before:border-slate-300 before:mr-3 after:flex-1 after:border-t after:border-slate-300 after:ml-3">
                            <span className="text-slate-400 text-xs font-bold uppercase">Or</span>
                        </div>
                        <button type="button" id="google-register-btn" className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors py-3 rounded-[30px] font-bold mt-2 shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </button>
                        <div className="mobile-switch">
                            <p>Already have an account?</p>
                            <button type="button" onClick={handleShowLogin}>Sign In</button>
                        </div>
                    </form>
                </div>

                {/* SLIDING PANEL */}
                <div className="slide-panel-wrapper">
                    <div className="slide-panel">
                        <div className="panel-content panel-content-right">
                            <h1>Welcome!</h1>
                            <p>Create a business account to access LoopMail and all our SaaS tools.</p>
                            <button className="transparent-btn" id="loginBtn" type="button" onClick={handleShowRegister}>Sign Up</button>
                        </div>
                        <div className="panel-content panel-content-left">
                            <h1>Welcome Back!</h1>
                            <p>Sign in to access your dashboard and manage your tools.</p>
                            <button className="transparent-btn" id="registerBtn" type="button" onClick={handleShowLogin}>Sign In</button>
                        </div>
                    </div>
                </div>

                {/* FORGOT PASSWORD OVERLAY */}
                <div id="forgot-overlay">
                    <i className="bx bx-lock-open-alt" style={{ fontSize: "60px", color: "#ec4899", marginBottom: "20px" }}></i>
                    <h1>Reset Password</h1>
                    <p>Enter your email address to receive a password reset link.</p>
                    <form id="forgot-form" style={{ background: "transparent", height: "auto", padding: 0, width: "300px" }}>
                        <div className="input-group">
                            <input type="email" id="forgot-email" placeholder="Enter your email" required />
                        </div>
                        <button type="submit" style={{ width: "100%" }}>Send Reset Link</button>
                        <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="forgot-link">Back to Login</a>
                    </form>
                </div>

                {/* OTP OVERLAY */}
                <div id="otp-overlay">
                    <i className="bx bx-mail-send" style={{ fontSize: "60px", color: "#3b82f6", marginBottom: "20px" }}></i>
                    <h1>Verify Email</h1>
                    <p>Enter the 6-digit code sent to your email.</p>
                    <form id="otp-form" style={{ background: "transparent", height: "auto", padding: 0, width: "300px" }}>
                        <input type="text" id="otp-token" placeholder="000000" required maxLength={6}
                            style={{ textAlign: "center", letterSpacing: 4, fontWeight: "bold", fontSize: 20, width: "100%", padding: "14px", border: "1.5px solid #e0e0e0", borderRadius: "10px" }} />
                        <button type="submit" style={{ width: "100%" }}>Verify</button>
                        <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="forgot-link">Back</a>
                    </form>
                </div>
            </div>

            <div id="message-box" className="message-box"></div>

            <Footer />
        </>
    );
}
