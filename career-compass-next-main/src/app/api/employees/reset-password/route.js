import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { user_id, new_password } = await request.json();

        if (!user_id || !new_password) {
            return NextResponse.json({ success: false, error: 'user_id and new_password are required' }, { status: 400 });
        }

        if (new_password.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Find the employee to get their auth email
        const { data: emp, error: empErr } = await supabaseAdmin
            .from('employees')
            .select('employee_id, email, full_name')
            .eq('id', user_id)
            .single();

        if (empErr || !emp) {
            return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
        }

        // Auth email is {employee_id}@diverseloopers.com (the magic login email)
        const authEmail = `${emp.employee_id.toLowerCase()}@diverseloopers.com`;

        // Find the auth user by magic email
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = users?.find(u => u.email === authEmail || u.email === emp.email);

        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Auth user not found for this employee' }, { status: 404 });
        }

        // Reset the password using admin API
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
            password: new_password
        });

        if (updateErr) {
            return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Password reset successful for ${emp.full_name} (${emp.email})`
        });

    } catch (err) {
        console.error('Password reset error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
