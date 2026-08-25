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

        const now = new Date();
        const todayUtcStr = now.toISOString().split('T')[0];
        const istDateStr = new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
        const todayIso = now.toISOString();

        const sevenDaysAgo = new Date(now);
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
            employeesListResult,
            executivesTotal,
            executivesActive,
            executivesListResult,
            trainersTotal,
            trainersActive,
            trainersListResult,
            paymentsTotal,
            paymentsCount,
            paymentsListResult,
            subscriptions,
            coursesTotal,
            coursesListResult,
            enrollmentsTotal,
            tasksResult,
            applicationsResult,
            marketingContacts,
            emailCampaigns,
            documentsTotal,
            documentsPending,
            attendanceToday,
            leavesToday,
            clientProfilesResult
        ] = await Promise.all([
            // profiles counts
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('user_metadata->>is_business', 'true')),
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayIso)),
            safeQuery(() => supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoIso)),

            // employees
            safeQuery(() => supabaseAdmin.from('employees').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('employees').select('id', { count: 'exact', head: true }).eq('is_active', true)),
            safeQuery(() => supabaseAdmin.from('employees').select('id, employee_id, full_name, email, role, department, designation, is_active').order('full_name')),

            // executives
            safeQuery(() => supabaseAdmin.from('executives').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('executives').select('id', { count: 'exact', head: true }).eq('is_active', true)),
            safeQuery(() => supabaseAdmin.from('executives').select('id, name, email, role, phone, is_active').order('name')),

            // trainers
            safeQuery(() => supabaseAdmin.from('trainers').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('trainers').select('id', { count: 'exact', head: true }).eq('is_active', true)),
            safeQuery(() => supabaseAdmin.from('trainers').select('id, full_name, email, specialization, is_active').order('full_name')),

            // payments
            safeQuery(() => supabaseAdmin.from('payments').select('amount').eq('status', 'paid')),
            safeQuery(() => supabaseAdmin.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'paid')),
            safeQuery(() => supabaseAdmin.from('payments').select('id, user_email, course_title, amount, currency, status, paid_at').order('paid_at', { ascending: false }).limit(30)),

            // subscriptions
            safeQuery(() => supabaseAdmin.from('client_subscriptions').select('amount_paid')),

            // courses & enrollments
            safeQuery(() => supabaseAdmin.from('courses').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('courses').select('id, title, category, price, is_live, created_at').order('created_at', { ascending: false }).limit(30)),
            safeQuery(() => supabaseAdmin.from('enrollments').select('id', { count: 'exact', head: true })),

            // tasks
            safeQuery(() => supabaseAdmin.from('tasks').select('id, title, employee_id, deadline, priority, status').order('deadline', { ascending: true })),

            // applications
            safeQuery(() => supabaseAdmin.from('applications').select('id, applicant_name, applicant_email, job_title, status, submitted_at').order('submitted_at', { ascending: false }).limit(30)),

            // marketing
            safeQuery(() => supabaseAdmin.from('marketing_contacts').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('email_campaigns').select('status')),

            // documents
            safeQuery(() => supabaseAdmin.from('issued_documents').select('id', { count: 'exact', head: true })),
            safeQuery(() => supabaseAdmin.from('issued_documents').select('id', { count: 'exact', head: true }).eq('requires_signature', true).eq('is_signed', false)),

            // attendance & leaves
            safeQuery(() => supabaseAdmin.from('attendance').select('id, employee_id, date, status, check_in_time').in('date', [todayUtcStr, istDateStr])),
            safeQuery(() => supabaseAdmin.from('leaves').select('id, employee_id, start_date, end_date, reason, status').ilike('status', 'approved').lte('start_date', istDateStr).gte('end_date', istDateStr)),

            // client profiles for users list
            safeQuery(() => supabaseAdmin.from('client_profiles').select('id, full_name, company_name, work_email, phone, plan, is_business_client, created_at').order('created_at', { ascending: false }).limit(30))
        ]);

        // Process data
        const totalProfilesCount = profilesTotal?.count || 0;
        const businessProfilesCount = profilesBusiness?.count || 0;

        const totalPayments = paymentsTotal?.data?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
        const transactionsCount = paymentsCount?.count || 0;
        const avgOrder = transactionsCount > 0 ? totalPayments / transactionsCount : 0;

        const saasRevenue = subscriptions?.data?.reduce((sum, s) => sum + (Number(s.amount_paid) || 0), 0) || 0;

        // Employees map for fast lookup
        const empMap = {};
        (employeesListResult?.data || []).forEach(emp => {
            if (emp.employee_id) empMap[emp.employee_id] = emp;
            if (emp.id) empMap[emp.id] = emp;
        });

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
        const presentTodayCount = (attendanceToday?.data || []).length;
        const attendanceRate = totalActiveEmployees > 0 ? (presentTodayCount / totalActiveEmployees) * 100 : 0;

        // Construct Detailed Lists for Interactivity
        const presentList = (attendanceToday?.data || []).map(att => {
            const emp = empMap[att.employee_id] || {};
            return {
                id: att.employee_id,
                employee_id: att.employee_id,
                name: emp.full_name || att.employee_id,
                role: emp.role || 'employee',
                department: emp.department || 'General',
                designation: emp.designation || 'Staff',
                email: emp.email || '',
                check_in_time: att.check_in_time || 'Checked In',
                status: att.status || 'Present'
            };
        });

        const leaveList = (leavesToday?.data || []).map(l => {
            const emp = empMap[l.employee_id] || {};
            return {
                id: l.employee_id,
                employee_id: l.employee_id,
                name: emp.full_name || l.employee_id,
                role: emp.role || 'employee',
                department: emp.department || 'General',
                designation: emp.designation || '',
                reason: l.reason || 'Approved Leave',
                start_date: l.start_date,
                end_date: l.end_date,
                status: 'On Leave'
            };
        });

        const employeesList = (employeesListResult?.data || []).map(emp => ({
            id: emp.employee_id || emp.id,
            employee_id: emp.employee_id || '—',
            name: emp.full_name || 'Unnamed',
            role: emp.role || 'employee',
            department: emp.department || 'General',
            designation: emp.designation || 'Staff',
            email: emp.email || '',
            is_active: emp.is_active
        }));

        const executivesList = (executivesListResult?.data || []).map(ex => ({
            id: ex.id,
            name: ex.name || 'Executive',
            email: ex.email || '',
            role: ex.role || 'Executive',
            phone: ex.phone || '—',
            is_active: ex.is_active
        }));

        const trainersList = (trainersListResult?.data || []).map(tr => ({
            id: tr.id,
            name: tr.full_name || 'Trainer',
            email: tr.email || '',
            specialization: tr.specialization || 'Course Instructor',
            is_active: tr.is_active
        }));

        const tasksList = (tasksResult?.data || []).map(t => {
            const emp = empMap[t.employee_id] || {};
            return {
                id: t.id,
                title: t.title,
                employee_id: t.employee_id || '—',
                name: emp.full_name || t.employee_id || 'Assigned',
                deadline: t.deadline,
                priority: t.priority || 'Medium',
                status: t.status || 'Pending'
            };
        });

        const usersList = (clientProfilesResult?.data || []).map(u => ({
            id: u.id,
            name: u.full_name || u.company_name || 'User',
            email: u.work_email || '',
            company: u.company_name || '—',
            phone: u.phone || '—',
            plan: u.plan || 'Free',
            is_business: u.is_business_client,
            created_at: u.created_at
        }));

        const revenueList = (paymentsListResult?.data || []).map(p => ({
            id: p.id,
            title: p.course_title || 'Payment Transaction',
            email: p.user_email || 'Customer',
            amount: p.amount,
            currency: p.currency || 'INR',
            status: p.status || 'paid',
            paid_at: p.paid_at
        }));

        const applicationsList = (applicationsResult?.data || []).map(a => ({
            id: a.id,
            name: a.applicant_name || 'Applicant',
            email: a.applicant_email || '',
            role_applied: a.job_title || 'Position',
            status: a.status || 'new',
            created_at: a.submitted_at
        }));

        const coursesList = (coursesListResult?.data || []).map(c => ({
            id: c.id,
            title: c.title,
            category: c.category || 'General',
            price: c.price,
            is_live: c.is_live,
            created_at: c.created_at
        }));

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
                    absent_today: Math.max(0, totalActiveEmployees - presentTodayCount - (leavesToday?.data?.length || 0)),
                    on_leave: leavesToday?.data?.length || 0
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
            },
            details: {
                present: presentList,
                leave: leaveList,
                employees: employeesList,
                executives: executivesList,
                trainers: trainersList,
                tasks: tasksList,
                users: usersList,
                revenue: revenueList,
                applications: applicationsList,
                courses: coursesList
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
