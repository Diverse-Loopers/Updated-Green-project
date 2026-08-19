import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET — List all active templates
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('document_templates')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, templates: data || [] });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST — Create or update a template
export async function POST(request) {
    try {
        const { id, name, slug, category, html_content, requires_signature, has_qr } = await request.json();

        if (!name || !html_content) {
            return NextResponse.json({ success: false, error: 'name and html_content are required' }, { status: 400 });
        }

        if (id) {
            // Update existing
            const { error } = await supabaseAdmin.from('document_templates').update({
                name, slug, category, html_content, requires_signature: requires_signature || false, has_qr: has_qr !== false
            }).eq('id', id);
            if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            return NextResponse.json({ success: true, message: 'Template updated' });
        } else {
            // Create new
            const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const { data, error } = await supabaseAdmin.from('document_templates').insert([{
                name, slug: finalSlug, category: category || 'certificate',
                html_content, requires_signature: requires_signature || false, has_qr: has_qr !== false
            }]).select().single();
            if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            return NextResponse.json({ success: true, template: data });
        }
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// DELETE — Deactivate a template
export async function DELETE(request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });

        const { error } = await supabaseAdmin.from('document_templates').update({ is_active: false }).eq('id', id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Template deactivated' });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
