"use client";

import { useEffect } from "react";
import "./admin.css";
import { initAdminLoginListeners } from "@/lib/pages/admin";

export default function AdminLoginPage() {
  useEffect(() => {
    // Initialize login listeners after component mounts
    initAdminLoginListeners();
  }, []);

  return (
    <>
 

      <div className="login-container">
        <div className="login-header">
          <h1 style={{ color: "var(--indigo-600)" }}>Admin Access</h1>
          <p>Sign in using your authorized administrator credentials.</p>
        </div>

        <form id="admin-login-form">
          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-group">
              <input
                type="email"
                id="email"
                required
                placeholder="admin@diverseloopers.com"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
              />

              <button
                type="button"
                id="toggle-password"
                aria-label="Toggle password visibility"
              >
                <svg
                  id="eye-closed"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block" }}
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  id="eye-open"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "none" }}
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.48-1.65" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" id="login-btn">
            Log In
          </button>
        </form>

        <div id="message-area" className="message-box error" style={{ display: "none" }}></div>
      </div>
    </>
  );
}