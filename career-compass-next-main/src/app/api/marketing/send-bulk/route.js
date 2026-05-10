import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const domainCache = new Map();
const blocked = ['example.com','test.com','fake.com','mailinator.com','tempmail.com','guerrillamail.com','yopmail.com','throwaway.email'];

async function isEmailValid(email) {
    if (!email || !emailRegex.test(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    if (blocked.includes(domain)) return false;
    if (domainCache.has(domain)) return domainCache.get(domain);
    try {
        const mx = await resolveMx(domain);
        const valid = mx && mx.length > 0;
        domainCache.set(domain, valid);
        return valid;
    } catch { domainCache.set(domain, false); return false; }
}

export async function POST(req) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let contactIds, subject, htmlBody, title;
        let fileAttachments = [];

        if (contentType.includes('multipart/form-data')) {
            // Handle FormData with file attachments
            const formData = await req.formData();
            contactIds = JSON.parse(formData.get('contactIds') || '[]');
            subject = formData.get('subject');
            htmlBody = formData.get('htmlBody');
            title = formData.get('title');

            // Collect file attachments
            for (const [key, value] of formData.entries()) {
                if (key.startsWith('file_') && value instanceof File) {
                    const buffer = Buffer.from(await value.arrayBuffer());
                    fileAttachments.push({
                        filename: value.name,
                        content: buffer,
                        contentType: value.type,
                    });
                }
            }
        } else {
            // Handle JSON
            const body = await req.json();
            contactIds = body.contactIds;
            subject = body.subject;
            htmlBody = body.htmlBody;
            title = body.title;
        }

        if (!subject || !htmlBody || !contactIds?.length) {
            return NextResponse.json({ success: false, error: 'Subject, body, and contacts are required' }, { status: 400 });
        }

        // Create transporter
        const port = parseInt(process.env.CMO_SMTP_PORT || '465');
        const transporter = nodemailer.createTransport({
            host: process.env.CMO_SMTP_HOST || 'smtp.titan.email',
            port, secure: port === 465,
            auth: { user: process.env.CMO_SMTP_USER, pass: process.env.CMO_SMTP_PASS },
            tls: { rejectUnauthorized: false },
        });

        // Fetch contacts
        const { data: contacts, error: cErr } = await supabase
            .from('marketing_contacts').select('id, email, name')
            .in('id', contactIds).eq('is_subscribed', true);
        if (cErr) throw cErr;
        if (!contacts?.length) return NextResponse.json({ success: false, error: 'No valid contacts' }, { status: 400 });

        // Validate emails
        const valid = [], skipped = [];
        for (const c of contacts) {
            (await isEmailValid(c.email)) ? valid.push(c) : skipped.push(c);
        }
        if (!valid.length) {
            return NextResponse.json({ success: false, error: `All ${contacts.length} emails failed validation.`, skipped: skipped.map(c=>c.email) }, { status: 400 });
        }

        // Create campaign
        const { data: campaign, error: campErr } = await supabase
            .from('email_campaigns').insert({
                title: title || subject, subject, body: htmlBody,
                sent_by: process.env.CMO_SMTP_FROM || 'contact@diverseloopers.com',
                recipient_count: valid.length, status: 'sending',
            }).select().single();
        if (campErr) throw campErr;
        const campId = campaign.id;

        // Insert recipients
        await supabase.from('campaign_recipients').insert([
            ...valid.map(c => ({ campaign_id: campId, contact_id: c.id, email: c.email, status: 'pending' })),
            ...skipped.map(c => ({ campaign_id: campId, contact_id: c.id, email: c.email, status: 'failed', error_message: 'Invalid email domain' })),
        ]);

        // Send in batches
        const BATCH = 5;
        let delivered = 0, failed = skipped.length;
        const from = `"Diverse Loopers" <${process.env.CMO_SMTP_FROM || 'contact@diverseloopers.com'}>`;

        for (let i = 0; i < valid.length; i += BATCH) {
            const batch = valid.slice(i, i + BATCH);
            const results = await Promise.allSettled(batch.map(async (contact) => {
                // Personalize: use name if available, else "Dear User"
                const greeting = contact.name ? contact.name : 'User';
                const body = htmlBody
                    .replace(/\{\{name\}\}/g, greeting)
                    .replace(/\{\{email\}\}/g, contact.email);

                const mailOpts = {
                    from, to: contact.email, subject, html: body,
                };

                // Add attachments if any
                if (fileAttachments.length > 0) {
                    mailOpts.attachments = fileAttachments;
                }

                await transporter.sendMail(mailOpts);
                return contact;
            }));

            for (let j = 0; j < results.length; j++) {
                const c = batch[j];
                if (results[j].status === 'fulfilled') {
                    delivered++;
                    await supabase.from('campaign_recipients')
                        .update({ status: 'sent', sent_at: new Date().toISOString() })
                        .eq('campaign_id', campId).eq('contact_id', c.id);
                } else {
                    failed++;
                    await supabase.from('campaign_recipients')
                        .update({ status: 'failed', error_message: results[j].reason?.message || 'Unknown' })
                        .eq('campaign_id', campId).eq('contact_id', c.id);
                }
            }
            if (i + BATCH < valid.length) await sleep(5000);
        }

        await supabase.from('email_campaigns').update({
            status: failed === contacts.length ? 'failed' : 'sent',
            delivered_count: delivered, failed_count: failed,
            sent_at: new Date().toISOString(),
        }).eq('id', campId);

        return NextResponse.json({ success: true, campaignId: campId, delivered, failed, skipped: skipped.length, total: contacts.length });
    } catch (err) {
        console.error('Bulk send error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
