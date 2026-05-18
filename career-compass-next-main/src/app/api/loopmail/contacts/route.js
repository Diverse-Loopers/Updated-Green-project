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

// GET — List user's contacts
export async function GET(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const folderId = searchParams.get('folder_id');

    let q = supabase.from('loopmail_contacts').select('*', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false });
    if (search) q = q.or(`email.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%`);
    if (folderId === 'unassigned') q = q.is('folder_id', null);
    else if (folderId) q = q.eq('folder_id', folderId);

    const { data, count, error } = await q.limit(500);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Total count (all contacts for this user)
    const { count: total } = await supabase.from('loopmail_contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

    return NextResponse.json({ success: true, contacts: data || [], total: total || 0 });
}

// POST — Create, Delete, Bulk Import, Move
export async function POST(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── PLAN & ONBOARDING ENFORCEMENT ──
    let userPlan = 'basic';
    try {
        const { data: sub } = await supabase
            .from('client_subscriptions').select('plan, onboarding_status')
            .eq('user_id', user.id).eq('product_slug', 'loopmail').eq('status', 'active').single();
        if (!sub || sub.onboarding_status !== 'active') {
            return NextResponse.json({ success: false, error: 'Please complete onboarding first.' }, { status: 403 });
        }
        userPlan = sub.plan || 'basic';
    } catch {
        return NextResponse.json({ success: false, error: 'No active subscription.' }, { status: 403 });
    }
    const maxContacts = { basic: 500, premium: 100000, enterprise: -1 }[userPlan] || 500;

    // CREATE single contact
    if (action === 'create') {
        const { email, name, phone, company, tags, folder_id } = body;
        if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });

        // Check contact limit
        if (maxContacts !== -1) {
            const { count } = await supabase.from('loopmail_contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
            if ((count || 0) >= maxContacts) {
                return NextResponse.json({ success: false, error: `Contact limit reached (${maxContacts} on ${userPlan} plan). Upgrade at /products/loopmail/pricing` }, { status: 403 });
            }
        }

        const { data, error } = await supabase.from('loopmail_contacts').insert({
            user_id: user.id, email, name: name || '', phone: phone || '', company: company || '',
            tags: tags || [], folder_id: folder_id || null, source: 'manual',
        }).select().single();

        if (error) {
            if (error.code === '23505') return NextResponse.json({ success: false, error: 'Contact already exists' }, { status: 400 });
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, contact: data });
    }

    // DELETE
    if (action === 'delete') {
        const { id } = body;
        const { error } = await supabase.from('loopmail_contacts').delete().eq('id', id).eq('user_id', user.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    // BULK DELETE
    if (action === 'bulk-delete') {
        const { ids } = body;
        if (!ids?.length) return NextResponse.json({ success: false, error: 'No IDs provided' }, { status: 400 });
        const { error } = await supabase.from('loopmail_contacts').delete().in('id', ids).eq('user_id', user.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, deleted: ids.length });
    }

    // BULK IMPORT (CSV data)
    if (action === 'bulk-import') {
        const { contacts, folder_id } = body;
        if (!contacts?.length) return NextResponse.json({ success: false, error: 'No contacts' }, { status: 400 });

        // Check contact limit for import
        if (maxContacts !== -1) {
            const { count } = await supabase.from('loopmail_contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
            const remaining = maxContacts - (count || 0);
            if (remaining <= 0) {
                return NextResponse.json({ success: false, error: `Contact limit reached (${maxContacts} on ${userPlan} plan). Upgrade at /products/loopmail/pricing` }, { status: 403 });
            }
            if (contacts.length > remaining) {
                return NextResponse.json({ success: false, error: `Can only import ${remaining} more contacts (${maxContacts} limit on ${userPlan} plan). You're trying to import ${contacts.length}.` }, { status: 403 });
            }
        }

        const rows = contacts.filter(c => c.email).map(c => ({
            user_id: user.id, email: c.email, name: c.name || '', phone: c.phone || '',
            company: c.company || '', source: 'csv-import', folder_id: folder_id || null,
        }));

        const { data, error } = await supabase.from('loopmail_contacts').upsert(rows, { onConflict: 'user_id,email', ignoreDuplicates: true }).select();
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, imported: data?.length || 0 });
    }

    // MOVE to folder
    if (action === 'move') {
        const { ids, folder_id } = body;
        if (!ids?.length) return NextResponse.json({ success: false, error: 'No IDs' }, { status: 400 });
        const { error } = await supabase.from('loopmail_contacts').update({ folder_id: folder_id || null }).in('id', ids).eq('user_id', user.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
