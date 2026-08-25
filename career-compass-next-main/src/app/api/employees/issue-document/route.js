import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { verifyHRMSSecurityPassword } from '@/lib/hrms-security';

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

function fillTemplate(html, data) {
    let result = html;
    for (const [key, value] of Object.entries(data)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
    }
    return result;
}

// POST — Issue a document (template-based or custom)
export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || '';

        // Custom document upload (FormData)
        if (contentType.includes('multipart/form-data')) {
            return handleCustomDocument(request);
        }

        // Template-based document (JSON)
        return handleTemplateDocument(request);
    } catch (err) {
        console.error('Issue document error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET — Fetch issued documents for an employee
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const employee_id = searchParams.get('employee_id');
        if (!employee_id) return NextResponse.json({ success: false, error: 'employee_id required' }, { status: 400 });

        const { data, error } = await supabaseAdmin
            .from('issued_documents')
            .select('*, document_templates(name, category)')
            .eq('employee_id', employee_id)
            .order('issued_at', { ascending: false });

        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, documents: data || [] });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

async function handleTemplateDocument(request) {
    const { employee_id, template_id, join_date, email_subject, email_body, auth_password } = await request.json();

    // Verify HRMS Security Authorization Password
    const authCheck = await verifyHRMSSecurityPassword(auth_password);
    if (!authCheck.valid) {
        return NextResponse.json({ success: false, error: authCheck.error || 'HRMS Security Authorization Password is required.' }, { status: 403 });
    }

    if (!employee_id || !template_id) {
        return NextResponse.json({ success: false, error: 'employee_id and template_id required' }, { status: 400 });
    }

    // Fetch employee
    const { data: emp, error: empErr } = await supabaseAdmin
        .from('employees').select('*').eq('employee_id', employee_id).single();
    if (empErr || !emp) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

    // Fetch template
    const { data: tpl, error: tplErr } = await supabaseAdmin
        .from('document_templates').select('*').eq('id', template_id).single();
    if (tplErr || !tpl) return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });

    // Generate verification code
    const verificationCode = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://diverseloopers.com';
    const verifyUrl = `${baseUrl}/verify/${verificationCode}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

    // Fetch employee's manager
    let managerName = '', managerDesignation = '', managerSignatureUrl = '', projectName = '';
    const { data: mgrAssignment } = await supabaseAdmin
        .from('employee_managers')
        .select('manager_id')
        .eq('employee_id', employee_id)
        .maybeSingle();
    
    if (mgrAssignment?.manager_id) {
        const { data: mgr } = await supabaseAdmin
            .from('managers')
            .select('name, designation, signature_url, project_name')
            .eq('id', mgrAssignment.manager_id)
            .maybeSingle();
        if (mgr) {
            managerName = mgr.name || '';
            managerDesignation = mgr.designation || '';
            managerSignatureUrl = mgr.signature_url || '';
            projectName = mgr.project_name || '';
        }
    }

    // Fill template placeholders
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const templateData = {
        name: emp.full_name || '',
        employee_id: emp.employee_id || '',
        designation: emp.designation || '',
        department: emp.department || '',
        email: emp.email || '',
        join_date: join_date || '',
        date: today,
        company: 'Diverse Loopers',
        qr_code: tpl.has_qr ? `<img src="${qrUrl}" alt="QR Verification" style="width:120px;height:120px;" />` : '',
        verification_url: verifyUrl,
        verification_code: verificationCode,
        reporting_manager: managerName,
        manager_designation: managerDesignation,
        manager_signature: managerSignatureUrl ? `<img src="${managerSignatureUrl}" alt="Manager Signature" style="max-height:60px;" />` : '',
        project_name: projectName,
    };

    const filledHtml = fillTemplate(tpl.html_content, templateData);

    // Wrap in a full HTML document for download
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${tpl.name} - ${emp.full_name}</title><style>@media print{body{margin:0;padding:0;}}</style></head><body>${filledHtml}</body></html>`;

    // Upload to Supabase Storage
    const fileName = `${employee_id}/${tpl.slug}_${Date.now()}.html`;
    const { error: uploadErr } = await supabaseAdmin.storage
        .from('issued-documents')
        .upload(fileName, Buffer.from(fullHtml), { contentType: 'text/html', upsert: true });

    if (uploadErr) return NextResponse.json({ success: false, error: uploadErr.message }, { status: 500 });

    const { data: urlData } = supabaseAdmin.storage.from('issued-documents').getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;

    // Insert record
    const { data: issuedDoc, error: dbErr } = await supabaseAdmin.from('issued_documents').insert([{
        employee_id, template_id, title: tpl.name, doc_type: 'template',
        file_url: fileUrl, verification_code: tpl.has_qr ? verificationCode : null,
        has_qr: tpl.has_qr, requires_signature: tpl.requires_signature,
        is_signed: false, issued_by: 'admin'
    }]).select().single();

    if (dbErr) return NextResponse.json({ success: false, error: dbErr.message }, { status: 500 });

    // Send email
    const subject = email_subject || `${tpl.name} — Diverse Loopers`;
    const body = email_body || `Dear ${emp.full_name},\n\nPlease find your ${tpl.name} attached below.\n\n${tpl.requires_signature ? '⚠️ This document requires your signature. Please download, sign, and upload the signed copy from your Employee Dashboard.\n\n' : ''}You can view and download this document anytime from your Employee Dashboard.\n\nBest regards,\nHR Team\nDiverse Loopers`;

    try {
        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'hr@diverseloopers.com';
        const transporter = getTransporter();
        const viewUrl = `${baseUrl}/view-document/${issuedDoc.id}`;
        await transporter.sendMail({
            from: `"Diverse Loopers HR" <${senderEmail}>`,
            to: emp.email,
            cc: CC_RECIPIENTS,
            subject,
            html: `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#333;">${body.replace(/\n/g, '<br>')}<br><br><a href="${viewUrl}" style="display:inline-block;padding:10px 24px;background:#6C5CE7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">📄 View Document</a></div>`,
        });
    } catch (emailErr) {
        console.error('Email failed:', emailErr.message);
    }

    // Notifications
    await supabaseAdmin.from('notifications').insert([
        { recipient_role: 'employee', recipient_id: employee_id, type: 'document_issued', message: `New document issued: ${tpl.name}. Check your Documents section.`, is_read: false },
        { recipient_role: 'admin', type: 'document_issued', message: `${tpl.name} issued to ${emp.full_name} (${employee_id})`, is_read: false }
    ]);

    return NextResponse.json({ success: true, document: issuedDoc, file_url: fileUrl });
}

