import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        // Get campaign
        const { data: campaign, error: cErr } = await supabase
            .from('email_campaigns').select('*').eq('id', id).single();
        if (cErr) throw cErr;

        // Get recipients
        const { data: recipients, error: rErr } = await supabase
            .from('campaign_recipients').select('*').eq('campaign_id', id).order('sent_at', { ascending: false });
        if (rErr) throw rErr;

        const sent = (recipients || []).filter(r => r.status === 'sent');
        const failed = (recipients || []).filter(r => r.status === 'failed');
        const pending = (recipients || []).filter(r => r.status === 'pending');

        return NextResponse.json({ success: true, campaign, recipients: { sent, failed, pending }, totals: { sent: sent.length, failed: failed.length, pending: pending.length } });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: delete bounced contacts
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const { action, emails } = await req.json();

        if (action === 'delete-bounced') {
            if (!emails?.length) return NextResponse.json({ success: false, error: 'No emails' }, { status: 400 });
            // Delete from marketing_contacts
            for (const email of emails) {
                await supabase.from('marketing_contacts').delete().eq('email', email);
            }
            return NextResponse.json({ success: true, deleted: emails.length });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
