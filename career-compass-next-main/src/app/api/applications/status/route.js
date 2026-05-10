import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { applicationId, status } = await request.json();

        const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'interviewed'];
        if (!applicationId || !status || !validStatuses.includes(status)) {
            return Response.json({ success: false, error: 'Invalid applicationId or status' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId)
            .select()
            .single();

        if (error) throw error;

        return Response.json({ success: true, application: data });
    } catch (error) {
        console.error('Status update error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return Response.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('applications')
            .select('id, job_title, status, submitted_at, applicant_name')
            .eq('applicant_email', email)
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        return Response.json({ success: true, applications: data || [] });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
