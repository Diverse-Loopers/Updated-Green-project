import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let student_id = searchParams.get('student_id');
        let email = searchParams.get('email');
        const date = searchParams.get('date');

        // Check auth header if student_id not explicitly in params
        if (!student_id && !email) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const decoded = JSON.parse(Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf8'));
                    if (decoded.student_id) student_id = decoded.student_id;
                    if (decoded.email) email = decoded.email;
                } catch (e) {}
            }
        }

        if (!student_id && !email) {
            return NextResponse.json({ success: false, error: 'student_id or email required' }, { status: 400 });
        }

        let studentQuery = supabaseAdmin.from('placement_students').select('*');
        if (student_id) {
            studentQuery = studentQuery.or(`id.eq.${student_id},student_id.eq.${student_id}`);
        } else if (email) {
            studentQuery = studentQuery.ilike('email', email.toLowerCase().trim());
        }

        const { data: student, error: studentErr } = await studentQuery.maybeSingle();
        if (studentErr || !student) {
            return NextResponse.json({ success: false, error: 'Student record not found.' }, { status: 404 });
        }

        // Collect all assigned employee IDs from arrays & single fields
        const mIds = Array.isArray(student.marketing_person_ids) && student.marketing_person_ids.length > 0
            ? student.marketing_person_ids
            : (student.marketing_person_id ? [student.marketing_person_id] : []);

        const sIds = Array.isArray(student.support_person_ids) && student.support_person_ids.length > 0
            ? student.support_person_ids
            : (student.support_person_id ? [student.support_person_id] : []);

        const hIds = Array.isArray(student.hr_person_ids) && student.hr_person_ids.length > 0
            ? student.hr_person_ids
            : (student.hr_person_id ? [student.hr_person_id] : []);

        const mgrIds = Array.isArray(student.manager_person_ids) && student.manager_person_ids.length > 0
            ? student.manager_person_ids
            : (student.manager_person_id ? [student.manager_person_id] : []);

        const allTeamEmpIds = [...mIds, ...sIds, ...hIds, ...mgrIds].filter(Boolean);

        let teamMap = {};
        if (allTeamEmpIds.length > 0) {
            const { data: teamEmps } = await supabaseAdmin
                .from('employees')
                .select('employee_id, full_name, email, role, department, designation')
                .in('employee_id', allTeamEmpIds);

            if (teamEmps) {
                teamEmps.forEach(emp => {
                    teamMap[emp.employee_id] = emp;
                });
            }
        }

        const team = {
            marketing_members: mIds.map(id => teamMap[id] || { employee_id: id, full_name: 'Marketing Executive' }),
            support_members: sIds.map(id => teamMap[id] || { employee_id: id, full_name: 'Placement Support Lead' }),
            hr_members: hIds.map(id => teamMap[id] || { employee_id: id, full_name: 'HR Representative' }),
            manager_members: mgrIds.map(id => teamMap[id] || { employee_id: id, full_name: 'Program Manager' }),
            
            // Primary single references for backward compatibility
            marketing: mIds[0] ? (teamMap[mIds[0]] || { employee_id: mIds[0], full_name: 'Marketing Executive' }) : null,
            support: sIds[0] ? (teamMap[sIds[0]] || { employee_id: sIds[0], full_name: 'Placement Support Lead' }) : null,
            hr: hIds[0] ? (teamMap[hIds[0]] || { employee_id: hIds[0], full_name: 'HR Representative' }) : null,
            manager: mgrIds[0] ? (teamMap[mgrIds[0]] || { employee_id: mgrIds[0], full_name: 'Program Manager' }) : null,
        };

        // Fetch all application logs for this student
        const { data: allApplications } = await supabaseAdmin
            .from('placement_application_logs')
            .select('*')
            .eq('student_id', student.id)
            .order('applied_date', { ascending: false });

        const apps = allApplications || [];
        const todayStr = new Date().toISOString().split('T')[0];

        // Selected Date logic
        const selectedDate = date || todayStr;
        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 6 = Saturday
        const is_weekend = dayOfWeek === 0 || dayOfWeek === 6;

        const selectedDateApps = apps.filter(a => a.applied_date === selectedDate);
        const todayApps = apps.filter(a => a.applied_date === todayStr);

        const stats = {
            todayCount: todayApps.length,
            totalCount: apps.length,
            easyApplyCount: apps.filter(a => (a.application_type || '').toLowerCase().includes('easy')).length,
            longFormCount: apps.filter(a => (a.application_type || '').toLowerCase().includes('long') || (a.application_type || '').toLowerCase().includes('portal')).length,
            interviewsCount: apps.filter(a => a.status === 'interview_scheduled' || a.status === 'offer').length,
        };

        // Strip password
        const { portal_password: _, ...safeStudent } = student;

        return NextResponse.json({
            success: true,
            student: safeStudent,
            team,
            stats,
            selected_date: selectedDate,
            is_weekend,
            weekend_message: is_weekend ? '🌴 Weekend Cooling Period — Our marketing team resumes corporate outreach on Monday morning to ensure peak recruiter response.' : null,
            applications: selectedDateApps,
            all_recent_applications: apps.slice(0, 30),
        });
    } catch (err) {
        console.error('Student portal GET error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
