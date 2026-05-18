import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getUser(req) {
    const auth = req.headers.get('authorization');
    if (!auth) return null;
    const token = auth.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

export async function GET(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const campId = searchParams.get('id');

    if (campId) {
        const { data: campaign } = await supabase.from('loopmail_campaigns').select('*').eq('id', campId).eq('user_id', user.id).single();
        if (!campaign) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        const { data: recipients } = await supabase.from('loopmail_campaign_recipients').select('*').eq('campaign_id', campId);
        const sent = (recipients||[]).filter(r=>r.status==='sent');
        const failed = (recipients||[]).filter(r=>r.status==='failed');
        const pending = (recipients||[]).filter(r=>r.status==='pending');
        return NextResponse.json({ success:true, campaign, recipients:{sent,failed,pending}, totals:{sent:sent.length,failed:failed.length,pending:pending.length} });
    }

    const { data } = await supabase.from('loopmail_campaigns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    return NextResponse.json({ success: true, campaigns: data || [] });
}

export async function POST(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    if (body.action === 'delete') {
        await supabase.from('loopmail_campaign_recipients').delete().eq('campaign_id', body.id);
        await supabase.from('loopmail_campaigns').delete().eq('id', body.id).eq('user_id', user.id);
        return NextResponse.json({ success: true });
    }

    if (body.action === 'delete-bounced') {
        const { data } = await supabase.from('loopmail_contacts').delete().in('email', body.emails).eq('user_id', user.id).select();
        return NextResponse.json({ success: true, deleted: data?.length || 0 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
