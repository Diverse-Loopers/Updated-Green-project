'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Footer auth section — shows user name/email + Logout button when logged in.
 * Renders nothing when logged out or still loading.
 * Drop this into any page's footer to replace the old #footer-auth DOM div.
 */
export default function FooterAuthSection({ className = '' }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still loading or not logged in — render nothing
  if (!user) return null;

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const initial = name.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div
      className={className}
      style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* User info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#00c851',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{name}</p>
          {email && (
            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{email}</p>
          )}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ef4444',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          padding: '6px 14px',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
      >
        Sign Out
      </button>
    </div>
  );
}
