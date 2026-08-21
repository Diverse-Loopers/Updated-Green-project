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
        const scope = searchParams.get('scope');
        const manager_id = searchParams.get('manager_id');
        const employee_id = searchParams.get('employee_id');

        let query = supabaseAdmin.from('team_announcements').select('*');

        if (employee_id) {
            const { data: em } = await supabaseAdmin.from('employee_managers').select('manager_id').eq('employee_id', employee_id).maybeSingle();
            if (em && em.manager_id) {
                query = query.or(`scope.eq.all,and(scope.eq.team,manager_id.eq.${em.manager_id})`);
            } else {
                query = query.eq('scope', 'all');
            }
        } else {
            if (scope) query = query.eq('scope', scope);
            if (manager_id) query = query.eq('manager_id', manager_id);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error: queryErr } = await query;
        if (queryErr) throw queryErr;

        return NextResponse.json({ success: true, announcements: data });
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
            if (auth.ok && ['manager', 'ceo', 'cmo_chief'].includes(auth.executive.role)) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { title, message, posted_by, posted_by_role, scope, manager_id } = await request.json();

        if (!title || !message) {
            return NextResponse.json({ success: false, error: 'Missing title or message' }, { status: 400 });
        }

        const { data: announcement, error: insertErr } = await supabaseAdmin
            .from('team_announcements')
            .insert([{ title, message, posted_by, posted_by_role: posted_by_role || 'manager', scope: scope || 'team', manager_id }])
            .select()
            .single();

        if (insertErr) throw insertErr;

        let targetEmails = [];
        let targetEmployeeIds = [];

        if (scope === 'team' && manager_id) {
            const { data: team } = await supabaseAdmin.from('employee_managers').select('employee_id').eq('manager_id', manager_id);
            if (team && team.length > 0) {
                targetEmployeeIds = team.map(t => t.employee_id);
            }
        } else if (scope === 'all') {
            const { data: allEmps } = await supabaseAdmin.from('employees').select('employee_id').eq('is_active', true);
            if (allEmps) {
                targetEmployeeIds = allEmps.map(e => e.employee_id);
            }
        }

        if (targetEmployeeIds.length > 0) {
            const { data: employeesData } = await supabaseAdmin.from('employees').select('employee_id, email').in('employee_id', targetEmployeeIds);

            if (employeesData) {
                targetEmails = employeesData.filter(e => e.email).map(e => e.email);

                // Insert notifications
                const notifications = targetEmployeeIds.map(empId => ({
                    recipient_id: empId,
                    type: 'announcement',
                    title: title,
                    message: message.substring(0, 100) + '...',
                    is_read: false
                }));

                await supabaseAdmin.from('notifications').insert(notifications);
            }
        }

        // Send Emails
        if (targetEmails.length > 0) {
            const transporter = getTransporter();
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_USER || 'hr@diverseloopers.com',
                    to: targetEmails,
                    subject: `Announcement: ${title}`,
                    html: `
                        <h2>${title}</h2>
                        <p><strong>From:</strong> ${posted_by}</p>
                        <hr />
                        <div>${message.replace(/\n/g, '<br/>')}</div>
                    `
                });
            } catch (emailErr) {
                console.error('Failed to send announcement emails:', emailErr);
            }
        }

        return NextResponse.json({ success: true, announcement, message: 'Announcement posted successfully' });
    } catch (err) {
        console.error('Error posting announcement:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
