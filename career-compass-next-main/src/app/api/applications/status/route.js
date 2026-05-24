import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function createTransporter() {
    const port = parseInt(process.env.SMTP_PORT || '465');
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.titan.email',
        port, secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
    });
}

async function getTemplate(key) {
    const { data } = await supabase.from('hr_email_templates').select('*').eq('template_key', key).single();
    return data;
}

function personalizeTemplate(template, vars) {
    let subject = template.subject;
    let body = template.body;
    for (const [k, v] of Object.entries(vars)) {
        const re = new RegExp(`\\{\\{${k}\\}\\}`, 'g');
        subject = subject.replace(re, v || '');
        body = body.replace(re, v || '');
    }
    return { subject, body };
}

async function sendStatusEmail(app, status) {
    try {
        const template = await getTemplate(status);
        if (!template) return { sent: false, reason: 'No template' };

        const { subject, body } = personalizeTemplate(template, {
            name: app.applicant_name || 'Applicant',
            job_title: app.job_title || 'the position',
            email: app.applicant_email,
            status: status,
        });

        const transporter = createTransporter();
        const from = `"Diverse Loopers HR" <${process.env.SMTP_FROM || 'hr@diverseloopers.com'}>`;
        await transporter.sendMail({
            from, to: app.applicant_email, subject, html: body,
            bcc: process.env.SMTP_FROM || 'hr@diverseloopers.com',
        });
        return { sent: true };
    } catch (err) {
        console.error(`Email to ${app.applicant_email} failed:`, err.message);
        return { sent: false, reason: err.message };
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { applicationId, applicationIds, status } = body;

        const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'interviewed'];
        if (!status || !validStatuses.includes(status)) {
            return Response.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        // Support both single and bulk
        const ids = applicationIds || (applicationId ? [applicationId] : []);
        if (!ids.length) return Response.json({ success: false, error: 'No application IDs' }, { status: 400 });

        const results = [];
        const shouldEmail = ['shortlisted', 'rejected'].includes(status);

        for (const id of ids) {
            // Update status
            const { data, error } = await supabase
                .from('applications')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                results.push({ id, success: false, error: error.message });
                continue;
            }

            // Send email if shortlisted/rejected
            let emailResult = { sent: false };
            if (shouldEmail && data.applicant_email) {
                emailResult = await sendStatusEmail(data, status);
                await sleep(1000); // Throttle for Titan
            }

            results.push({ id, success: true, emailSent: emailResult.sent, applicant: data.applicant_name });
        }

        const updated = results.filter(r => r.success).length;
        const emailed = results.filter(r => r.emailSent).length;

        return Response.json({
            success: true,
            updated,
            emailed,
            total: ids.length,
            results,
            message: `${updated} application(s) marked as ${status}. ${emailed} email(s) sent.`
        });
    } catch (error) {
        console.error('Status update error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        if (!email) return Response.json({ success: false, error: 'Email required' }, { status: 400 });

        const { data, error } = await supabase
            .from('applications')
            .select('id, job_title, status, submitted_at, applicant_name')
            .ilike('applicant_email', email)
            .order('submitted_at', { ascending: false });
        if (error) throw error;

        return Response.json({ success: true, applications: data || [] });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
