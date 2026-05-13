import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET: fetch all templates
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('hr_email_templates')
            .select('*')
            .order('template_key');
        if (error) throw error;
        return Response.json({ success: true, templates: data || [] });
    } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: update a template
export async function POST(request) {
    try {
        const { template_key, subject, body } = await request.json();
        if (!template_key) return Response.json({ success: false, error: 'template_key required' }, { status: 400 });

        const updates = { updated_at: new Date().toISOString() };
        if (subject !== undefined) updates.subject = subject;
        if (body !== undefined) updates.body = body;

        const { data, error } = await supabase
            .from('hr_email_templates')
            .update(updates)
            .eq('template_key', template_key)
            .select()
            .single();
        if (error) throw error;
        return Response.json({ success: true, template: data });
    } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}
