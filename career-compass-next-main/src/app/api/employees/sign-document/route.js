import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CC_RECIPIENTS = 'ashish.cmgo@diverseloopers.com, ceo@diverseloopers.com, hr@diverseloopers.com';

function getTransporter() {
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.titan.email',
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
    });
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const document_id = formData.get('document_id');
        const employee_id = formData.get('employee_id');

        if (!file || !document_id || !employee_id) {
            return NextResponse.json({ success: false, error: 'file, document_id, and employee_id required' }, { status: 400 });
        }

        // Verify document exists and belongs to employee
        const { data: doc, error: docErr } = await supabaseAdmin
            .from('issued_documents')
            .select('*')
            .eq('id', document_id)
            .eq('employee_id', employee_id)
            .single();

        if (docErr || !doc) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
        if (!doc.requires_signature) return NextResponse.json({ success: false, error: 'This document does not require a signature' }, { status: 400 });

        // Upload signed file
        const ext = (file.name || 'doc').split('.').pop().toLowerCase();
        const fileName = `${employee_id}/signed_${document_id}_${Date.now()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadErr } = await supabaseAdmin.storage
            .from('issued-documents')
            .upload(fileName, buffer, { contentType: file.type || 'application/octet-stream', upsert: true });

        if (uploadErr) return NextResponse.json({ success: false, error: uploadErr.message }, { status: 500 });

        const { data: urlData } = supabaseAdmin.storage.from('issued-documents').getPublicUrl(fileName);
        const signedUrl = urlData.publicUrl;

        // Update document record
        const { error: updateErr } = await supabaseAdmin.from('issued_documents').update({
            is_signed: true,
            signed_file_url: signedUrl,
            signed_at: new Date().toISOString()
        }).eq('id', document_id);

        if (updateErr) return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });

        // Fetch employee for notification
        const { data: emp } = await supabaseAdmin.from('employees').select('full_name, email').eq('employee_id', employee_id).single();
        const empName = emp?.full_name || employee_id;

        // Notify admin
        await supabaseAdmin.from('notifications').insert([
            { recipient_role: 'admin', type: 'document_signed', message: `${empName} has uploaded signed "${doc.title}". Review it now.`, is_read: false },
            { recipient_role: 'employee', recipient_id: employee_id, type: 'document_signed', message: `Your signed "${doc.title}" has been submitted successfully.`, is_read: false }
        ]);

        // Email HR about signed document
        try {
            const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'hr@diverseloopers.com';
            const transporter = getTransporter();
            await transporter.sendMail({
                from: `"Diverse Loopers HR" <${senderEmail}>`,
                to: senderEmail,
                cc: CC_RECIPIENTS,
                subject: `Signed Document Received: ${doc.title} — ${empName}`,
                html: `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#333;"><p><strong>${empName}</strong> (${employee_id}) has uploaded the signed copy of <strong>${doc.title}</strong>.</p><a href="${signedUrl}" style="display:inline-block;padding:10px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">📄 View Signed Document</a></div>`,
            });
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message);
        }

        return NextResponse.json({ success: true, signed_file_url: signedUrl });
    } catch (err) {
        console.error('Sign document error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
