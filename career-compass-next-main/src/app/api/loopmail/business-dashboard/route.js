import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyExecutiveSession } from '@/lib/executive-auth';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET — Fetch business subscriptions, enterprise leads, and stats — requires executive session
export async function GET(req) {
    const auth = await verifyExecutiveSession(req);
    if (!auth.ok) return auth.response;

    try {
        const tab = new URL(req.url).searchParams.get('tab') || 'subscriptions';

        if (tab === 'subscriptions') {
            // Fetch all business subscriptions with user details
            const { data: subs, error } = await supabase
                .from('client_subscriptions')
                .select('*, client_profiles(full_name, company_name, work_email)')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Calculate stats
            const activeCount = subs?.filter(s => s.status === 'active' && s.onboarding_status === 'active').length || 0;
            const totalRevenue = subs?.reduce((acc, s) => acc + (s.amount_paid || 0), 0) || 0;
            const planBreakdown = {
                basic: subs?.filter(s => s.plan === 'basic' && s.status === 'active').length || 0,
                premium: subs?.filter(s => s.plan === 'premium' && s.status === 'active').length || 0,
                enterprise: subs?.filter(s => s.plan === 'enterprise' && s.status === 'active').length || 0,
            };
            const pendingOnboarding = subs?.filter(s => s.onboarding_status !== 'active').length || 0;

            return NextResponse.json({
                success: true,
                subscriptions: subs || [],
                stats: { activeCount, totalRevenue, planBreakdown, pendingOnboarding, total: subs?.length || 0 }
            });
        }

        if (tab === 'leads') {
            // Fetch enterprise leads
            const { data: leads, error } = await supabase
                .from('enterprise_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const statusCounts = {
                new: leads?.filter(l => l.status === 'new').length || 0,
                contacted: leads?.filter(l => l.status === 'contacted').length || 0,
                converted: leads?.filter(l => l.status === 'converted').length || 0,
                rejected: leads?.filter(l => l.status === 'rejected').length || 0,
            };

            return NextResponse.json({
                success: true,
                leads: leads || [],
                stats: statusCounts
            });
        }

        return NextResponse.json({ success: false, error: 'Invalid tab' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST — Update lead status — requires executive session
export async function POST(req) {
    const auth = await verifyExecutiveSession(req);
    if (!auth.ok) return auth.response;

    try {
        const { action, lead_id, status } = await req.json();

        if (action === 'update-lead-status' && lead_id && status) {
            const { error } = await supabase
                .from('enterprise_leads')
                .update({ status })
                .eq('id', lead_id);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
