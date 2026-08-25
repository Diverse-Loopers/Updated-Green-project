import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';

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

        const { user_id, employee_id, new_password } = await request.json();

        if ((!user_id && !employee_id) || !new_password) {
            return NextResponse.json({ success: false, error: 'Employee identifier and new_password are required' }, { status: 400 });
        }

        if (new_password.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // 1. Find the employee in the database
        let empQuery = supabaseAdmin.from('employees').select('*');
        if (user_id) empQuery = empQuery.eq('id', user_id);
        else if (employee_id) empQuery = empQuery.eq('employee_id', employee_id);

        const { data: emp, error: empErr } = await empQuery.maybeSingle();

        if (empErr || !emp) {
            return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
        }

        const empEmail = emp.email?.toLowerCase();
        const authEmail = emp.employee_id ? `${emp.employee_id.toLowerCase()}@diverseloopers.com` : null;

        // 2. Search for the auth user across all paginated users
        let authUser = null;
        let page = 1;

        while (page <= 10) {
            const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
                page,
                perPage: 100
            });

            if (listErr || !users || users.length === 0) break;

            const match = users.find(u => {
                const uEmail = u.email?.toLowerCase();
                return (
                    (empEmail && uEmail === empEmail) ||
                    (authEmail && uEmail === authEmail) ||
                    (emp.employee_id && u.user_metadata?.employee_id === emp.employee_id)
                );
            });

            if (match) {
                authUser = match;
                break;
            }

            if (users.length < 100) break;
            page++;
        }

        if (authUser) {
            // Update existing auth user password
            const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
                password: new_password,
                email_confirm: true
            });

            if (updateErr) {
                return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
            }
        } else {
            // Auth user does not exist yet — create it for this employee
            const primaryEmail = emp.email || authEmail;
            const { error: createAuthErr } = await supabaseAdmin.auth.admin.createUser({
                email: primaryEmail,
                password: new_password,
                email_confirm: true,
                user_metadata: {
                    full_name: emp.full_name,
                    role: emp.role || 'employee',
                    employee_id: emp.employee_id
                }
            });

            if (createAuthErr) {
                return NextResponse.json({ success: false, error: createAuthErr.message }, { status: 500 });
            }
        }

        // 3. Update password in employees table if the column exists
        try {
            await supabaseAdmin
                .from('employees')
                .update({ password: new_password })
                .eq('id', emp.id);
        } catch (dbPassErr) {
            // Non-fatal if column doesn't store plain text
            console.warn('Note: employees.password update:', dbPassErr.message);
        }

        return NextResponse.json({
            success: true,
            message: `Password reset successfully for ${emp.full_name} (${emp.email || emp.employee_id})`
        });

    } catch (err) {
        console.error('Password reset error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
