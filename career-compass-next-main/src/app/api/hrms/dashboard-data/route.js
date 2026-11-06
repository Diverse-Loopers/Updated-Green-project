import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// In-memory cache (10 seconds) for fast dashboard reloads & tab switching
let dashboardCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000;

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const forceRefresh = url.searchParams.get('refresh') === 'true';

        // Return cache if still fresh (< 10 seconds)
        if (!forceRefresh && dashboardCache && (Date.now() - lastCacheTime < CACHE_TTL_MS)) {
            return NextResponse.json({
                success: true,
                ...dashboardCache,
                cached: true
            });
        }

        const today = new Date().toISOString().split('T')[0];

        // Fetch all primary dashboard metrics and employee data in parallel
        const [
            employeesRes,
            docsRes,
            attendanceRes,
            leavesRes,
            tasksRes,
            notificationsRes
        ] = await Promise.all([
            supabaseAdmin
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false }),
            supabaseAdmin
                .from('employee_documents')
                .select('employee_id, doc_type'),
            supabaseAdmin
                .from('attendance')
                .select('employee_id')
                .eq('date', today),
            supabaseAdmin
                .from('leaves')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'Pending'),
            supabaseAdmin
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .in('status', ['Pending', 'Submitted']),
            supabaseAdmin
                .from('notifications')
                .select('*')
                .eq('recipient_role', 'admin')
                .eq('is_read', false)
                .order('created_at', { ascending: false })
                .limit(25)
        ]);

        const employees = employeesRes.data || [];
        const nonAdminActiveEmployees = employees.filter(e => e.role !== 'admin' && e.is_active !== false);
        const presentTodayCount = new Set(attendanceRes.data?.map(d => d.employee_id) || []).size;

        // Group documents by employee_id for instant badge rendering
        const docsMap = {};
        (docsRes.data || []).forEach(doc => {
            if (!docsMap[doc.employee_id]) {
                docsMap[doc.employee_id] = [];
            }
            if (!docsMap[doc.employee_id].includes(doc.doc_type)) {
                docsMap[doc.employee_id].push(doc.doc_type);
            }
        });

        const responseData = {
            stats: {
                totalEmployees: nonAdminActiveEmployees.length,
                presentToday: presentTodayCount,
                pendingLeaves: leavesRes.count || 0,
                activeTasks: tasksRes.count || 0,
                activeEmployeesCount: employees.filter(e => e.is_active !== false).length,
                pastEmployeesCount: employees.filter(e => e.is_active === false).length,
            },
            employees,
            docsMap,
            notifications: notificationsRes.data || []
        };

        dashboardCache = responseData;
        lastCacheTime = Date.now();

        return NextResponse.json({
            success: true,
            ...responseData
        });
    } catch (error) {
        console.error('HRMS Dashboard data error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to load dashboard data' },
            { status: 500 }
        );
    }
}
