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
            .select('id, employee_id')
            .eq('email', executiveToken.email)
            .single();
        if (manager) manager_id = manager.id;
    }

    if (!manager_id) {
        return NextResponse.json({ success: false, error: 'Manager ID required' }, { status: 400 });
    }

    // Team Size
    const { count: teamSize } = await supabaseAdmin
        .from('employee_managers')
        .select('*', { count: 'exact', head: true })
        .eq('manager_id', manager_id);

    // Get employee IDs
    const { data: employeeManagers } = await supabaseAdmin
      .from('employee_managers')
      .select('employee_id')
      .eq('manager_id', manager_id);
    
    const employeeIds = (employeeManagers || []).map(em => em.employee_id);
    const todayStr = new Date().toISOString().split('T')[0];
    
    let presentToday = 0;
    let onLeaveToday = 0;
    let tasksStats = { total: 0, pending: 0, overdue: 0 };
    let ratingsPending = false;

    if (employeeIds.length > 0) {
        // Attendance
        const { count: presentCount } = await supabaseAdmin
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('date', todayStr)
            .in('status', ['Present', 'Late'])
            .in('employee_id', employeeIds);
        presentToday = presentCount || 0;

        // Leaves
        const { count: leaveCount } = await supabaseAdmin
            .from('leaves')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .lte('start_date', todayStr)
            .gte('end_date', todayStr)
            .in('employee_id', employeeIds);
        onLeaveToday = leaveCount || 0;

        // Tasks
        const { data: tasks } = await supabaseAdmin
            .from('tasks')
            .select('status, deadline')
            .in('assigned_to', employeeIds);
        
        if (tasks) {
            tasksStats.total = tasks.length;
            tasksStats.pending = tasks.filter(t => t.status !== 'Completed').length;
            tasksStats.overdue = tasks.filter(t => t.status !== 'Completed' && t.deadline < todayStr).length;
        }

        // Ratings Pending
        const currentMonth = todayStr.substring(0, 7); // YYYY-MM
        const { data: ratings } = await supabaseAdmin
            .from('ratings')
            .select('employee_id')
            .eq('month', currentMonth)
            .in('employee_id', employeeIds);
        
        if (!ratings || ratings.length < employeeIds.length) {
            ratingsPending = true;
        }
    }

    // Projects
    const { data: projects } = await supabaseAdmin
        .from('projects')
        .select('status, end_date')
        .eq('manager_id', manager_id);

    let projectsCount = 0;
    let activeProjects = 0;
    let missingDeadlines = 0;

    if (projects) {
        projectsCount = projects.length;
        activeProjects = projects.filter(p => p.status === 'active').length;
        missingDeadlines = projects.filter(p => p.status === 'active' && p.end_date && p.end_date < todayStr).length;
    }

    return NextResponse.json({
        success: true,
        stats: {
            team_size: teamSize || 0,
            present_today: presentToday,
            on_leave_today: onLeaveToday,
            tasks: tasksStats,
            projects: {
                total: projectsCount,
                active: activeProjects,
                missing_deadlines: missingDeadlines
            },
            ratings_pending: ratingsPending
        }
    });

  } catch (error) {
    console.error('Error fetching manager stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
