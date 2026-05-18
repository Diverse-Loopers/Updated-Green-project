import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET — Fetch all templates
export async function GET() {
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, templates: data || [] });
}

// POST — Update a template
export async function POST(req) {
    const { id, subject, body_html, is_active } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });

    const updates = { updated_at: new Date().toISOString() };
    if (subject !== undefined) updates.subject = subject;
    if (body_html !== undefined) updates.body_html = body_html;
    if (is_active !== undefined) updates.is_active = is_active;

    const { error } = await supabase.from('email_templates').update(updates).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
