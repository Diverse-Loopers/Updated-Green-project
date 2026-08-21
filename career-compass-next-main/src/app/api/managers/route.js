import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
    try {
        const adminKey = request.headers.get('x-admin-key');
        let isAuthorized = adminKey === 'hrms-admin-access';

        if (!isAuthorized) {
            const auth = await verifyExecutiveSession(request);
            if (auth.ok && ['ceo', 'cmo_chief'].includes(auth.executive.role)) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { data: managers, error: fetchErr } = await supabaseAdmin
            .from('managers')
            .select(`*, employee_managers(count)`)
            .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;

        const formattedManagers = managers.map(m => ({
            ...m,
            team_count: m.employee_managers?.[0]?.count || 0,
            employee_managers: undefined
        }));

        return NextResponse.json({ success: true, managers: formattedManagers });
    } catch (err) {
        console.error('Error fetching managers:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const adminKey = request.headers.get('x-admin-key');
        let isAuthorized = adminKey === 'hrms-admin-access';

        if (!isAuthorized) {
            const auth = await verifyExecutiveSession(request);
            if (auth.ok && ['ceo', 'cmo_chief'].includes(auth.executive.role)) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === 'create') {
            const { name, email, designation, project_name, signature_base64, employee_id, password } = body;

            let signature_url = null;
            if (signature_base64) {
                const base64Data = signature_base64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `${Date.now()}_signature.png`;

                const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
                    .from('manager-signatures')
                    .upload(fileName, buffer, { contentType: 'image/png' });

                if (!uploadErr && uploadData) {
                    const { data: publicUrlData } = supabaseAdmin.storage.from('manager-signatures').getPublicUrl(fileName);
                    signature_url = publicUrlData.publicUrl;
                }
            }

            const { data: newManager, error: insertErr } = await supabaseAdmin
                .from('managers')
                .insert([{ name, email, designation, project_name, signature_url, employee_id }])
                .select()
                .single();

            if (insertErr) throw insertErr;

            const execPassword = password || 'manager-access-2026';
            await supabaseAdmin.from('executives').insert([{
                email,
                name,
                role: 'manager',
                password: execPassword,
                is_active: true
            }]);

            return NextResponse.json({ success: true, manager: newManager });
        }

        if (action === 'update') {
            const { id, name, designation, project_name, signature_base64 } = body;

            let updateData = { name, designation, project_name };

            if (signature_base64) {
                const base64Data = signature_base64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `${id}_${Date.now()}_signature.png`;

                const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
                    .from('manager-signatures')
                    .upload(fileName, buffer, { contentType: 'image/png' });

                if (!uploadErr && uploadData) {
                    const { data: publicUrlData } = supabaseAdmin.storage.from('manager-signatures').getPublicUrl(fileName);
                    updateData.signature_url = publicUrlData.publicUrl;
                }
            }

            const { data, error: updateErr } = await supabaseAdmin
                .from('managers')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (updateErr) throw updateErr;
            return NextResponse.json({ success: true, manager: data });
        }

        if (action === 'delete') {
            const { id } = body;
            const { data, error: delErr } = await supabaseAdmin
                .from('managers')
                .update({ is_active: false })
                .eq('id', id)
                .select()
                .single();

            if (delErr) throw delErr;
            return NextResponse.json({ success: true, manager: data });
        }

        if (action === 'assign-employees') {
            const { manager_id, employee_ids } = body;

            const { error: deleteErr } = await supabaseAdmin
                .from('employee_managers')
                .delete()
                .eq('manager_id', manager_id);

            if (deleteErr) throw deleteErr;

            if (employee_ids && employee_ids.length > 0) {
                const inserts = employee_ids.map(emp_id => ({
                    manager_id,
                    employee_id: emp_id
                }));

                const { error: insertErr } = await supabaseAdmin
                    .from('employee_managers')
                    .upsert(inserts, { onConflict: 'employee_id' });

                if (insertErr) throw insertErr;
            }

            return NextResponse.json({ success: true, message: 'Employees assigned successfully' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        console.error('Error in managers API:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
