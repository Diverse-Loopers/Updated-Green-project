import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const docType = formData.get('doc_type') || 'document';
        const studentName = formData.get('student_name') || 'student';

        if (!file || typeof file === 'string') {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileExt = file.name.split('.').pop() || 'pdf';
        const fileName = `${docType}_${sanitizedName}_${Date.now()}.${fileExt}`;

        // Attempt upload to placement-documents bucket
        let publicUrl = '';
        let bucketName = 'placement-documents';

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: file.type || 'application/pdf',
                upsert: true
            });

        if (uploadError) {
            console.warn(`Upload to ${bucketName} failed (${uploadError.message}), attempting issued-documents bucket...`);
            bucketName = 'issued-documents';
            const { error: fallbackError } = await supabaseAdmin.storage
                .from(bucketName)
                .upload(fileName, buffer, {
                    contentType: file.type || 'application/pdf',
                    upsert: true
                });

            if (fallbackError) {
                console.warn('Bucket upload failed, creating base64 data URL fallback...');
                const base64 = buffer.toString('base64');
                publicUrl = `data:${file.type || 'application/pdf'};base64,${base64}`;
            } else {
                const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
            }
        } else {
            const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(fileName);
            publicUrl = urlData.publicUrl;
        }

        return NextResponse.json({
            success: true,
            url: publicUrl,
            file_name: file.name,
            size: file.size
        });
    } catch (err) {
        console.error('Document upload error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
