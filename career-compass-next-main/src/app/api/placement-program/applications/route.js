import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: Fetch application logs for a student
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const student_id = searchParams.get('student_id');
        const date = searchParams.get('date');

        if (!student_id) {
            return NextResponse.json({ success: false, error: 'student_id required' }, { status: 400 });
        }

        let query = supabaseAdmin
            .from('placement_application_logs')
            .select('*')
            .eq('student_id', student_id)
            .order('applied_date', { ascending: false });

        if (date) {
            query = query.eq('applied_date', date);
        }

        const { data: logs, error } = await query;
        if (error) {
            console.error('Error fetching application logs:', error);
            return NextResponse.json({ success: true, applications: [], stats: { total: 0, easyApply: 0, longForm: 0, today: 0 } });
        }

        const todayStr = new Date().toISOString().split('T')[0];

        // Overall stats for this student
        const { data: allLogs } = await supabaseAdmin
            .from('placement_application_logs')
            .select('application_type, applied_date')
            .eq('student_id', student_id);

        const all = allLogs || [];
        const stats = {
            total: all.length,
            easyApply: all.filter(a => (a.application_type || '').toLowerCase().includes('easy')).length,
            longForm: all.filter(a => (a.application_type || '').toLowerCase().includes('long') || (a.application_type || '').toLowerCase().includes('portal')).length,
            today: all.filter(a => a.applied_date === todayStr).length,
        };

        return NextResponse.json({
            success: true,
            applications: logs || [],
            stats,
        });
    } catch (err) {
        console.error('Application logs GET error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: Add new job application log or batch log
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            action,
            student_id,
            applied_date,
            company_name,
            job_role,
            application_type,
            job_url,
            status,
            notes,
            logged_by,
            easy_apply_count,
            long_form_count,
        } = body;

        if (!student_id) {
            return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
        }

        const effectiveDate = applied_date || new Date().toISOString().split('T')[0];

        // BATCH COUNT LOGGING (for Marketing Persons logging daily counts)
        if (action === 'batch_counts' || (Number(easy_apply_count || 0) > 0 || Number(long_form_count || 0) > 0)) {
            const easyCount = Number(easy_apply_count || 0);
            const longCount = Number(long_form_count || 0);
            const records = [];

            for (let i = 1; i <= easyCount; i++) {
                records.push({
                    student_id,
                    applied_date: effectiveDate,
                    company_name: `Company Outreach (Easy Apply #${i})`,
                    job_role: job_role || 'Target Role',
                    application_type: 'Easy Apply',
                    job_url: job_url || null,
                    status: 'applied',
                    notes: notes ? `${notes} (Batch Log)` : 'Daily Easy Apply batch submission',
                    logged_by: logged_by || 'Marketing Team',
                    created_at: new Date().toISOString()
                });
            }

            for (let i = 1; i <= longCount; i++) {
                records.push({
                    student_id,
                    applied_date: effectiveDate,
                    company_name: `Company Portal (Long Form #${i})`,
                    job_role: job_role || 'Target Role',
                    application_type: 'Long Form / Portal',
                    job_url: job_url || null,
                    status: 'applied',
                    notes: notes ? `${notes} (Batch Log)` : 'Daily Long Form / Custom Portal batch submission',
                    logged_by: logged_by || 'Marketing Team',
                    created_at: new Date().toISOString()
                });
            }

            if (records.length > 0) {
                const { error: batchErr } = await supabaseAdmin
                    .from('placement_application_logs')
                    .insert(records);

                if (batchErr) throw batchErr;
            }

            return NextResponse.json({
                success: true,
                count: records.length,
                message: `Successfully logged ${easyCount} Easy Apply and ${longCount} Long Form applications for ${effectiveDate}.`
            });
        }

        // INDIVIDUAL APPLICATION LOGGING
        if (!company_name || !job_role) {
            return NextResponse.json({ success: false, error: 'Company Name and Job Role are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('placement_application_logs')
            .insert([{
                student_id,
                applied_date: effectiveDate,
                company_name: company_name.trim(),
                job_role: job_role.trim(),
                application_type: application_type || 'Easy Apply',
                job_url: job_url || null,
                status: status || 'applied',
                notes: notes || null,
                logged_by: logged_by || 'Marketing Team',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            application: data,
            message: `Application for ${company_name} logged successfully.`
        });
    } catch (err) {
        console.error('Application log POST error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// DELETE: Delete an application log
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Log ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('placement_application_logs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Log deleted.' });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
