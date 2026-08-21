'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './executive-login.css';

const ROLE_ROUTES = {
  ceo: '/ceo-dashboard',
  cmo_chief: '/ceo-dashboard',
  manager: '/manager-dashboard',
  sales: '/sales-dashboard',
  cfo: '/sales-dashboard',
  cso: '/sales-dashboard',
  cmo: '/cmo-dashboard',
  coo: '/sales-dashboard',
  strategic_advisor: '/sales-dashboard',
};

export default function ExecutiveLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/executives/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store executive session + token in sessionStorage (cleared when tab closes)
      // Do NOT use localStorage — sessionStorage is safer for sensitive sessions
      sessionStorage.setItem('executive_session', JSON.stringify(data.executive));
      sessionStorage.setItem('executive_token', data.token);

      // Redirect based on role
      const route = ROLE_ROUTES[data.executive.role] || '/sales-dashboard';
      router.push(route);

    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="exec-login-page">
      <div className="exec-login-bg">
        <div className="exec-bg-shape exec-bg-1"></div>
        <div className="exec-bg-shape exec-bg-2"></div>
        <div className="exec-bg-shape exec-bg-3"></div>
      </div>

      <div className="exec-login-card">
        <div className="exec-login-header">
          <img src="/images/logo.png" alt="Diverse Loopers" className="exec-login-logo" />
          <h1>Executive Portal</h1>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="exec-login-form">
          <div className="exec-input-group">
            <label htmlFor="exec-email">Email Address</label>
            <div className="exec-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>
              </svg>
              <input
                id="exec-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="exec-input-group">
            <label htmlFor="exec-password">Password</label>
            <div className="exec-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="exec-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="exec-error">{error}</div>}

          <button type="submit" disabled={loading} className="exec-login-btn">
            {loading ? (
              <><span className="exec-btn-spinner"></span> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="exec-login-footer">
          <p>Contact your administrator for access</p>
        </div>
      </div>
    </div>
  );
}
