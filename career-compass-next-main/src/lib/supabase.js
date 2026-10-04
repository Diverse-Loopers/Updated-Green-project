'use client';

import { createBrowserClient } from '@supabase/ssr';

// Create a single browser client instance that:
// 1. Stores sessions in COOKIES (not just localStorage)
//    → This means the middleware can read them server-side
// 2. Auto-refreshes tokens
// 3. Works for both students and business users
let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables — running in offline mode.');
    return null;
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
}

// Lazy proxy — returns no-op stubs if Supabase is not configured
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) {
      if (prop === 'auth') {
        const defaultAuth = {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null }),
        };
        return new Proxy(defaultAuth, {
          get(target, authProp) {
            if (authProp in target) return target[authProp];
            return async () => ({ data: null, error: { message: 'Supabase not configured' } });
          }
        });
      }
      return () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
    }
    return client[prop];
  }
});