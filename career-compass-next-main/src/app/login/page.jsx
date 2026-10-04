"use client";

import { useEffect } from "react";
import "./login.css";
import { togglePanel, initAuthListeners, handleGoogleLogin, showMessage } from "@/lib/pages/login";
import Footer from "@/components/ui/Footer";

export default function LoginPage() {
  useEffect(() => {
    initAuthListeners();

    // Check if redirected with an error from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error_description') || params.get('error');
    if (err) {
      setTimeout(() => {
        showMessage(decodeURIComponent(err).replace(/_/g, ' '), true);
      }, 300);
    }
  }, []);

  const handleShowRegister = () => {
    document.getElementById("authWrapper")?.classList.add("panel-active");
  };

  const handleShowLogin = () => {
    document.getElementById("authWrapper")?.classList.remove("panel-active");
  };

  return (
    <>
      {/* ✅ FIX: Single fixed topbar that contains BOTH logo and back button.
          This replaces the two separate position:fixed elements that were
          overlapping each other and causing the "double logo" in screenshots. */}
      <div className="auth-topbar">
        <a href="/" className="home-link">
          <img
            src="/DIVERSE LOOPERS (1) bg.png"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/120x44?text=DL")}
            alt="Diverse Loopers"
          />
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="back-link"
        >
          <i className="bx bx-arrow-back"></i> Back
        </a>
      </div>

      {/* Auth Card */}
      <div className="auth-wrapper" id="authWrapper">

        {/* LOGIN FORM — first in DOM, shown by default */}
        <div className="auth-form-box login-form-box">
          <form id="login-form">
            <h1>Sign In</h1>
            <span>Welcome back to Diverse Loopers</span>
            <div className="input-group">
              <input type="email" id="login-email" placeholder="Email" required />
            </div>
            <div className="input-group">
              <input type="password" id="login-password" placeholder="Password" required />
            </div>
            <a className="forgot-link" id="forgot-password-trigger">
              Forgot your password?
            </a>
            <button type="submit">Sign In</button>
            <div className="flex items-center my-4 before:flex-1 before:border-t before:border-slate-300 before:mr-3 after:flex-1 after:border-t after:border-slate-300 after:ml-3">
              <span className="text-slate-400 text-xs font-bold uppercase">Or</span>
            </div>
            <button
              type="button"
              id="google-login-btn"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors py-3 rounded-[30px] font-bold mt-2 shadow-sm cursor-pointer"
            >
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

        {/* REGISTER FORM — hidden by default */}
        <div className="auth-form-box register-form-box">
          <form id="register-form">
            <h1>Create Account</h1>
            <span>Join our professional community</span>
            <div className="input-group">
              <input type="text" id="register-username" placeholder="Username" required />
            </div>
            <div className="input-group">
              <input type="email" id="register-email" placeholder="Email" required />
            </div>
            <div className="input-group">
              <input type="password" id="register-password" placeholder="Password" required />
            </div>
            <button type="submit">Sign Up</button>
            <div className="flex items-center my-4 before:flex-1 before:border-t before:border-slate-300 before:mr-3 after:flex-1 after:border-t after:border-slate-300 after:ml-3">
              <span className="text-slate-400 text-xs font-bold uppercase">Or</span>
            </div>
            <button
              type="button"
              id="google-register-btn"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors py-3 rounded-[30px] font-bold mt-2 shadow-sm cursor-pointer"
            >
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
            {/* Shown on LOGIN view (panel on right) → click to go to register */}
            <div className="panel-content panel-content-right">
              <h1>Hello there!</h1>
              <p>Start your journey with us and discover your potential.</p>
              <button
                className="transparent-btn"
                id="loginBtn"
                type="button"
                onClick={handleShowRegister}
              >
                Sign Up
              </button>
            </div>
            {/* Shown on REGISTER view (panel on left) → click to go back to login */}
            <div className="panel-content panel-content-left">
              <h1>Welcome Back!</h1>
              <p>Keep connected with us by logging into your account.</p>
              <button
                className="transparent-btn"
                id="registerBtn"
                type="button"
                onClick={handleShowLogin}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* FORGOT PASSWORD OVERLAY */}
        <div id="forgot-overlay">
          <i className="bx bx-lock-open-alt"
            style={{ fontSize: "60px", color: "#ec4899", marginBottom: "20px" }}
          ></i>
          <h1>Reset Password</h1>
          <p>Enter your email address to receive a password reset link.</p>
          <form id="forgot-form"
            style={{ background: "transparent", height: "auto", padding: 0, width: "300px" }}
          >
            <div className="input-group">
              <input type="email" id="forgot-email" placeholder="Enter your email" required />
            </div>
            <button type="submit" style={{ width: "100%" }}>Send Reset Link</button>
            <a href="#"
              onClick={(e) => { e.preventDefault(); window.location.reload(); }}
              className="forgot-link"
            >
              Back to Login
            </a>
          </form>
        </div>

        {/* OTP OVERLAY */}
        <div id="otp-overlay">
          <i className="bx bx-mail-send"
            style={{ fontSize: "60px", color: "#3b82f6", marginBottom: "20px" }}
          ></i>
          <h1>Verify Email</h1>
          <p>Enter the 6-digit code sent to your email.</p>
          <form id="otp-form"
            style={{ background: "transparent", height: "auto", padding: 0, width: "300px" }}
          >
            <input
              type="text" id="otp-token" placeholder="000000"
              required maxLength={6}
              style={{ textAlign: "center", letterSpacing: 4, fontWeight: "bold", fontSize: 20 }}
            />
            <button type="submit" style={{ width: "100%" }}>Verify</button>
            <a href="#"
              onClick={(e) => { e.preventDefault(); window.location.reload(); }}
              className="forgot-link"
            >
              Back
            </a>
          </form>
        </div>
      </div>

      {/* Toast notification */}
      <div id="message-box" className="message-box"></div>

      <Footer />
    </>
  );
}