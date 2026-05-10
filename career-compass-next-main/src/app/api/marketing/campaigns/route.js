import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: List campaigns
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('email_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, campaigns: data || [] });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: Create or update campaign
export async function POST(req) {
    try {
        const { action, ...body } = await req.json();

        if (action === 'create') {
            const { title, subject, htmlBody, sentBy } = body;
            if (!title || !subject || !htmlBody) {
                return NextResponse.json({ success: false, error: 'Title, subject, and body are required' }, { status: 400 });
            }

            const { data, error } = await supabase
                .from('email_campaigns')
                .insert({
                    title,
                    subject,
                    body: htmlBody,
                    sent_by: sentBy || 'CMO',
                    status: 'draft'
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, campaign: data });
        }

        if (action === 'delete') {
            const { id } = body;
            if (!id) return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });
            const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

    } catch (err) {
        console.error('Campaign error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
