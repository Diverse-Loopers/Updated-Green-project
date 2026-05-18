import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// contact@diverseloopers.com SMTP config (use env vars)
function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.DL_SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.DL_SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.DL_SMTP_USER || 'contact@diverseloopers.com',
            pass: process.env.DL_SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
    });
}

/**
 * Replace template placeholders with actual data
 */
function fillTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, value || '');
    }
    return result;
}

/**
 * Send onboarding emails (welcome + how-to) to the user
 * @param {Object} params
 * @param {string} params.accountEmail - User's Supabase auth email
 * @param {string} params.workEmail - Work email from onboarding form
 * @param {Object} params.data - Template data (full_name, organization, plan, etc.)
 */
export async function sendOnboardingEmails({ accountEmail, workEmail, data }) {
    try {
        // Fetch active templates
        const { data: templates, error } = await supabase
            .from('email_templates')
            .select('*')
            .in('slug', ['welcome_email', 'howto_email'])
            .eq('is_active', true);

        if (error || !templates?.length) {
            console.error('No email templates found:', error);
            return { success: false, error: 'Templates not found' };
        }

        const transporter = getTransporter();

        // Collect unique recipient emails (account email + work email, deduplicated)
        const recipients = new Set();
        if (accountEmail) recipients.add(accountEmail.toLowerCase());
        if (workEmail) recipients.add(workEmail.toLowerCase());
        const toList = Array.from(recipients).join(', ');

        if (!toList) return { success: false, error: 'No recipients' };

        const templateData = {
            full_name: data.full_name || '',
            organization: data.organization || '',
            plan: data.plan || 'basic',
            product: data.product || 'LoopMail',
            transaction_id: data.transaction_id || 'FREE-' + Date.now(),
            work_email: data.work_email || workEmail || '',
            billing_address: data.billing_address || '',
            industry: data.industry || '',
            company_size: data.company_size || '',
            country: data.country || '',
            phone: data.phone || '',
            gst_number: data.gst_number || '',
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        };

        const results = [];

        for (const tpl of templates) {
            const subject = fillTemplate(tpl.subject, templateData);
            const html = fillTemplate(tpl.body_html, templateData);

            try {
                await transporter.sendMail({
                    from: `"Diverse Loopers" <${process.env.DL_SMTP_USER || 'contact@diverseloopers.com'}>`,
                    to: toList,
                    subject,
                    html,
                });
                results.push({ slug: tpl.slug, sent: true });
            } catch (sendErr) {
                console.error(`Failed to send ${tpl.slug}:`, sendErr.message);
                results.push({ slug: tpl.slug, sent: false, error: sendErr.message });
            }
        }

        return { success: true, results };
    } catch (err) {
        console.error('sendOnboardingEmails error:', err);
        return { success: false, error: err.message };
    }
}
