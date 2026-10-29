'use client';

import { createBrowserClient } from '@supabase/ssr';

// Create a single browser client instance that:
// 1. Stores sessions in COOKIES (not just localStorage)
//    → This means the middleware can read them server-side
// 2. Auto-refreshes tokens
// 3. Works for both students and business users
let supabaseInstance = null;

function getCookieDomain() {
  if (typeof window === 'undefined') return undefined;
  const hostname = window.location.hostname;
  if (hostname.includes('diverseloopers.com')) {
    return '.diverseloopers.com';
  }
  return undefined;
}

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables — running in offline mode.');
    return null;
  }

  const domain = getCookieDomain();

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      domain,
      path: '/',
      sameSite: 'lax',
      secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
    },
    cookies: {
      getAll() {
        const parsed = {};
        if (typeof document !== 'undefined' && document.cookie) {
          document.cookie.split(';').forEach(cookie => {
            const eqIdx = cookie.indexOf('=');
            if (eqIdx !== -1) {
              const name = cookie.substring(0, eqIdx).trim();
              const value = cookie.substring(eqIdx + 1).trim();
              if (name) parsed[name] = value;
            }
          });
        }
        // Fallback: merge any sb-* keys backed up in localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            for (let i = 0; i < window.localStorage.length; i++) {
              const key = window.localStorage.key(i);
              if (key && key.startsWith('sb-') && (!parsed[key] || parsed[key] === '')) {
                const val = window.localStorage.getItem(key);
                if (val) parsed[key] = val;
              }
            }
          } catch {}
        }
        return Object.keys(parsed).map(name => ({ name, value: parsed[name] }));
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') return;
        cookiesToSet.forEach(({ name, value, options }) => {
          const isRemoval = options?.maxAge === 0 || !value;
          let cookieStr = isRemoval
            ? `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax;`
            : `${name}=${value}; Path=/; SameSite=Lax;`;

          if (domain) cookieStr += ` Domain=${domain};`;
          if (!isRemoval && typeof options?.maxAge === 'number') cookieStr += ` Max-Age=${options.maxAge};`;
          if (options?.secure || (typeof window !== 'undefined' && window.location.protocol === 'https:')) {
            cookieStr += ' Secure;';
          }
          document.cookie = cookieStr;

          // Mirror sb-* keys to localStorage for reliable fallback across redirects
          if (typeof window !== 'undefined' && window.localStorage && name.startsWith('sb-')) {
            try {
              if (isRemoval) {
                window.localStorage.removeItem(name);
              } else {
                window.localStorage.setItem(name, value);
              }
            } catch {}
          }
        });
      }
    }
  });
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