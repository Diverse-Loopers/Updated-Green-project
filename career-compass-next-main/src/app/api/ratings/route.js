import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyExecutiveSession } from '@/lib/executive-auth';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.titan.email',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: { 
            user: process.env.SMTP_USER || 'hr@diverseloopers.com', 
            pass: process.env.SMTP_PASS 
        }
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const employee_id = searchParams.get('employee_id');
        const month = searchParams.get('month');
        const rated_by = searchParams.get('rated_by');
        const manager_id = searchParams.get('manager_id');

        let query = supabaseAdmin.from('ratings').select('*');

        if (employee_id) query = query.eq('employee_id', employee_id);
        if (month) query = query.eq('month', month);
        if (rated_by) query = query.eq('rated_by', rated_by);

        if (manager_id) {
            const { data: team } = await supabaseAdmin.from('employee_managers').select('employee_id').eq('manager_id', manager_id);
            if (team && team.length > 0) {
                query = query.in('employee_id', team.map(t => t.employee_id));
            } else {
                return NextResponse.json({ success: true, ratings: [] });
            }
        }

        query = query.order('created_at', { ascending: false });

        const { data, error: queryErr } = await query;
        if (queryErr) throw queryErr;

        return NextResponse.json({ success: true, ratings: data });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const adminKey = request.headers.get('x-admin-key');
        let isAuthorized = adminKey === 'hrms-admin-access';

        if (!isAuthorized) {
            const auth = await verifyExecutiveSession(request);
            if (auth.ok && auth.executive.role === 'manager') {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { ratings, month, rated_by, rated_by_role } = await request.json();

        if (!ratings || !month || !rated_by) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const upsertData = ratings.map(r => ({
            employee_id: r.employee_id,
            rated_by,
            rated_by_role: rated_by_role || 'manager',
            rating: r.rating,
            month,
            comments: r.comments
        }));

        const { error: upsertErr } = await supabaseAdmin
            .from('ratings')
            .upsert(upsertData, { onConflict: 'employee_id, rated_by, month' });

        if (upsertErr) throw upsertErr;

        // Handle notifications and emails
        const transporter = getTransporter();

        for (const r of ratings) {
            // Insert notification
            await supabaseAdmin.from('notifications').insert([{
                recipient_id: r.employee_id,
                type: 'rating',
                title: `New Rating for ${month}`,
                message: `You have received a performance rating of ${r.rating}/100.`,
                is_read: false
            }]);

            // Get employee email
            const { data: emp } = await supabaseAdmin.from('employees').select('email, full_name').eq('employee_id', r.employee_id).single();

            if (emp && emp.email) {
                try {
                    await transporter.sendMail({
                        from: process.env.SMTP_USER || 'hr@diverseloopers.com',
                        to: [emp.email, process.env.SMTP_USER || 'hr@diverseloopers.com'].join(','),
                        subject: `Performance Rating for ${month} - ${emp.full_name}`,
                        html: `
                            <h2>Performance Rating</h2>
                            <p>Hello ${emp.full_name},</p>
                            <p>Your performance rating for the month of <strong>${month}</strong> has been submitted.</p>
                            <p><strong>Rating:</strong> ${r.rating}/100</p>
                            <p><strong>Comments:</strong> ${r.comments || 'N/A'}</p>
                            <br/>
                            <p>Regards,<br/>Management Team</p>
                        `
                    });
                } catch (emailErr) {
                    console.error(`Failed to send email to ${emp.email}:`, emailErr);
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Ratings submitted successfully' });
    } catch (err) {
        console.error('Error submitting ratings:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
