'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getPlanLimits } from '@/lib/planLimits';

export function useLoopMail() {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [smtpConfigs, setSmtpConfigs] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [folders, setFolders] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [contactTotal, setContactTotal] = useState(0);
    const [toasts, setToasts] = useState([]);

    // Subscription state
    const [subscription, setSubscription] = useState(null);
    const [plan, setPlan] = useState('basic');
    const [planLimits, setPlanLimits] = useState(getPlanLimits('basic'));

    const toast = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    }, []);

    const api = useCallback(async (path, method = 'GET', body = null) => {
        if (!token) return { success: false, error: 'No token' };
        const opts = { method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(`/api/loopmail/${path}`, opts);
        return res.json();
    }, [token]);

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/products/login';
                return;
            }

            // Validate business user
            const isBusiness = session.user?.user_metadata?.is_business === true;
            if (!isBusiness) {
                // Not a business user — sign them out from this context and redirect
                window.location.href = '/products/login?error=business_only';
                return;
            }

            setUser(session.user);
            setToken(session.access_token);

            // Fetch subscription for LoopMail — must be active AND onboarded
            try {
                const { data: sub } = await supabase
                    .from('client_subscriptions')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .eq('product_slug', 'loopmail')
                    .eq('status', 'active')
                    .single();

                if (sub && sub.onboarding_status === 'active') {
                    setSubscription(sub);
                    const userPlan = sub.plan || 'basic';
                    setPlan(userPlan);
                    setPlanLimits(getPlanLimits(userPlan));
                } else {
                    // No active+onboarded subscription — redirect to onboarding/pricing
                    window.location.href = '/products/loopmail/pricing';
                    return;
                }
            } catch {
                // No subscription at all — redirect to pricing
                window.location.href = '/products/loopmail/pricing';
                return;
            }
        })();
    }, []);

    const loadAll = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        const [s, c, f, cam] = await Promise.all([
            api('smtp'), api('contacts'), api('folders'), api('campaigns')
        ]);
        if (s.success) setSmtpConfigs(s.configs || []);
        if (c.success) { setContacts(c.contacts || []); setContactTotal(c.total || 0); }
        if (f.success) setFolders(f.folders || []);
        if (cam.success) setCampaigns(cam.campaigns || []);
        setLoading(false);
    }, [token, api]);

    useEffect(() => { if (token) loadAll(); }, [token, loadAll]);

    const loadContacts = useCallback(async (search = '', folderId = '') => {
        let path = 'contacts?';
        if (search) path += `search=${encodeURIComponent(search)}&`;
        if (folderId) path += `folder_id=${folderId}`;
        const r = await api(path);
        if (r.success) { setContacts(r.contacts || []); setContactTotal(r.total || 0); }
    }, [api]);

    return {
        token, user, loading, smtpConfigs, contacts, folders, campaigns,
        contactTotal, toasts, toast, api, loadAll, loadContacts,
        setSmtpConfigs, setContacts, setFolders, setCampaigns,
        // Subscription data
        subscription, plan, planLimits,
    };
}
