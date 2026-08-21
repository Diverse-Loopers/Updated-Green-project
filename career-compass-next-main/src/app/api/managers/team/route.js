import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    let isAuthorized = adminKey === 'hrms-admin-access';
    let executiveToken = null;
    
    if (!isAuthorized) {
      const auth = await verifyExecutiveSession(request);
      if (auth.ok && auth.executive.role === 'manager') {
        isAuthorized = true;
        executiveToken = auth.executive;
      } else if (auth.ok && ['ceo', 'cmo_chief'].includes(auth.executive.role)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let manager_id = searchParams.get('manager_id');
    
    if (!manager_id && executiveToken && executiveToken.role === 'manager') {
        const { data: manager } = await supabaseAdmin
            .from('managers')
            .select('id')
            .eq('email', executiveToken.email)
            .single();
        if (manager) manager_id = manager.id;
    }

    if (!manager_id) {
        return NextResponse.json({ success: false, error: 'Manager ID required' }, { status: 400 });
    }

    // Get employee_ids for this manager
    const { data: employeeManagers, error: emError } = await supabaseAdmin
      .from('employee_managers')
      .select('employee_id')
      .eq('manager_id', manager_id);

    if (emError) throw emError;

    if (!employeeManagers || employeeManagers.length === 0) {
        return NextResponse.json({ success: true, team: [] });
    }

    const employeeIds = employeeManagers.map(em => em.employee_id);

    // Fetch employees details
    const { data: employees, error: empError } = await supabaseAdmin
        .from('employees')
        .select('employee_id, full_name, designation, department, is_active')
        .in('employee_id', employeeIds);
        
    if (empError) throw empError;

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Fetch today's attendance
    const { data: attendance, error: attError } = await supabaseAdmin
        .from('attendance')
        .select('employee_id, status')
        .eq('date', todayStr)
        .in('employee_id', employeeIds);

    // Fetch active leaves for today
    const { data: leaves, error: leavesError } = await supabaseAdmin
        .from('leaves')
        .select('employee_id, start_date, end_date')
        .eq('status', 'approved')
        .lte('start_date', todayStr)
        .gte('end_date', todayStr)
        .in('employee_id', employeeIds);

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabaseAdmin
        .from('tasks')
        .select('assigned_to, status, deadline')
        .in('assigned_to', employeeIds);
        
    // Fetch this month's attendance
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    const { data: monthAttendance } = await supabaseAdmin
        .from('attendance')
        .select('employee_id, status')
        .gte('date', startOfMonthStr)
        .lte('date', todayStr)
        .in('employee_id', employeeIds);

    const team = (employees || []).map(emp => {
        const empAtt = (attendance || []).find(a => a.employee_id === emp.employee_id);
        const present_today = empAtt ? (empAtt.status === 'Present' || empAtt.status === 'Late') : false;
        
        const on_leave = (leaves || []).some(l => l.employee_id === emp.employee_id);
        
        const empTasks = (tasks || []).filter(t => t.assigned_to === emp.employee_id);
        const tasksStats = {
            total: empTasks.length,
            pending: empTasks.filter(t => t.status !== 'Completed').length,
            completed: empTasks.filter(t => t.status === 'Completed').length,
            overdue: empTasks.filter(t => t.status !== 'Completed' && t.deadline < todayStr).length
        };
        
        const empMonthAtt = (monthAttendance || []).filter(a => a.employee_id === emp.employee_id);
        const attendance_this_month = {
            present: empMonthAtt.filter(a => a.status === 'Present' || a.status === 'Late').length,
            total_days: empMonthAtt.length
        };

        return {
            ...emp,
            present_today,
            on_leave,
            tasks: tasksStats,
            attendance_this_month
        };
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
