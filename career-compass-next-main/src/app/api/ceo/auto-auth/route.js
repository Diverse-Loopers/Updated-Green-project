import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CEO_AUTO_PASS = 'ceo-auto-access-2026';

export async function POST(request) {
    try {
        const auth = await verifyExecutiveSession(request);

        let authorized = false;
        let ceoEmail = null;

        if (auth.ok && (auth.executive.role === 'ceo' || auth.executive.role === 'cmo_chief')) {
            authorized = true;
            ceoEmail = auth.executive.email;
        }

        // Fallback auth: direct CEO ID verification
        if (!authorized) {
            const ceoId = request.headers.get('x-ceo-id');
            if (ceoId) {
                const { data: ceoExec } = await supabaseAdmin
                    .from('executives')
                    .select('id, email, role, is_active')
                    .eq('id', ceoId)
                    .eq('is_active', true)
                    .maybeSingle();
                if (ceoExec && (ceoExec.role === 'ceo' || ceoExec.role === 'cmo_chief')) {
                    authorized = true;
                    ceoEmail = ceoExec.email;
                }
            }
        }

        if (!authorized) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. CEO access required.' },
                { status: 401 }
            );
        }

        const email = ceoEmail;
        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Executive email not found.' },
                { status: 400 }
            );
        }

        // 1. Check admin_list — CEO might already be there
        const { data: adminRow } = await supabaseAdmin
            .from('admin_list')
            .select('user_id')
            .eq('email', email)
            .maybeSingle();

        let authUserId = adminRow?.user_id || null;

        // 2. Ensure Supabase auth user exists
        if (authUserId) {
            // User ID known — just update password
            try {
                await supabaseAdmin.auth.admin.updateUserById(authUserId, {
                    password: CEO_AUTO_PASS,
                    email_confirm: true
                });
            } catch (e) {
                // user_id might be stale, create fresh
                authUserId = null;
            }
        }

        if (!authUserId) {
            // Search all auth users for this email
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
            const existing = users?.find(u => u.email === email);

            if (existing) {
                authUserId = existing.id;
                await supabaseAdmin.auth.admin.updateUserById(authUserId, {
                    password: CEO_AUTO_PASS,
                    email_confirm: true
                });
            } else {
                // Create new auth user
                const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password: CEO_AUTO_PASS,
                    email_confirm: true
                });
                if (createErr) throw createErr;
                authUserId = newUser.user.id;
            }

            // Update admin_list with correct user_id
            if (adminRow) {
                await supabaseAdmin.from('admin_list').update({ user_id: authUserId }).eq('email', email);
            } else {
                await supabaseAdmin.from('admin_list').insert({ user_id: authUserId, email });
            }
        }

        return NextResponse.json({
            success: true,
            email,
            password: CEO_AUTO_PASS
        });

    } catch (error) {
        console.error('Auto-auth API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
