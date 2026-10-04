import { supabase } from '../supabase';

let tempEmailForOtp = '';

export function togglePanel(isRegister) {
    const authWrapper = document.getElementById('authWrapper');
    if (authWrapper) {
        isRegister ? authWrapper.classList.add("panel-active") : authWrapper.classList.remove("panel-active");
    }
}

export function showMessage(msg, isError = false) {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = msg;
        messageBox.className = 'message-box show' + (isError ? ' error' : '');
        setTimeout(() => messageBox.classList.remove('show'), 5000);
    }
}

export async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('register-email')?.value?.trim();
    const password = document.getElementById('register-password')?.value;
    const username = document.getElementById('register-username')?.value?.trim();

    if (!email || !password) {
        showMessage('Please enter email and password', true);
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', true);
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]') || document.querySelector('#register-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending OTP...';
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
        });

        if (error) {
            if (error.message?.toLowerCase().includes('rate limit')) {
                showMessage('Email rate limit reached. Please configure Custom SMTP in Supabase or try again shortly.', true);
            } else {
                showMessage(error.message, true);
            }
            return;
        }

        if (data?.user?.identities?.length === 0) {
            showMessage('An account with this email already exists. Please Sign In.', true);
            return;
        }

        if (data && data.session) {
            // If email confirmation is disabled in Supabase
            showMessage('Account created successfully!');
            setTimeout(() => window.location.href = '/settings', 1200);
            return;
        }

        // Email confirmation is enabled — OTP code sent!
        showMessage('Verification code sent! Please check your email inbox.');
        tempEmailForOtp = email;
        const otpOverlay = document.getElementById('otp-overlay');
        if (otpOverlay) {
            otpOverlay.style.display = 'flex';
            const tokenInput = document.getElementById('otp-token');
            if (tokenInput) {
                tokenInput.value = '';
                tokenInput.focus();
            }
        }
    } catch (err) {
        showMessage(err.message || 'Registration failed', true);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    }
}

export async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value?.trim();
    const password = document.getElementById('login-password').value?.trim();

    if (!email || !password) {
        showMessage('Please enter email and password', true);
        return;
    }

    // 1. Try standard Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data?.user) {
        // Check if student has a Placement Program enrollment
        try {
            const placementCheck = await fetch(`/api/placement-program/student-portal?email=${encodeURIComponent(email)}`);
            const pData = await placementCheck.json();
            if (pData.success && pData.student) {
                sessionStorage.setItem('placement_student', JSON.stringify(pData.student));
                sessionStorage.setItem('placement_student_id', pData.student.id);
                showMessage('Welcome back! Redirecting to your Placement Dashboard...');
                setTimeout(() => window.location.href = '/placement-dashboard', 1200);
                return;
            }
        } catch (pErr) {
            console.warn('Placement check error:', pErr);
        }

        // Check if this is a business user — redirect them to business dashboard
        const isBusiness = data?.user?.user_metadata?.is_business === true;
        if (isBusiness) {
            showMessage('Redirecting to your business dashboard...');
            setTimeout(() => window.location.href = '/products/dashboard', 1500);
        } else {
            showMessage('Welcome back!');
            setTimeout(() => window.location.href = '/', 1500);
        }
        return;
    }

    // 2. Fallback: Check if this is an enrolled Placement Program student with portal credentials
    try {
        const studentAuthRes = await fetch('/api/placement-program/student-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const studentAuthData = await studentAuthRes.json();

        if (studentAuthData.success && studentAuthData.student) {
            sessionStorage.setItem('placement_student', JSON.stringify(studentAuthData.student));
            sessionStorage.setItem('placement_student_id', studentAuthData.student.id);
            if (studentAuthData.token) {
                sessionStorage.setItem('placement_token', studentAuthData.token);
            }
            showMessage(studentAuthData.message || 'Welcome to your Placement Dashboard!');
            setTimeout(() => window.location.href = '/placement-dashboard', 1200);
            return;
        }
    } catch (authErr) {
        console.warn('Student auth fallback error:', authErr);
    }

    // If both failed, display error
    showMessage(error ? error.message : 'Invalid email or password', true);
}

export async function handleGoogleLogin(e) {
    if (e) e.preventDefault();

    const clickedBtn = (e && e.currentTarget) || document.getElementById('google-login-btn') || document.getElementById('google-register-btn');
    const originalText = clickedBtn ? clickedBtn.innerHTML : '';

    if (clickedBtn) {
        clickedBtn.disabled = true;
        clickedBtn.style.opacity = '0.7';
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const next = urlParams.get('next') || urlParams.get('redirect');
        const callbackUrl = new URL('/auth/callback', window.location.origin);
        if (next) {
            callbackUrl.searchParams.set('next', next);
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: callbackUrl.toString()
            }
        });

        if (error) {
            showMessage(error.message, true);
            if (clickedBtn) {
                clickedBtn.disabled = false;
                clickedBtn.style.opacity = '1';
                clickedBtn.innerHTML = originalText;
            }
        }
    } catch (err) {
        console.error('Google login error:', err);
        showMessage(err.message || 'Failed to initialize Google login', true);
        if (clickedBtn) {
            clickedBtn.disabled = false;
            clickedBtn.style.opacity = '1';
            clickedBtn.innerHTML = originalText;
        }
    }
}

export async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/callback?next=/update-password'
    });

    if (error) {
        showMessage(error.message, true);
    } else {
        showMessage('Reset link sent! Check your inbox.');
    }
}

export async function handleOtpVerify(e) {
    e.preventDefault();
    const token = document.getElementById('otp-token')?.value?.trim();

    if (!token) {
        showMessage('Please enter the 6-digit verification code', true);
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';
    }

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email: tempEmailForOtp,
            token,
            type: 'signup'
        });

        if (error) {
            showMessage(error.message, true);
        } else {
            showMessage('Email verified successfully! Redirecting...');
            setTimeout(() => window.location.href = '/settings', 1200);
        }
    } catch (err) {
        showMessage(err.message || 'Verification failed', true);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verify';
        }
    }
}

export function showForgotPasswordOverlay() {
    const forgotOverlay = document.getElementById('forgot-overlay');
    if (forgotOverlay) forgotOverlay.style.display = 'flex';
}

export function initAuthListeners() {
    const forgotPasswordTrigger = document.getElementById('forgot-password-trigger');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-form');
    const otpForm = document.getElementById('otp-form');

    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleRegisterBtn = document.getElementById('google-register-btn');

    if (forgotPasswordTrigger) forgotPasswordTrigger.onclick = showForgotPasswordOverlay;
    if (registerForm) registerForm.onsubmit = handleRegister;
    if (loginForm) loginForm.onsubmit = handleLogin;
    if (forgotForm) forgotForm.onsubmit = handleForgotPassword;
    if (otpForm) otpForm.onsubmit = handleOtpVerify;

    if (googleLoginBtn) googleLoginBtn.onclick = handleGoogleLogin;
    if (googleRegisterBtn) googleRegisterBtn.onclick = handleGoogleLogin;
}