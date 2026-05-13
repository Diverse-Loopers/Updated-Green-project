import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const folderId = searchParams.get('folder_id');

        let query = supabase
            .from('marketing_contacts')
            .select('*')
            .eq('is_subscribed', true)
            .order('created_at', { ascending: false });

        if (folderId === 'unassigned') {
            query = query.is('folder_id', null);
        } else if (folderId) {
            query = query.eq('folder_id', folderId);
        }

        if (search) {
            query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%`);
        }

        const { data, error } = await query.limit(500);
        if (error) throw error;

        const { count: totalCount } = await supabase
            .from('marketing_contacts')
            .select('*', { count: 'exact', head: true })
            .eq('is_subscribed', true);

        return NextResponse.json({ success: true, contacts: data || [], total: totalCount || 0 });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { action, ...body } = await req.json();

        if (action === 'create') {
            const { email, name, phone, company, source, tags, folder_id } = body;
            if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
            const row = { email: email.toLowerCase().trim(), name, phone, company, source: source || 'manual', tags: tags || [] };
            if (folder_id) row.folder_id = folder_id;
            const { data, error } = await supabase.from('marketing_contacts').upsert(row, { onConflict: 'email' }).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, contact: data });
        }

        if (action === 'bulk-import') {
            const { contacts, folder_id } = body;
            if (!contacts?.length) return NextResponse.json({ success: false, error: 'No contacts' }, { status: 400 });
            const formatted = contacts.map(c => ({
                email: c.email?.toLowerCase().trim(), name: c.name || null, phone: c.phone || null,
                company: c.company || null, source: 'import', tags: c.tags || [], is_subscribed: true,
                ...(folder_id ? { folder_id } : {})
            })).filter(c => c.email);
            const { data, error } = await supabase.from('marketing_contacts').upsert(formatted, { onConflict: 'email', ignoreDuplicates: true }).select();
            if (error) throw error;
            return NextResponse.json({ success: true, imported: data?.length || 0 });
        }

        if (action === 'import-applicants') {
            const { folder_id } = body;
            const { data: apps, error: appErr } = await supabase.from('applications').select('applicant_email, applicant_name, applicant_phone');
            if (appErr) throw appErr;
            const contacts = (apps || []).map(a => ({
                email: a.applicant_email?.toLowerCase().trim(), name: a.applicant_name || null,
                phone: a.applicant_phone || null, source: 'career_form', tags: ['applicant'], is_subscribed: true,
                ...(folder_id ? { folder_id } : {})
            })).filter(c => c.email);
            if (!contacts.length) return NextResponse.json({ success: true, imported: 0 });
            const { data, error } = await supabase.from('marketing_contacts').upsert(contacts, { onConflict: 'email', ignoreDuplicates: true }).select();
            if (error) throw error;
            return NextResponse.json({ success: true, imported: data?.length || 0 });
        }

        if (action === 'move') {
            const { ids, folder_id } = body;
            if (!ids?.length) return NextResponse.json({ success: false, error: 'No contacts selected' }, { status: 400 });
            const { error } = await supabase.from('marketing_contacts').update({ folder_id: folder_id || null }).in('id', ids);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            const { id } = body;
            if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
            const { error } = await supabase.from('marketing_contacts').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'unsubscribe') {
            const { id } = body;
            const { error } = await supabase.from('marketing_contacts').update({ is_subscribed: false }).eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
