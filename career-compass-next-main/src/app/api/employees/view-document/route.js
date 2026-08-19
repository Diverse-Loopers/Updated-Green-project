import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });

        // Fetch the issued document
        const { data: doc, error } = await supabaseAdmin
            .from('issued_documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !doc) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });

        // If it's a template-based document (HTML stored in Supabase Storage), fetch the HTML
        if (doc.doc_type === 'template' && doc.file_url) {
            try {
                const response = await fetch(doc.file_url);
                const html = await response.text();

                // Extract just the body content if it's a full HTML document
                const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);
                const content = bodyMatch ? bodyMatch[1] : html;

                return NextResponse.json({
                    success: true,
                    title: doc.title,
                    html_content: content,
                    doc_type: doc.doc_type,
                    file_url: doc.file_url
                });
            } catch (fetchErr) {
                return NextResponse.json({ success: false, error: 'Failed to fetch document content' }, { status: 500 });
            }
        }

        // For custom documents, just return the file URL
        return NextResponse.json({
            success: true,
            title: doc.title,
            doc_type: doc.doc_type,
            file_url: doc.file_url,
            html_content: `<div style="text-align:center;padding:3rem;font-family:Arial,sans-serif"><h2>${doc.title}</h2><p style="color:#64748b">This is a custom document.</p><a href="${doc.file_url}" target="_blank" style="display:inline-block;margin-top:1rem;padding:10px 24px;background:#6C5CE7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Download Document</a></div>`
        });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
