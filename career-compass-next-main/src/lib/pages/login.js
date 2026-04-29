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
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const username = document.getElementById('register-username').value;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
    });

    if (error) {
        showMessage(error.message, true);
    } else {
        showMessage('Check your email for the code!');
        tempEmailForOtp = email;
        const otpOverlay = document.getElementById('otp-overlay');
        if (otpOverlay) otpOverlay.style.display = 'flex';
    }
}

export async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        showMessage(error.message, true);
    } else {
        showMessage('Welcome back!');
        setTimeout(() => window.location.href = '/profile', 1500);
    }
}

export async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password'
    });

    if (error) {
        showMessage(error.message, true);
    } else {
        showMessage('Reset link sent! Check your inbox.');
    }
}

export async function handleOtpVerify(e) {
    e.preventDefault();
    const token = document.getElementById('otp-token').value;

    const { error } = await supabase.auth.verifyOtp({
        email: tempEmailForOtp,
        token,
        type: 'signup'
    });

    if (error) {
        showMessage(error.message, true);
    } else {
        showMessage('Verified!');
        setTimeout(() => window.location.href = '/profile', 1500);
    }
}

export function showForgotPasswordOverlay() {
    const forgotOverlay = document.getElementById('forgot-overlay');
    if (forgotOverlay) forgotOverlay.style.display = 'flex';
}

export function initAuthListeners() {
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const forgotPasswordTrigger = document.getElementById('forgot-password-trigger');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-form');
    const otpForm = document.getElementById('otp-form');

    if (registerBtn) registerBtn.onclick = () => togglePanel(true);
    if (loginBtn) loginBtn.onclick = () => togglePanel(false);
    if (forgotPasswordTrigger) forgotPasswordTrigger.onclick = showForgotPasswordOverlay;
    if (registerForm) registerForm.onsubmit = handleRegister;
    if (loginForm) loginForm.onsubmit = handleLogin;
    if (forgotForm) forgotForm.onsubmit = handleForgotPassword;
    if (otpForm) otpForm.onsubmit = handleOtpVerify;
}