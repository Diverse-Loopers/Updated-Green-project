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

// GET — List folders
export async function GET(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('loopmail_contact_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, folders: data || [] });
}

// POST — Create, Rename, Delete
export async function POST(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
        const { name, description } = body;
        if (!name?.trim()) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 });
        const { data, error } = await supabase.from('loopmail_contact_folders').insert({
            user_id: user.id, name: name.trim(), description: description || '',
        }).select().single();
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, folder: data });
    }

    if (action === 'rename') {
        const { id, name } = body;
        if (!id || !name?.trim()) return NextResponse.json({ success: false, error: 'ID and name required' }, { status: 400 });
        const { error } = await supabase.from('loopmail_contact_folders').update({ name: name.trim() }).eq('id', id).eq('user_id', user.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        // Unassign contacts first
        await supabase.from('loopmail_contacts').update({ folder_id: null }).eq('folder_id', id).eq('user_id', user.id);
        const { error } = await supabase.from('loopmail_contact_folders').delete().eq('id', id).eq('user_id', user.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
