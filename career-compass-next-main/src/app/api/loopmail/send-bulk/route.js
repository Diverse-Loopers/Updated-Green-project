import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';
import { decrypt } from '@/lib/crypto';

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

async function getUser(req) {
    const auth = req.headers.get('authorization');
    if (!auth) return null;
    const token = auth.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// Track running campaigns in memory
const runningCampaigns = new Map();

async function sendInBackground(campId, userId, validContacts, skippedContacts, htmlBody, subject, from, cc, bcc, smtpConfig, attachments) {
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: { user: smtpConfig.username, pass: smtpConfig.password },
        tls: { rejectUnauthorized: false },
    });

    const state = { status:'sending', delivered:0, failed:skippedContacts.length, bounceCount:0, total:validContacts.length+skippedContacts.length, current:0, paused:false, pauseUntil:null, userId };
    runningCampaigns.set(campId, state);

    const BATCH = 5;
    const MAX_BOUNCES = 2;
    const PAUSE_MS = 60*60*1000;

    for (let i = 0; i < validContacts.length; i++) {
        const contact = validContacts[i];
        state.current = i + 1;

        if (state.bounceCount > 0 && state.bounceCount % MAX_BOUNCES === 0 && !state.paused) {
            state.paused = true;
            state.pauseUntil = new Date(Date.now() + PAUSE_MS).toISOString();
            state.status = 'paused';
            await supabase.from('loopmail_campaigns').update({ status:'paused' }).eq('id', campId);
            await sleep(PAUSE_MS);
            state.paused = false; state.pauseUntil = null; state.status = 'sending'; state.bounceCount = 0;
            await supabase.from('loopmail_campaigns').update({ status:'sending' }).eq('id', campId);
        }

        try {
            const greeting = contact.name || 'User';
            const body = htmlBody.replace(/\{\{name\}\}/g, greeting).replace(/\{\{email\}\}/g, contact.email);
            const mailOpts = { from, to: contact.email, subject, html: body };
            const ccList = (cc||'').split(',').map(e=>e.trim()).filter(Boolean);
            const bccList = (bcc||'').split(',').map(e=>e.trim()).filter(Boolean);
            if (ccList.length) mailOpts.cc = ccList;
            if (bccList.length) mailOpts.bcc = bccList;
            if (attachments && attachments.length > 0) {
                mailOpts.attachments = attachments.map(a => ({
                    filename: a.filename,
                    content: Buffer.from(a.content, 'base64'),
                    contentType: a.contentType || 'application/octet-stream',
                }));
            }

            await transporter.sendMail(mailOpts);
            state.delivered++;
            await supabase.from('loopmail_campaign_recipients').update({ status:'sent', sent_at:new Date().toISOString() }).eq('campaign_id', campId).eq('contact_id', contact.id);
        } catch (err) {
            state.bounceCount++; state.failed++;
            await supabase.from('loopmail_campaign_recipients').update({ status:'failed', error_message:err.message||'Send failed' }).eq('campaign_id', campId).eq('contact_id', contact.id);
        }

        if (i % 5 === 0 || i === validContacts.length - 1) {
            await supabase.from('loopmail_campaigns').update({ delivered_count:state.delivered, failed_count:state.failed }).eq('id', campId);
        }

        if ((i+1) % BATCH === 0 && i+1 < validContacts.length) await sleep(5000);
        else if (i+1 < validContacts.length) await sleep(1000);
    }

    await supabase.from('loopmail_campaigns').update({ status:'sent', delivered_count:state.delivered, failed_count:state.failed, sent_at:new Date().toISOString() }).eq('id', campId);
    state.status = 'sent';
    setTimeout(() => runningCampaigns.delete(campId), 5*60*1000);
}

// GET — Running campaigns status for this user
export async function GET(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const active = [];
    for (const [id, state] of runningCampaigns) {
        if (state.userId === user.id) active.push({ campaignId: id, ...state });
    }
    return NextResponse.json({ success: true, running: active });
}

