import { createClient } from '@supabase/supabase-js';

// Create a single instance that will be reused everywhere
let supabaseInstance = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase environment variables — running in offline mode.');
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
      }
    });
  }

  return supabaseInstance;
}

// Lazy getter — avoids calling createClient during SSR module evaluation
// Falls back to a safe no-op stub when Supabase is not configured
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) {
      // Return a no-op stub so callers don't crash when Supabase isn't configured
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null }),
        };
      }
      return () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
    }
    return client[prop];
  }
});