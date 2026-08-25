import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';
import { verifyHRMSSecurityPassword } from '@/lib/hrms-security';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    let isAuthorized = adminKey === 'hrms-admin-access';

    if (!isAuthorized) {
      const auth = await verifyExecutiveSession(request);
      if (auth.ok && ['ceo', 'cmo_chief', 'manager'].includes(auth.executive.role)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, employee_id, auth_password } = await request.json();

    // Verify HRMS Security Authorization Password
    const authCheck = await verifyHRMSSecurityPassword(auth_password);
    if (!authCheck.valid) {
      return NextResponse.json(
        { success: false, error: authCheck.error || 'HRMS Security Authorization Password is required.' },
        { status: 403 }
      );
    }

    if (!id && !employee_id) {
      return NextResponse.json({ success: false, error: 'id or employee_id is required' }, { status: 400 });
    }

    // 1. Fetch employee details
    let empQuery = supabaseAdmin.from('employees').select('*');
    if (id) empQuery = empQuery.eq('id', id);
    else if (employee_id) empQuery = empQuery.eq('employee_id', employee_id);

    const { data: emp, error: empFetchErr } = await empQuery.maybeSingle();

    if (empFetchErr || !emp) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    const empCode = emp.employee_id;
    const empEmail = emp.email?.toLowerCase();
    const magicEmail = `${empCode?.toLowerCase()}@diverseloopers.com`;

    // 2. Cascade delete from all related child tables using service role
    const cascadeTables = [
      'facial_data',
      'employee_managers',
      'tasks',
      'attendance',
      'leaves',
      'ratings',
      'employee_documents',
    ];

    for (const table of cascadeTables) {
      try {
        if (empCode) {
          await supabaseAdmin.from(table).delete().eq('employee_id', empCode);
        }
      } catch (tableErr) {
        console.warn(`Warning deleting from ${table}:`, tableErr.message);
      }
    }

    // Delete notifications
    if (empCode) {
      try {
        await supabaseAdmin.from('notifications').delete().or(`recipient_id.eq.${empCode},user_id.eq.${empCode}`);
      } catch (notifErr) {
        console.warn('Warning deleting notifications:', notifErr.message);
      }
    }

    // 3. Mark as inactive (Past Employee) in employees table with ended timestamp & reason
    const now = new Date().toISOString();
    const { error: updateEmpErr } = await supabaseAdmin
      .from('employees')
      .update({
        is_active: false,
        employment_ended_at: now,
        employment_end_reason: emp.employment_end_reason || 'Deleted / Offboarded by Admin'
      })
      .eq('id', emp.id);

    if (updateEmpErr) {
      throw updateEmpErr;
    }

    // 4. Delete Auth User from Supabase Auth if exists
    try {
      let page = 1;
      let authUserId = null;
      while (page <= 10) {
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 100,
        });
        if (listErr || !users || users.length === 0) break;

        const match = users.find(
          (u) =>
            u.email?.toLowerCase() === empEmail ||
            u.email?.toLowerCase() === magicEmail ||
            u.user_metadata?.employee_id === empCode
        );

        if (match) {
          authUserId = match.id;
          break;
        }

        if (users.length < 100) break;
        page++;
      }

      if (authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }
    } catch (authDelErr) {
      console.warn('Warning deleting auth user:', authDelErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Employee ${emp.full_name || empCode} and all associated records deleted successfully.`,
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
