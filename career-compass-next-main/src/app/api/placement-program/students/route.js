import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: Authorize Sales Executive, CSO, CEO, or Admin
async function isAuthorizedSales(request) {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey === 'hrms-admin-access') return { ok: true, role: 'admin' };

    const auth = await verifyExecutiveSession(request);
    if (auth.ok && ['sales', 'cso', 'ceo', 'cmo_chief', 'manager'].includes(auth.executive.role)) {
        return { ok: true, executive: auth.executive };
    }

    const execId = request.headers.get('x-executive-id') || request.headers.get('x-ceo-id');
    if (execId) {
        const { data: exec } = await supabaseAdmin
            .from('executives')
            .select('id, role, is_active')
            .eq('id', execId)
            .maybeSingle();
        if (exec && exec.is_active !== false && ['sales', 'cso', 'ceo', 'cmo_chief', 'manager'].includes(exec.role)) {
            return { ok: true, executive: exec };
        }
    }

    return { ok: false };
}

// GET: List all enrolled placement students + all active employees for team assignment
export async function GET(request) {
    try {
        const auth = await isAuthorizedSales(request);
        if (!auth.ok) {
            return NextResponse.json({ success: false, error: 'Unauthorized. Sales or Executive access required.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const query = searchParams.get('q');

        let dbQuery = supabaseAdmin
            .from('placement_students')
            .select('*')
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            dbQuery = dbQuery.eq('status', status);
        }
        if (query) {
            dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,student_id.ilike.%${query}%,target_roles.ilike.%${query}%,country.ilike.%${query}%`);
        }

        const { data: students, error } = await dbQuery;
        if (error) {
            console.error('Error fetching placement students:', error);
            return NextResponse.json({ success: true, students: [], employees: [], stats: { total: 0, active: 0, placed: 0, totalRevenue: 0, pendingDues: 0 } });
        }

        // Fetch ALL active employees (both is_active: true and is_active: null)
        const { data: employees, error: empErr } = await supabaseAdmin
            .from('employees')
            .select('id, employee_id, full_name, email, role, department, designation, is_active')
            .neq('is_active', false)
            .order('full_name', { ascending: true });

        if (empErr) {
            console.error('Error fetching employees for dropdown:', empErr);
        }

        // Calculate stats
        const list = students || [];
        const stats = {
            total: list.length,
            active: list.filter(s => s.status === 'active').length,
            placed: list.filter(s => s.status === 'placed').length,
            totalRevenue: list.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0),
            pendingDues: list.reduce((sum, s) => sum + Number(s.amount_due || 0), 0),
        };

        return NextResponse.json({
            success: true,
            students: list,
            employees: employees || [],
            stats,
        });
    } catch (err) {
        console.error('Placement students GET error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: Create a new placement student with multi-assignees, multi-installments, address, and spreadsheet link
export async function POST(request) {
    try {
        const auth = await isAuthorizedSales(request);
        if (!auth.ok) {
            return NextResponse.json({ success: false, error: 'Unauthorized. Only Sales Executives can enroll students.' }, { status: 401 });
        }

        const body = await request.json();
        const {
            full_name,
            email,
            phone,
            target_roles,
            
            // Full Address
            country,
            state,
            city,
            zip_code,
            street_address,
            location,
            
            // Extended Profile
            marketing_email,
            personal_email,
            highest_qualification,
            college_university,
            graduation_year,
            years_of_experience,
            tech_skills,
            linkedin_url,
            portfolio_url,
            
            // Tracking Spreadsheet
            spreadsheet_url,
            
            // Service Dates
            service_start_date,
            service_end_date,
            
            // Assigned Teams (Arrays or strings)
            marketing_person_ids,
            support_person_ids,
            hr_person_ids,
            manager_person_ids,
            
            // Multi-Installment Payment Schedule
            total_fee,
            amount_paid,
            payment_installments,
            payment_due_date,
            payment_link,
            
            // Documents
            mou_url,
            credentials_url,
            portal_password,
        } = body;

        if (!full_name || !email) {
            return NextResponse.json({ success: false, error: 'Student full name and email are required.' }, { status: 400 });
        }

        // Generate unique Student ID e.g. DL-PL-2026-8923
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const student_id = `DL-PL-${new Date().getFullYear()}-${randomDigits}`;

        // Ensure arrays for team members
        const mIds = Array.isArray(marketing_person_ids) ? marketing_person_ids : (marketing_person_ids ? [marketing_person_ids] : []);
        const sIds = Array.isArray(support_person_ids) ? support_person_ids : (support_person_ids ? [support_person_ids] : []);
        const hIds = Array.isArray(hr_person_ids) ? hr_person_ids : (hr_person_ids ? [hr_person_ids] : []);
        const mgrIds = Array.isArray(manager_person_ids) ? manager_person_ids : (manager_person_ids ? [manager_person_ids] : []);

        // Process installments
        const installmentsList = Array.isArray(payment_installments) ? payment_installments : [];
        let calculatedTotalFee = Number(total_fee || 0);
        let calculatedAmountPaid = Number(amount_paid || 0);

        if (installmentsList.length > 0) {
            calculatedTotalFee = installmentsList.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
            calculatedAmountPaid = installmentsList
                .filter(inst => inst.status === 'paid')
                .reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
        }

        const amountDueNum = Math.max(0, calculatedTotalFee - calculatedAmountPaid);

        let payment_status = 'due';
        if (calculatedAmountPaid >= calculatedTotalFee && calculatedTotalFee > 0) {
            payment_status = 'paid';
        } else if (calculatedAmountPaid > 0) {
            payment_status = 'partially_paid';
        }

        const newStudent = {
            student_id,
            full_name: full_name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone || null,
            target_roles: target_roles || 'Software Engineer',
            
            // Address
            country: country || 'India',
            state: state || null,
            city: city || null,
            zip_code: zip_code || null,
            street_address: street_address || null,
            location: location || (city && country ? `${city}, ${country}` : country || 'Remote'),
            
            // Extended Profile
            marketing_email: marketing_email || null,
            personal_email: personal_email || email,
            highest_qualification: highest_qualification || null,
            college_university: college_university || null,
            graduation_year: graduation_year || null,
            years_of_experience: years_of_experience || null,
            tech_skills: tech_skills || null,
            linkedin_url: linkedin_url || null,
            portfolio_url: portfolio_url || null,
            
            // Spreadsheet
            spreadsheet_url: spreadsheet_url || null,
            
            // Service Dates
            service_start_date: service_start_date || new Date().toISOString().split('T')[0],
            service_end_date: service_end_date || null,
            status: 'active',
            
            // Team Arrays + Legacy Single-string fallbacks
            marketing_person_ids: mIds,
            support_person_ids: sIds,
            hr_person_ids: hIds,
            manager_person_ids: mgrIds,
            marketing_person_id: mIds[0] || null,
            support_person_id: sIds[0] || null,
            hr_person_id: hIds[0] || null,
            manager_person_id: mgrIds[0] || null,
            
            // Multi-Installments
            total_fee: calculatedTotalFee,
            amount_paid: calculatedAmountPaid,
            amount_due: amountDueNum,
            payment_installments: installmentsList,
            payment_due_date: payment_due_date || (installmentsList.find(i => i.status !== 'paid')?.due_date) || null,
            payment_link: payment_link || (installmentsList.find(i => i.status !== 'paid')?.payment_link) || null,
            payment_status,
            
            // Documents
            mou_url: mou_url || null,
            credentials_url: credentials_url || null,
            portal_password: portal_password || 'Student@123',
            created_by: auth.executive?.name || 'Sales Executive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from('placement_students')
            .insert([newStudent])
            .select()
            .single();

        if (error) {
            console.error('Error inserting placement student:', error);
            throw error;
        }

        // Auto-assign daily tasks to Marketing Persons and HR Representatives
        const allMarketingAndHR = [...mIds, ...hIds].filter((id, idx, arr) => id && arr.indexOf(id) === idx);
        if (allMarketingAndHR.length > 0) {
            const todayStr = new Date().toISOString().split('T')[0];
            const tasksToInsert = allMarketingAndHR.map(empId => ({
                title: `📊 Daily Job Outreach: ${full_name} (${target_roles || 'Placement'})`,
                description: `Daily outreach & tracker update for ${full_name}. Target: Log Easy Apply and Long Form applications. Google Sheet Tracker: ${spreadsheet_url || 'N/A'}`,
                employee_id: empId,
                deadline: todayStr,
                priority: 'High',
                status: 'Pending',
                created_at: new Date().toISOString()
            }));

            const notifsToInsert = allMarketingAndHR.map(empId => ({
                recipient_role: 'employee',
                recipient_id: empId,
                type: 'placement_student_assigned',
                title: '🎓 New Placement Student Assigned',
                message: `You are assigned to ${full_name}. Daily task and tracker sheet have been added to your dashboard.`,
                is_read: false
            }));

            try {
                await supabaseAdmin.from('tasks').insert(tasksToInsert);
            } catch (tErr) {
                console.warn('Tasks insert note:', tErr.message);
            }

            try {
                await supabaseAdmin.from('notifications').insert(notifsToInsert);
            } catch (nErr) {
                console.warn('Notifications insert note:', nErr.message);
            }
        }

        return NextResponse.json({
            success: true,
            student: data,
            message: `Student ${full_name} enrolled successfully with ID ${student_id}`,
        });
    } catch (err) {
        console.error('Placement student creation error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// PATCH: Update student details, multi-assignees, installments, or spreadsheet link
export async function PATCH(request) {
    try {
        const auth = await isAuthorizedSales(request);
        if (!auth.ok) {
            return NextResponse.json({ success: false, error: 'Unauthorized. Only Sales Executives can edit students.' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Student ID required' }, { status: 400 });
        }

        // Maintain array consistency
        if (updates.marketing_person_ids !== undefined) {
            const mIds = Array.isArray(updates.marketing_person_ids) ? updates.marketing_person_ids : [updates.marketing_person_ids];
            updates.marketing_person_ids = mIds;
            updates.marketing_person_id = mIds[0] || null;
        }
        if (updates.support_person_ids !== undefined) {
            const sIds = Array.isArray(updates.support_person_ids) ? updates.support_person_ids : [updates.support_person_ids];
            updates.support_person_ids = sIds;
            updates.support_person_id = sIds[0] || null;
        }
        if (updates.hr_person_ids !== undefined) {
            const hIds = Array.isArray(updates.hr_person_ids) ? updates.hr_person_ids : [updates.hr_person_ids];
            updates.hr_person_ids = hIds;
            updates.hr_person_id = hIds[0] || null;
        }
        if (updates.manager_person_ids !== undefined) {
            const mgrIds = Array.isArray(updates.manager_person_ids) ? updates.manager_person_ids : [updates.manager_person_ids];
            updates.manager_person_ids = mgrIds;
            updates.manager_person_id = mgrIds[0] || null;
        }

        // Installment recalculations
        if (updates.payment_installments && Array.isArray(updates.payment_installments)) {
            const totalFee = updates.payment_installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
            const amountPaid = updates.payment_installments
                .filter(inst => inst.status === 'paid')
                .reduce((sum, inst) => sum + Number(inst.amount || 0), 0);

            updates.total_fee = totalFee;
            updates.amount_paid = amountPaid;
            updates.amount_due = Math.max(0, totalFee - amountPaid);

            if (amountPaid >= totalFee && totalFee > 0) {
                updates.payment_status = 'paid';
            } else if (amountPaid > 0) {
                updates.payment_status = 'partially_paid';
            } else {
                updates.payment_status = 'due';
            }
        } else if (updates.total_fee !== undefined || updates.amount_paid !== undefined) {
            const totalFeeNum = Number(updates.total_fee || 0);
            const amountPaidNum = Number(updates.amount_paid || 0);
            updates.amount_due = Math.max(0, totalFeeNum - amountPaidNum);

            if (amountPaidNum >= totalFeeNum && totalFeeNum > 0) {
                updates.payment_status = 'paid';
            } else if (amountPaidNum > 0) {
                updates.payment_status = 'partially_paid';
            } else {
                updates.payment_status = 'due';
            }
        }

        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from('placement_students')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, student: data });
    } catch (err) {
        console.error('Placement student update error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// DELETE: Delete enrolled student (Sales Executive only)
export async function DELETE(request) {
    try {
        const auth = await isAuthorizedSales(request);
        if (!auth.ok) {
            return NextResponse.json({ success: false, error: 'Unauthorized. Only Sales Executives can delete students.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Student ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('placement_students')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Student record deleted successfully.' });
    } catch (err) {
        console.error('Placement student delete error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
