"use client";

import { useEffect } from 'react';
import './update-password.css';
import Script from "next/script";
import { initPasswordUpdatePage } from '@/lib/pages/update-password';

export default function UpdatePasswordPage() {
  useEffect(() => {
    // Initialize the page logic after component mounts
    if (typeof window !== 'undefined') {
      initPasswordUpdatePage();
    }
  }, []);

  return (
    <>
      {/* External Libraries */}
      <Script
        src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js"
        strategy="afterInteractive"
      />

      <main style={{
        background: '#0a0a2a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: "'Poppins', sans-serif",
        color: '#fff',
        padding: '20px'
      }}>
        <div className="update-card">
          <div className="icon-circle">
            <i className='bx bx-shield-quarter'></i>
          </div>
          <h1>Update Password</h1>
          <p>Your account security is important. Please enter a strong new password to regain access.</p>

          <form id="update-form">
            <div className="input-group">
              <input type="password" id="new-password" placeholder="New Password" required minLength={6} />
            </div>
            <div className="input-group">
              <input type="password" id="confirm-password" placeholder="Confirm New Password" required minLength={6} />
            </div>
            <button type="submit" id="submit-btn">Update Password</button>
          </form>

          <div id="status-msg"></div>

          <a href="/login" className="back-to-login">
            <i className='bx bx-left-arrow-alt'></i> Back to Sign In
          </a>
        </div>
      </main>
    </>
  );
}