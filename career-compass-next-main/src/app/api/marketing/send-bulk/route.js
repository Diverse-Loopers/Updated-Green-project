import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyExecutiveSession } from '@/lib/executive-auth';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

// Track running campaigns in memory
const runningCampaigns = new Map();

// Background sender function
async function sendInBackground(campId, validContacts, skippedContacts, htmlBody, subject, from, cc, bcc, fileAttachments) {
    const port = parseInt(process.env.CMO_SMTP_PORT || '465');
    const transporter = nodemailer.createTransport({
        host: process.env.CMO_SMTP_HOST || 'smtp.titan.email',
        port, secure: port === 465,
        auth: { user: process.env.CMO_SMTP_USER, pass: process.env.CMO_SMTP_PASS },
        tls: { rejectUnauthorized: false },
    });

    const state = { status: 'sending', delivered: 0, failed: skippedContacts.length, bounceCount: 0, total: validContacts.length + skippedContacts.length, current: 0, paused: false, pauseUntil: null };
    runningCampaigns.set(campId, state);

    const BATCH = 5;
    const MAX_BOUNCES_BEFORE_PAUSE = 2;
    const PAUSE_MS = 60 * 60 * 1000; // 1 hour

    for (let i = 0; i < validContacts.length; i++) {
        const contact = validContacts[i];
        state.current = i + 1;

        // Check if we need to pause
        if (state.bounceCount > 0 && state.bounceCount % MAX_BOUNCES_BEFORE_PAUSE === 0 && !state.paused) {
            state.paused = true;
            state.pauseUntil = new Date(Date.now() + PAUSE_MS).toISOString();
            state.status = 'paused';
            await supabase.from('email_campaigns').update({ status: 'paused' }).eq('id', campId);
            await sleep(PAUSE_MS);
            state.paused = false;
            state.pauseUntil = null;
            state.status = 'sending';
            state.bounceCount = 0; // Reset bounce count after pause
            await supabase.from('email_campaigns').update({ status: 'sending' }).eq('id', campId);
        }

        try {
            const greeting = contact.name || 'User';
            const body = htmlBody.replace(/\{\{name\}\}/g, greeting).replace(/\{\{email\}\}/g, contact.email);
            const mailOpts = { from, to: contact.email, subject, html: body };
            const ccList = (cc || '').split(',').map(e=>e.trim()).filter(Boolean);
            const bccList = (bcc || '').split(',').map(e=>e.trim()).filter(Boolean);
            if (ccList.length) mailOpts.cc = ccList;
            if (bccList.length) mailOpts.bcc = bccList;
            if (fileAttachments.length > 0) mailOpts.attachments = fileAttachments;

            await transporter.sendMail(mailOpts);
            state.delivered++;
            await supabase.from('campaign_recipients').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('campaign_id', campId).eq('contact_id', contact.id);
        } catch (err) {
            state.bounceCount++;
            state.failed++;
            await supabase.from('campaign_recipients').update({ status: 'failed', error_message: err.message || 'Send failed' }).eq('campaign_id', campId).eq('contact_id', contact.id);
        }

        // Update campaign counts every 5 emails
        if (i % 5 === 0 || i === validContacts.length - 1) {
            await supabase.from('email_campaigns').update({ delivered_count: state.delivered, failed_count: state.failed }).eq('id', campId);
        }

        // Delay between emails within batch
        if ((i + 1) % BATCH === 0 && i + 1 < validContacts.length) {
            await sleep(5000); // 5s between batches
        } else if (i + 1 < validContacts.length) {
            await sleep(1000); // 1s between individual emails
        }
    }

    // Final update
    await supabase.from('email_campaigns').update({
        status: 'sent', delivered_count: state.delivered, failed_count: state.failed, sent_at: new Date().toISOString()
    }).eq('id', campId);

    state.status = 'sent';
    // Clean up after 5 minutes
    setTimeout(() => runningCampaigns.delete(campId), 5 * 60 * 1000);
}

export async function GET(request) {
    // Requires valid executive session
    const auth = await verifyExecutiveSession(request);
    if (!auth.ok) return auth.response;

    // Return status of all running campaigns
    const active = [];
    for (const [id, state] of runningCampaigns) {
        active.push({ campaignId: id, ...state });
    }
    return NextResponse.json({ success: true, running: active });
}

export async function POST(req) {
    // Requires valid executive session to send bulk emails
    const auth = await verifyExecutiveSession(req);
    if (!auth.ok) return auth.response;

    try {
        const contentType = req.headers.get('content-type') || '';
        let contactIds, subject, htmlBody, title, cc, bcc, folderIds;
        let fileAttachments = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            contactIds = JSON.parse(formData.get('contactIds') || '[]');
            folderIds = JSON.parse(formData.get('folderIds') || '[]');
            subject = formData.get('subject');
            htmlBody = formData.get('htmlBody');
            title = formData.get('title');
            cc = formData.get('cc') || '';
            bcc = formData.get('bcc') || '';
            for (const [key, value] of formData.entries()) {
                if (key.startsWith('file_') && value instanceof File) {
                    fileAttachments.push({ filename: value.name, content: Buffer.from(await value.arrayBuffer()), contentType: value.type });
                }
            }
        } else {
            const body = await req.json();
            contactIds = body.contactIds; folderIds = body.folderIds;
            subject = body.subject; htmlBody = body.htmlBody; title = body.title;
            cc = body.cc || ''; bcc = body.bcc || '';
        }

        if (!subject || !htmlBody || (!contactIds?.length && !folderIds?.length)) {
            return NextResponse.json({ success: false, error: 'Subject, body, and contacts/folders required' }, { status: 400 });
        }

        // Fetch contacts
        let q = supabase.from('marketing_contacts').select('id, email, name').eq('is_subscribed', true);
        if (contactIds?.length) q = q.in('id', contactIds);
        else if (folderIds?.length) q = q.in('folder_id', folderIds);
        const { data: contacts, error: cErr } = await q;
        if (cErr) throw cErr;
        if (!contacts?.length) return NextResponse.json({ success: false, error: 'No contacts' }, { status: 400 });

        // Validate
        const valid = [], skipped = [];
        for (const c of contacts) { (await isEmailValid(c.email)) ? valid.push(c) : skipped.push(c); }
        if (!valid.length) return NextResponse.json({ success: false, error: 'All emails invalid' }, { status: 400 });

        // Create campaign
        const from = `"Diverse Loopers" <${process.env.CMO_SMTP_FROM || 'contact@diverseloopers.com'}>`;
        const { data: campaign, error: campErr } = await supabase.from('email_campaigns').insert({
            title: title || subject, subject, body: htmlBody,
            sent_by: process.env.CMO_SMTP_FROM || 'contact@diverseloopers.com',
            recipient_count: valid.length + skipped.length, status: 'sending',
        }).select().single();
        if (campErr) throw campErr;

        // Insert recipients
        await supabase.from('campaign_recipients').insert([
            ...valid.map(c => ({ campaign_id: campaign.id, contact_id: c.id, email: c.email, status: 'pending' })),
            ...skipped.map(c => ({ campaign_id: campaign.id, contact_id: c.id, email: c.email, status: 'failed', error_message: 'Invalid email domain' })),
        ]);

        // Start background sending (fire-and-forget)
        sendInBackground(campaign.id, valid, skipped, htmlBody, subject, from, cc, bcc, fileAttachments);

        // Return immediately
        return NextResponse.json({ success: true, campaignId: campaign.id, message: `Campaign started in background! Sending to ${valid.length} contacts.`, totalValid: valid.length, totalSkipped: skipped.length });
    } catch (err) {
        console.error('Bulk send error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
