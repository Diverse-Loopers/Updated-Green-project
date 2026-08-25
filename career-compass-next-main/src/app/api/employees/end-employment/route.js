import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
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

export async function POST(request) {
    try {
        const { employee_id, reason, confirmation_text, auth_password } = await request.json();

        // Verify HRMS Security Authorization Password
        const authCheck = await verifyHRMSSecurityPassword(auth_password);
        if (!authCheck.valid) {
            return NextResponse.json(
                { success: false, error: authCheck.error || 'HRMS Security Authorization Password is required.' },
                { status: 403 }
            );
        }

        if (!employee_id || !reason || !confirmation_text) {
            return NextResponse.json({ success: false, error: 'employee_id, reason, and confirmation_text are required' }, { status: 400 });
        }

        // Fetch employee
        const { data: emp, error: empErr } = await supabaseAdmin
            .from('employees').select('*').eq('employee_id', employee_id).single();

        if (empErr || !emp) return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });

        // Validate confirmation text
        const expectedText = `end employment of ${emp.full_name}`.toLowerCase();
        if (confirmation_text.toLowerCase().trim() !== expectedText) {
            return NextResponse.json({ success: false, error: `Please type exactly: "end employment of ${emp.full_name}"` }, { status: 400 });
        }

        // Check if already ended
        if (emp.is_active === false) {
            return NextResponse.json({ success: false, error: 'Employment has already been ended for this employee' }, { status: 400 });
        }

        // Update employee status
        const endedAt = new Date().toISOString();
        const { error: updateErr } = await supabaseAdmin.from('employees').update({
            is_active: false,
            employment_ended_at: endedAt,
            employment_end_reason: reason
        }).eq('employee_id', employee_id);

        if (updateErr) return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });

        // Fetch all issued documents
        const { data: issuedDocs } = await supabaseAdmin
            .from('issued_documents')
            .select('title, file_url, issued_at')
            .eq('employee_id', employee_id)
            .order('issued_at', { ascending: false });

        // Build document list for email
        let docListHtml = '';
        if (issuedDocs && issuedDocs.length > 0) {
            docListHtml = '<h3 style="color:#1e293b;margin-top:24px;">Your Issued Documents</h3><p style="color:#64748b;font-size:14px;">Please download these before your access expires:</p><table style="width:100%;border-collapse:collapse;margin-top:8px;">';
            issuedDocs.forEach((doc, i) => {
                const date = new Date(doc.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                docListHtml += `<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 8px;font-size:14px;">${i + 1}. ${doc.title}</td><td style="padding:10px 8px;font-size:12px;color:#94a3b8;">${date}</td><td style="padding:10px 8px;"><a href="${doc.file_url}" target="_blank" style="color:#6C5CE7;font-size:13px;font-weight:600;text-decoration:none;">Download ↗</a></td></tr>`;
            });
            docListHtml += '</table>';
        }

        // Send email to employee
        try {
            const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'hr@diverseloopers.com';
            const transporter = getTransporter();
            await transporter.sendMail({
                from: `"Diverse Loopers HR" <${senderEmail}>`,
                to: emp.email,
                cc: CC_RECIPIENTS,
                subject: `Employment Termination Notice — Diverse Loopers`,
                html: `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:28px 32px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:20px;">Employment Termination Notice</h1>
    </div>
    <div style="background:#fff;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#1e293b;font-size:15px;line-height:1.7;">Dear <strong>${emp.full_name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.7;">We regret to inform you that your employment with Diverse Loopers has been terminated effective immediately.</p>

        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0;">
            <p style="margin:0;color:#991b1b;font-size:13px;"><strong>Reason:</strong> ${reason}</p>
        </div>

        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0;">
            <p style="margin:0;color:#92400e;font-size:13px;"><strong>⚠️ Important:</strong> Your portal access will remain active for <strong>48 hours</strong> from now. Please download all your documents before your access is revoked.</p>
        </div>

        ${docListHtml}

        <p style="color:#64748b;font-size:13px;margin-top:24px;line-height:1.6;">If you have any questions, please contact HR at hr@diverseloopers.com.</p>
        <p style="color:#64748b;font-size:13px;">Best regards,<br><strong>HR Team</strong><br>Diverse Loopers</p>
    </div>
</div>`,
            });
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message);
        }

        // Notifications
        await supabaseAdmin.from('notifications').insert([
            { recipient_role: 'employee', recipient_id: employee_id, type: 'employment_ended', message: `Your employment has been terminated. You have 48 hours to download your documents. Reason: ${reason}`, is_read: false },
            { recipient_role: 'admin', type: 'employment_ended', message: `Employment ended for ${emp.full_name} (${employee_id}). Reason: ${reason}`, is_read: false }
        ]);

        return NextResponse.json({
            success: true,
            message: `Employment ended for ${emp.full_name}. Access will be revoked in 48 hours.`,
            ended_at: endedAt,
            documents_count: issuedDocs?.length || 0
        });

    } catch (err) {
        console.error('End employment error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