// POST — Start bulk send
export async function POST(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    try {
        // ── PLAN & ONBOARDING ENFORCEMENT ──
        let userPlan = 'basic';
        try {
            const { data: sub } = await supabase
                .from('client_subscriptions')
                .select('plan, onboarding_status')
                .eq('user_id', user.id)
                .eq('product_slug', 'loopmail')
                .eq('status', 'active')
                .single();
            if (!sub || sub.onboarding_status !== 'active') {
                return NextResponse.json({ success: false, error: 'Please complete onboarding before sending campaigns.' }, { status: 403 });
            }
            userPlan = sub.plan || 'basic';
        } catch {
            return NextResponse.json({ success: false, error: 'No active subscription. Please subscribe first.' }, { status: 403 });
        }

        const planLimits = {
            basic: { maxCampaigns: 5, maxContacts: 500, attachments: false },
            premium: { maxCampaigns: 25, maxContacts: 100000, attachments: true },
            enterprise: { maxCampaigns: -1, maxContacts: -1, attachments: true },
        };
        const limits = planLimits[userPlan] || planLimits.basic;

        // Check campaign count limit
        if (limits.maxCampaigns !== -1) {
            const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const { count } = await supabase
                .from('loopmail_campaigns')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', thirtyDaysAgo.toISOString());
            if ((count || 0) >= limits.maxCampaigns) {
                return NextResponse.json({
                    success: false,
                    error: `Campaign limit reached (${limits.maxCampaigns}/month on ${userPlan} plan). Upgrade at /products/loopmail/pricing`
                }, { status: 403 });
            }
        }

        const contentType = req.headers.get('content-type') || '';
        let contactIds, subject, htmlBody, title, cc, bcc, smtpConfigId;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            contactIds = JSON.parse(formData.get('contactIds') || '[]');
            subject = formData.get('subject');
            htmlBody = formData.get('htmlBody');
            title = formData.get('title');
            cc = formData.get('cc') || '';
            bcc = formData.get('bcc') || '';
            smtpConfigId = formData.get('smtpConfigId');
        } else {
            const body = await req.json();
            contactIds = body.contactIds; subject = body.subject; htmlBody = body.htmlBody;
            title = body.title; cc = body.cc||''; bcc = body.bcc||''; smtpConfigId = body.smtpConfigId;
            var attachments = body.attachments || [];
        }

        // Strip attachments for basic plan
        if (!limits.attachments && typeof attachments !== 'undefined') {
            attachments = [];
        }

        // Check contact limit
        if (limits.maxContacts !== -1 && contactIds?.length > limits.maxContacts) {
            return NextResponse.json({
                success: false,
                error: `Contact limit: ${limits.maxContacts} on ${userPlan} plan. You selected ${contactIds.length}. Upgrade at /products/loopmail/pricing`
            }, { status: 403 });
        }

        if (!subject || !htmlBody) return NextResponse.json({ success:false, error:'Subject and body required' }, { status:400 });

        // Get SMTP config
        let smtpQuery = supabase.from('loopmail_smtp_configs').select('*').eq('user_id', user.id);
        if (smtpConfigId) smtpQuery = smtpQuery.eq('id', smtpConfigId);
        else smtpQuery = smtpQuery.eq('is_default', true);
        const { data: smtpRow } = await smtpQuery.limit(1).single();

        if (!smtpRow) {
            // Fallback: get any config
            const { data: anySmtp } = await supabase.from('loopmail_smtp_configs').select('*').eq('user_id', user.id).limit(1).single();
            if (!anySmtp) return NextResponse.json({ success:false, error:'No SMTP configured. Go to Settings to add one.' }, { status:400 });
            Object.assign(smtpRow || {}, anySmtp);
        }

        const smtpConfig = {
            host: smtpRow.host, port: smtpRow.port, secure: smtpRow.secure,
            username: smtpRow.username, password: decrypt(smtpRow.encrypted_password),
        };

        // Fetch contacts
        let q = supabase.from('loopmail_contacts').select('id,email,name').eq('user_id', user.id).eq('is_subscribed', true);
        if (contactIds?.length) q = q.in('id', contactIds);
        const { data: contacts } = await q;
        if (!contacts?.length) return NextResponse.json({ success:false, error:'No contacts' }, { status:400 });

        const valid = [], skipped = [];
        for (const c of contacts) { (await isEmailValid(c.email)) ? valid.push(c) : skipped.push(c); }
        if (!valid.length) return NextResponse.json({ success:false, error:'All emails invalid' }, { status:400 });

        const from = `"${smtpRow.from_name || 'LoopMail'}" <${smtpRow.from_email}>`;
        const { data: campaign, error: campErr } = await supabase.from('loopmail_campaigns').insert({
            user_id: user.id, smtp_config_id: smtpRow.id,
            title: title||subject, subject, body: htmlBody,
            sent_by: smtpRow.from_email, recipient_count: valid.length+skipped.length, status:'sending',
        }).select().single();
        if (campErr) throw campErr;

        await supabase.from('loopmail_campaign_recipients').insert([
            ...valid.map(c => ({ campaign_id:campaign.id, contact_id:c.id, email:c.email, status:'pending' })),
            ...skipped.map(c => ({ campaign_id:campaign.id, contact_id:c.id, email:c.email, status:'failed', error_message:'Invalid email domain' })),
        ]);

        sendInBackground(campaign.id, user.id, valid, skipped, htmlBody, subject, from, cc, bcc, smtpConfig, attachments || []);

        return NextResponse.json({ success:true, campaignId:campaign.id, message:`Campaign started! Sending to ${valid.length} contacts.`, totalValid:valid.length, totalSkipped:skipped.length });
    } catch (err) {
        console.error('LoopMail bulk send error:', err);
        return NextResponse.json({ success:false, error:err.message }, { status:500 });
    }
}
