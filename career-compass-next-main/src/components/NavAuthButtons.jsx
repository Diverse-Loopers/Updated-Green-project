'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Shared auth-aware nav buttons component.
 * Shows "My Profile" link when logged in, "Login" link when not.
 * Logout is intentionally NOT here — it belongs in the footer.
 * Renders nothing while session is loading (avoids flash-of-wrong-state).
 */
export default function NavAuthButtons({
  loginClass = '',
  signupClass = '',
  loginText = 'Login',
  profileText = 'My Profile',
}) {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still loading — render nothing to prevent flash
  if (user === undefined) return null;

  // Logged in → show My Profile only
  if (user) {
    return (
      <a href="/profile" className={signupClass || 'nav-btn-signup'}>
        {profileText}
      </a>
    );
  }

  // Logged out → show Login
  return (
    <a href="/login" className={loginClass || 'nav-btn-login'}>
      {loginText}
    </a>
  );
}