async function handleCustomDocument(request) {
    const formData = await request.formData();
    const file = formData.get('file');
    const employee_id = formData.get('employee_id');
    const title = formData.get('title');
    const emailSubject = formData.get('email_subject');
    const emailBody = formData.get('email_body');
    const authPassword = formData.get('auth_password');

    // Verify HRMS Security Authorization Password
    const authCheck = await verifyHRMSSecurityPassword(authPassword);
    if (!authCheck.valid) {
        return NextResponse.json({ success: false, error: authCheck.error || 'HRMS Security Authorization Password is required.' }, { status: 403 });
    }

    if (!file || !employee_id || !title) {
        return NextResponse.json({ success: false, error: 'file, employee_id, and title required' }, { status: 400 });
    }

    // Fetch employee
    const { data: emp } = await supabaseAdmin.from('employees').select('*').eq('employee_id', employee_id).single();
    if (!emp) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

    // Upload file
    const ext = (file.name || 'doc').split('.').pop().toLowerCase();
    const fileName = `${employee_id}/custom_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabaseAdmin.storage
        .from('issued-documents')
        .upload(fileName, buffer, { contentType: file.type || 'application/octet-stream', upsert: true });

    if (uploadErr) return NextResponse.json({ success: false, error: uploadErr.message }, { status: 500 });

    const { data: urlData } = supabaseAdmin.storage.from('issued-documents').getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;

    // Insert record (no QR for custom docs)
    const { data: issuedDoc, error: dbErr } = await supabaseAdmin.from('issued_documents').insert([{
        employee_id, template_id: null, title, doc_type: 'custom',
        file_url: fileUrl, verification_code: null, has_qr: false,
        requires_signature: false, is_signed: false, issued_by: 'admin'
    }]).select().single();

    if (dbErr) return NextResponse.json({ success: false, error: dbErr.message }, { status: 500 });

    // Send email
    try {
        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'hr@diverseloopers.com';
        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"Diverse Loopers HR" <${senderEmail}>`,
            to: emp.email,
            cc: CC_RECIPIENTS,
            subject: emailSubject || `Document: ${title} — Diverse Loopers`,
            html: `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#333;">${(emailBody || `Dear ${emp.full_name},\n\nPlease find the attached document: ${title}.\n\nBest regards,\nHR Team\nDiverse Loopers`).replace(/\n/g, '<br>')}<br><br><a href="${fileUrl}" style="display:inline-block;padding:10px 24px;background:#6C5CE7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">📄 View Document</a></div>`,
        });
    } catch (emailErr) {
        console.error('Email failed:', emailErr.message);
    }

    // Notifications
    await supabaseAdmin.from('notifications').insert([
        { recipient_role: 'employee', recipient_id: employee_id, type: 'document_issued', message: `New document issued: ${title}. Check your Documents section.`, is_read: false },
        { recipient_role: 'admin', type: 'document_issued', message: `${title} issued to ${emp.full_name} (${employee_id})`, is_read: false }
    ]);

    return NextResponse.json({ success: true, document: issuedDoc, file_url: fileUrl });
}
