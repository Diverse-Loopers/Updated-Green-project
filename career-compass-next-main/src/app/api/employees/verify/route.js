import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) return NextResponse.json({ success: false, error: 'code is required' }, { status: 400 });

        const { data: doc, error } = await supabaseAdmin
            .from('issued_documents')
            .select('*')
            .eq('verification_code', code)
            .single();

        if (error || !doc) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });

        const { data: emp } = await supabaseAdmin
            .from('employees')
            .select('full_name, employee_id, designation, department')
            .eq('employee_id', doc.employee_id)
            .single();

        return NextResponse.json({
            success: true,
            document_title: doc.title,
            issued_date: new Date(doc.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            verification_code: code,
            employee_name: emp?.full_name || 'N/A',
            employee_id: emp?.employee_id || 'N/A',
            designation: emp?.designation || 'N/A',
            department: emp?.department || 'N/A',
        });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
