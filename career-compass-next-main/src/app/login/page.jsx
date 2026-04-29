"use client";

import { useEffect } from "react";
import "./login.css";
import { togglePanel, initAuthListeners } from "@/lib/pages/login";

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

      {/* FOOTER */}
      <footer className="login-footer">
        <div className="login-footer__inner">
          <div className="login-footer__grid">

            {/* Brand */}
            <div className="login-footer__brand">
              <img
                src="/Diverse Loopers Black BG (2).png"
                alt="Diverse Loopers"
                className="login-footer__logo"
              />
              <p>
                Empowering talents for tomorrow through structured, future-ready career
                pathways and real industry exposure.
              </p>
              <div className="login-footer__socials">
                <a href="https://www.linkedin.com/company/105277450" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7H10V9h4v1.765C15.396 9.545 16.69 9 18 9a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/diverseloopers/" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a href="https://chat.whatsapp.com/B6XJSoLC2Hg7Wgg5lHRfSf" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M16.7 13.4c-.3-.2-1.7-.8-2-1-.3-.2-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.2-1.3-1-1-1.3-1.9-1.4-2.2-.1-.3 0-.5.2-.7.2-.2.6-.7.8-1 .2-.3.1-.5 0-.7-.1-.2-.7-1.7-.9-2.1-.2-.4-.4-.3-.7-.3-.3 0-.6 0-.9.3-.3.3-1.1 1.1-1.1 2.6 0 1.5.9 3 1.1 3.2.1.2 2.1 3.2 5.1 4.4 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z"/>
                    <path d="M21 12a9 9 0 1 0-16.5 5.2L3 21l3.8-1.5A9 9 0 0 0 21 12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Nav */}
            <div className="login-footer__col">
              <h4>Quick Navigation</h4>
              <ul>
                <li><a href="/aboutus-std">About Us</a></li>
                <li><a href="mailto:contact@diverseloopers.com">Contact Us</a></li>
                <li><a href="#programs">Programs</a></li>
                <li><a href="/skillsynth">SkillSynth</a></li>
                <li><a href="/analyzer">Path Analyzer</a></li>
                <li><a href="/career-analyzer">Career Analyzer</a></li>
              </ul>
            </div>

            {/* Specializations */}
            <div className="login-footer__col">
              <h4>Specializations</h4>
              <ul>
                <li><a href="/">For Students</a></li>
                <li><a href="/institute">For Universities</a></li>
                <li><a href="/business">For Businesses</a></li>
                <li><a href="#">Placement Support</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="login-footer__col">
              <h4>Contact Us</h4>
              <ul>
                <li className="login-footer__contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  contact@diverseloopers.com
                </li>
                <li className="login-footer__contact-item" style={{ marginTop: "0.75rem" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .98h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  +91 98393 50961
                </li>
              </ul>

              <div id="footer-auth" className="login-footer__auth">
                <div className="login-footer__auth-user">
                  <div id="footer-user-avatar" className="login-footer__avatar">U</div>
                  <div>
                    <p id="footer-user-name"></p>
                    <small id="footer-user-email"></small>
                  </div>
                </div>
                <button id="logout-btn" className="login-footer__logout" type="button">
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <div className="login-footer__bottom">
            <p>&copy; 2024 Diverse Loopers. All Rights Reserved.</p>
            <div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms &amp; Conditions</a>
            </div>
            <p>Hybrid Hustle&reg; is a registered program concept.</p>
          </div>
        </div>
      </footer>
    </>
  );
}