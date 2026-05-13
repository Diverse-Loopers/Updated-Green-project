import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: List all folders with contact counts
export async function GET() {
    try {
        const { data: folders, error } = await supabase
            .from('contact_folders')
            .select('*')
            .order('created_at', { ascending: true });
        if (error) throw error;

        // Get counts per folder
        const { data: contacts } = await supabase
            .from('marketing_contacts')
            .select('folder_id')
            .eq('is_subscribed', true);

        const counts = {};
        let unassigned = 0;
        (contacts || []).forEach(c => {
            if (c.folder_id) counts[c.folder_id] = (counts[c.folder_id] || 0) + 1;
            else unassigned++;
        });

        const result = (folders || []).map(f => ({
            ...f,
            contact_count: counts[f.id] || 0
        }));

        return NextResponse.json({ success: true, folders: result, unassigned });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: CRUD operations
export async function POST(req) {
    try {
        const { action, ...body } = await req.json();

        if (action === 'create') {
            const { name, description } = body;
            if (!name?.trim()) return NextResponse.json({ success: false, error: 'Folder name required' }, { status: 400 });
            const { data, error } = await supabase
                .from('contact_folders')
                .insert({ name: name.trim(), description: description || null })
                .select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, folder: data });
        }

        if (action === 'rename') {
            const { id, name } = body;
            if (!id || !name?.trim()) return NextResponse.json({ success: false, error: 'ID and name required' }, { status: 400 });
            const { error } = await supabase.from('contact_folders').update({ name: name.trim(), updated_at: new Date().toISOString() }).eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'update-description') {
            const { id, description } = body;
            const { error } = await supabase.from('contact_folders').update({ description, updated_at: new Date().toISOString() }).eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            const { id } = body;
            if (!id) return NextResponse.json({ success: false, error: 'Folder ID required' }, { status: 400 });
            // Set contacts in this folder to null (unassigned)
            await supabase.from('marketing_contacts').update({ folder_id: null }).eq('folder_id', id);
            const { error } = await supabase.from('contact_folders').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
