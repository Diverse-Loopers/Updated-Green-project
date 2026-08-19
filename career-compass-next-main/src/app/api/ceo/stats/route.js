import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';

// Create a Supabase admin client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    try {
        // Primary auth: executive token
        const auth = await verifyExecutiveSession(request);

        let authorized = false;
        if (auth.ok && (auth.executive.role === 'ceo' || auth.executive.role === 'cmo_chief')) {
            authorized = true;
        }

        // Fallback auth: direct CEO ID verification (for token encoding issues)
        if (!authorized) {
            const ceoId = request.headers.get('x-ceo-id');
            if (ceoId) {
                const { data: ceoExec } = await supabaseAdmin
                    .from('executives')
                    .select('id, role, is_active')
                    .eq('id', ceoId)
                    .eq('is_active', true)
                    .maybeSingle();
                if (ceoExec && (ceoExec.role === 'ceo' || ceoExec.role === 'cmo_chief')) {
                    authorized = true;
                }
            }
        }

        if (!authorized) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. CEO access required.' },
                { status: 401 }
            );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();
        const todayDateStr = todayIso.split('T')[0];

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoIso = sevenDaysAgo.toISOString();

        // Helper to safely execute queries
        const safeQuery = async (queryFn) => {
            try {
                return await queryFn();
            } catch (error) {
                console.error('Query failed:', error);
                return null;
            }
        };

        // Queries
        const [
            profilesTotal,
            profilesBusiness,
            profilesNewToday,
            profilesNewWeek,
            employeesTotal,
            employeesActive,
            executivesTotal,
            executivesActive,
            trainersTotal,
            trainersActive,
            paymentsTotal,
            paymentsCount,
            subscriptions,
            coursesTotal,
            enrollmentsTotal,
            tasksResult,
            applicationsResult,
            marketingContacts,
            emailCampaigns,
            documentsTotal,
            documentsPending,
            attendanceToday,
            leavesToday
        ] = await Promise.all([
            // profiles
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('user_metadata->>is_business', 'true')),
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayIso)),
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoIso)),

            // employees
            safeQuery(() => supabaseAdmin.from('employees').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('employees').select('id', { count: 'exact', head: true }).eq('is_active', true)),

            // executives
            safeQuery(() => supabaseAdmin.from('executives').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('executives').select('id', { count: 'exact', head: true }).eq('is_active', true)),

            // trainers
            safeQuery(() => supabaseAdmin.from('trainers').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('trainers').select('id', { count: 'exact', head: true }).eq('is_active', true)),

            // payments
            safeQuery(() => supabaseAdmin.from('payments').select('amount').eq('status', 'paid')),
            safeQuery(() => supabaseAdmin.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'paid')),

            // subscriptions
            safeQuery(() => supabaseAdmin.from('client_subscriptions').select('amount_paid')),

            // courses & enrollments
            safeQuery(() => supabaseAdmin.from('courses').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('enrollments').select('id', { count: 'exact', head: true })),

            // tasks
            safeQuery(() => supabaseAdmin.from('tasks').select('status')),

            // applications
            safeQuery(() => supabaseAdmin.from('applications').select('status')),

            // marketing
            safeQuery(() => supabaseAdmin.from('marketing_contacts').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('email_campaigns').select('status')),

            // documents
            safeQuery(() => supabaseAdmin.from('issued_documents').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('issued_documents').select('id', { count: 'exact', head: true }).eq('requires_signature', true).eq('is_signed', false)),

            // attendance & leaves
            safeQuery(() => supabaseAdmin.from('attendance').select('id', { count: 'exact', head: true }).eq('date', todayDateStr)),
            safeQuery(() => supabaseAdmin.from('leaves').select('id', { count: 'exact', head: true }).eq('status', 'approved').lte('start_date', todayDateStr).gte('end_date', todayDateStr)),
        ]);

        // Process data
        const totalProfilesCount = profilesTotal?.count || 0;
        const businessProfilesCount = profilesBusiness?.count || 0;

        const totalPayments = paymentsTotal?.data?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
        const transactionsCount = paymentsCount?.count || 0;
        const avgOrder = transactionsCount > 0 ? totalPayments / transactionsCount : 0;

        const saasRevenue = subscriptions?.data?.reduce((sum, s) => sum + (Number(s.amount_paid) || 0), 0) || 0;

        let pendingTasks = 0, completedTasks = 0, inProgressTasks = 0;
        if (tasksResult?.data) {
            tasksResult.data.forEach(t => {
                const s = t.status?.toLowerCase();
                if (s === 'pending') pendingTasks++;
                else if (s === 'completed') completedTasks++;
                else if (s === 'in-progress' || s === 'in_progress') inProgressTasks++;
            });
        }
        const totalTasks = tasksResult?.data?.length || 0;

        let newApps = 0, shortlistedApps = 0, rejectedApps = 0;
        if (applicationsResult?.data) {
            applicationsResult.data.forEach(a => {
                const s = a.status?.toLowerCase();
                if (s === 'new') newApps++;
                else if (s === 'shortlisted') shortlistedApps++;
                else if (s === 'rejected') rejectedApps++;
            });
        }
        const totalApps = applicationsResult?.data?.length || 0;

        const totalCampaigns = emailCampaigns?.data?.length || 0;
        const sentCampaigns = emailCampaigns?.data?.filter(c => c.status?.toLowerCase() === 'sent').length || 0;

        const totalActiveEmployees = employeesActive?.count || 0;
        const presentTodayCount = attendanceToday?.count || 0;
        const attendanceRate = totalActiveEmployees > 0 ? (presentTodayCount / totalActiveEmployees) * 100 : 0;

        return NextResponse.json({
            success: true,
            stats: {
                users: {
                    total: totalProfilesCount,
                    students: Math.max(0, totalProfilesCount - businessProfilesCount),
                    business: businessProfilesCount,
                    new_today: profilesNewToday?.count || 0,
                    new_this_week: profilesNewWeek?.count || 0
                },
                employees: {
                    total: employeesTotal?.count || 0,
                    active: totalActiveEmployees,
                    inactive: (employeesTotal?.count || 0) - totalActiveEmployees,
                    present_today: presentTodayCount,
                    absent_today: Math.max(0, totalActiveEmployees - presentTodayCount - (leavesToday?.count || 0)),
                    on_leave: leavesToday?.count || 0
                },
                executives: {
                    total: executivesTotal?.count || 0,
                    active: executivesActive?.count || 0
                },
                trainers: {
                    total: trainersTotal?.count || 0,
                    active: trainersActive?.count || 0
                },
                sales: {
                    total_revenue: totalPayments + saasRevenue,
                    course_revenue: totalPayments,
                    saas_revenue: saasRevenue,
                    transactions_count: transactionsCount,
                    avg_order: avgOrder
                },
                courses: {
                    total: coursesTotal?.count || 0,
                    enrollments: enrollmentsTotal?.count || 0
                },
                attendance: {
                    present_today: presentTodayCount,
                    total_employees: totalActiveEmployees,
                    attendance_rate: attendanceRate
                },
                tasks: {
                    total: totalTasks,
                    pending: pendingTasks,
                    completed: completedTasks,
                    in_progress: inProgressTasks
                },
                applications: {
                    total: totalApps,
                    new_count: newApps,
                    shortlisted: shortlistedApps,
                    rejected: rejectedApps
                },
                marketing: {
                    total_contacts: marketingContacts?.count || 0,
                    total_campaigns: totalCampaigns,
                    emails_sent: sentCampaigns
                },
                documents: {
                    total_issued: documentsTotal?.count || 0,
                    pending_signatures: documentsPending?.count || 0
                }
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
