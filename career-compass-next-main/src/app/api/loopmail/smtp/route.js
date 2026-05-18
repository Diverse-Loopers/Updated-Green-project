import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { encrypt, decrypt } from '@/lib/crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Helper: get user from Authorization header
async function getUser(req) {
    const auth = req.headers.get('authorization');
    if (!auth) return null;
    const token = auth.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// GET — List user's SMTP configs
export async function GET(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('loopmail_smtp_configs')
        .select('id, provider, label, host, port, secure, username, from_email, from_name, is_verified, is_default, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, configs: data || [] });
}

// POST — Create, Update, Delete, Test SMTP
export async function POST(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // CREATE
    if (action === 'create') {
        // ── PLAN & ONBOARDING ENFORCEMENT ──
        let userPlan = 'basic';
        try {
            const { data: sub } = await supabase
                .from('client_subscriptions').select('plan, onboarding_status')
                .eq('user_id', user.id).eq('product_slug', 'loopmail').eq('status', 'active').single();
            if (!sub || sub.onboarding_status !== 'active') {
                return NextResponse.json({ success: false, error: 'Please complete onboarding first.' }, { status: 403 });
            }
            userPlan = sub.plan || 'basic';
        } catch {
            return NextResponse.json({ success: false, error: 'No active subscription.' }, { status: 403 });
        }

        if (userPlan === 'basic') {
            return NextResponse.json({
                success: false,
                error: 'SMTP integration is not available on the Basic plan. Upgrade to Premium at /products/loopmail/pricing'
            }, { status: 403 });
        }
        const { provider, label, host, port, secure, username, password, from_email, from_name, is_default } = body;
        if (!host || !username || !password || !from_email) {
            return NextResponse.json({ success: false, error: 'Host, username, password, and from_email are required' }, { status: 400 });
        }

        const encrypted_password = encrypt(password);

        // If setting as default, unset others
        if (is_default) {
            await supabase.from('loopmail_smtp_configs').update({ is_default: false }).eq('user_id', user.id);
        }

        const { data, error } = await supabase.from('loopmail_smtp_configs').insert({
            user_id: user.id,
            provider: provider || 'custom',
            label: label || 'My Email',
            host, port: port || 465,
            secure: secure !== false,
            username,
            encrypted_password,
            from_email,
            from_name: from_name || '',
            is_default: is_default || false,
        }).select().single();

        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, config: { ...data, encrypted_password: undefined } });
    }

    // UPDATE
    if (action === 'update') {
        const { id, provider, label, host, port, secure, username, password, from_email, from_name, is_default } = body;
        if (!id) return NextResponse.json({ success: false, error: 'Config id required' }, { status: 400 });

        // Verify ownership
        const { data: existing } = await supabase.from('loopmail_smtp_configs').select('id').eq('id', id).eq('user_id', user.id).single();
        if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const updates = {};
        if (provider !== undefined) updates.provider = provider;
        if (label !== undefined) updates.label = label;
        if (host !== undefined) updates.host = host;
        if (port !== undefined) updates.port = port;
        if (secure !== undefined) updates.secure = secure;
        if (username !== undefined) updates.username = username;
        if (password) updates.encrypted_password = encrypt(password);
        if (from_email !== undefined) updates.from_email = from_email;
        if (from_name !== undefined) updates.from_name = from_name;
        if (is_default) {
            await supabase.from('loopmail_smtp_configs').update({ is_default: false }).eq('user_id', user.id);
            updates.is_default = true;
        }
        updates.updated_at = new Date().toISOString();
        updates.is_verified = false; // Re-verify after changes

        const { error } = await supabase.from('loopmail_smtp_configs').update(updates).eq('id', id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    // DELETE
    if (action === 'delete') {
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'Config id required' }, { status: 400 });
        const { error } = await supabase.from('loopmail_smtp_configs').delete().eq('id', id).eq('user_id', user.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    // TEST CONNECTION
    if (action === 'test') {
        const { id, host, port, secure, username, password } = body;

        let testHost = host, testPort = port, testSecure = secure, testUser = username, testPass = password;

        // If id provided, load from DB
        if (id && !host) {
            const { data: config } = await supabase.from('loopmail_smtp_configs').select('*').eq('id', id).eq('user_id', user.id).single();
            if (!config) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
            testHost = config.host;
            testPort = config.port;
            testSecure = config.secure;
            testUser = config.username;
            testPass = decrypt(config.encrypted_password);
        }

        try {
            const transporter = nodemailer.createTransport({
                host: testHost,
                port: testPort,
                secure: testSecure,
                auth: { user: testUser, pass: testPass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
            });

            await transporter.verify();

            // Mark as verified in DB
            if (id) {
                await supabase.from('loopmail_smtp_configs').update({ is_verified: true, updated_at: new Date().toISOString() }).eq('id', id);
            }

            return NextResponse.json({ success: true, message: 'Connection successful! SMTP server is reachable.' });
        } catch (err) {
            return NextResponse.json({ success: false, error: `Connection failed: ${err.message}` }, { status: 400 });
        }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
