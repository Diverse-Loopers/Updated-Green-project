import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_DOC_TYPES = ['aadhaar', 'pan', 'qualification', 'bank_details'];

// GET — Fetch documents for an employee
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const employee_id = searchParams.get('employee_id');

        if (!employee_id) {
            return NextResponse.json({ success: false, error: 'employee_id is required' }, { status: 400 });
        }

        const { data: documents, error } = await supabaseAdmin
            .from('employee_documents')
            .select('*')
            .eq('employee_id', employee_id)
            .order('uploaded_at', { ascending: true });

        if (error) {
            console.error('Fetch documents error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const uploadedTypes = (documents || []).map(d => d.doc_type);
        const missing = VALID_DOC_TYPES.filter(t => !uploadedTypes.includes(t));

        return NextResponse.json({
            success: true,
            documents: documents || [],
            missing,
            total: VALID_DOC_TYPES.length,
            uploaded: uploadedTypes.length
        });
    } catch (error) {
        console.error('Documents GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST — Upload a document
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const employee_id = formData.get('employee_id');
        const doc_type = formData.get('doc_type');

        if (!file || !employee_id || !doc_type) {
            return NextResponse.json({ success: false, error: 'file, employee_id, and doc_type are required' }, { status: 400 });
        }

        if (!VALID_DOC_TYPES.includes(doc_type)) {
            return NextResponse.json({ success: false, error: `Invalid doc_type. Must be one of: ${VALID_DOC_TYPES.join(', ')}` }, { status: 400 });
        }

        // Get file extension
        const fileName = file.name || 'document';
        const ext = fileName.split('.').pop().toLowerCase();
        const timestamp = Date.now();
        const storagePath = `${employee_id}/${doc_type}_${timestamp}.${ext}`;

        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('employee-documents')
            .upload(storagePath, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: true
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('employee-documents')
            .getPublicUrl(storagePath);

        const file_url = urlData.publicUrl;

        // Delete old document record of same type if exists
        await supabaseAdmin
            .from('employee_documents')
            .delete()
            .eq('employee_id', employee_id)
            .eq('doc_type', doc_type);

        // Insert new document record
        const { error: dbError } = await supabaseAdmin
            .from('employee_documents')
            .insert([{
                employee_id,
                doc_type,
                file_name: fileName,
                file_url,
                file_type: file.type || 'application/octet-stream'
            }]);

        if (dbError) {
            console.error('DB insert error:', dbError);
            return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            file_url,
            doc_type,
            file_name: fileName
        });
    } catch (error) {
        console.error('Document upload error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
