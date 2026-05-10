"use client";

import { useEffect } from "react";
import "./login.css";
import { togglePanel, initAuthListeners } from "@/lib/pages/login";
import Footer from "@/components/ui/Footer";

export default function LoginPage() {
  useEffect(() => {
    initAuthListeners();
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