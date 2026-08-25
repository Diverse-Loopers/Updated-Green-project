import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: check if request is authorized for CEO
async function isAuthorizedCEO(request) {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey === 'hrms-admin-access') return { ok: true, role: 'admin' };

    const auth = await verifyExecutiveSession(request);
    if (auth.ok && ['ceo', 'cmo_chief'].includes(auth.executive.role)) {
        return { ok: true, executive: auth.executive };
    }

    const ceoId = request.headers.get('x-ceo-id');
    if (ceoId) {
        const { data: exec } = await supabaseAdmin
            .from('executives')
            .select('id, role, is_active')
            .eq('id', ceoId)
            .eq('is_active', true)
            .maybeSingle();
        if (exec && ['ceo', 'cmo_chief'].includes(exec.role)) {
            return { ok: true, executive: exec };
        }
    }

    return { ok: false };
}

// GET: Fetch unread notifications for CEO
export async function GET(request) {
    try {
        const auth = await isAuthorizedCEO(request);
        if (!auth.ok) {
            return NextResponse.json({ success: false, error: 'Unauthorized. CEO role required.' }, { status: 401 });
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Fetch real unread notifications for CEO & Admin
        const { data: dbNotifs, error: notifErr } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .or('recipient_role.eq.ceo,recipient_role.eq.admin')
            .eq('is_read', false)
            .gte('created_at', sevenDaysAgo)
            .order('created_at', { ascending: false })
            .limit(25);

        if (notifErr) {
            console.error('Error fetching CEO notifications:', notifErr);
        }

        const formattedNotifs = (dbNotifs || []).map(n => {
            let icon = '🔔';
            let color = '#4f46e5';

            if (n.type === 'announcement') {
                icon = '📢';
                color = '#ec4899';
            } else if (n.type === 'employment_ended') {
                icon = '🚫';
                color = '#ef4444';
            } else if (n.type === 'document_issued') {
                icon = '📜';
                color = '#10b981';
            } else if (n.type === 'leave_request' || n.type === 'leave_approved') {
                icon = '🏖️';
                color = '#f59e0b';
            } else if (n.type === 'task_assigned' || n.type === 'task_completed') {
                icon = '⏳';
                color = '#3b82f6';
            }

            return {
                id: n.id,
                title: n.title || 'Notification',
                message: n.message,
                icon,
                color,
                created_at: n.created_at,
                type: n.type,
            };
        });

        return NextResponse.json({
            success: true,
            notifications: formattedNotifs,
            unread_count: formattedNotifs.length,
        });
    } catch (err) {
        console.error('CEO Notifications GET error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: Mark all notifications as read for CEO
export async function POST(request) {
    try {
        const auth = await isAuthorizedCEO(request);
        if (!auth.ok) {
            return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { action } = body;

        if (action === 'mark_all_read' || !action) {
            const { error: updateErr } = await supabaseAdmin
                .from('notifications')
                .update({ is_read: true })
                .or('recipient_role.eq.ceo,recipient_role.eq.admin')
                .eq('is_read', false);

            if (updateErr) {
                console.error('Failed to mark notifications read:', updateErr);
            }

            return NextResponse.json({
                success: true,
                message: 'All notifications marked as read.',
                marked_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        console.error('CEO Notifications POST error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
