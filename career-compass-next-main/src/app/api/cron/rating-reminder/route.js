import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
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
        const authHeader = request.headers.get('authorization');
        const adminKey = request.headers.get('x-admin-key');

        if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && adminKey !== 'hrms-admin-access') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        const dayOfMonth = today.getDate();

        // Only run between 13th and 15th
        if (dayOfMonth < 13 || dayOfMonth > 15) {
            return NextResponse.json({ success: true, message: 'Not in reminder window (13th-15th)' });
        }

        const currentMonth = today.toISOString().substring(0, 7); // YYYY-MM

        // Get all active managers
        const { data: managers, error: mgrErr } = await supabaseAdmin
            .from('managers')
            .select('id, name, email, employee_id')
            .eq('is_active', true);

        if (mgrErr) throw mgrErr;

        const transporter = getTransporter();
        let remindersSent = 0;

        for (const manager of managers) {
            if (!manager.employee_id) continue;

            const { data: ratings } = await supabaseAdmin
                .from('ratings')
                .select('id')
                .eq('rated_by', manager.employee_id)
                .eq('month', currentMonth)
                .limit(1);

            if (!ratings || ratings.length === 0) {
                try {
                    await transporter.sendMail({
                        from: process.env.SMTP_USER || 'hr@diverseloopers.com',
                        to: manager.email,
                        subject: `Action Required: Submit Team Ratings for ${currentMonth}`,
                        html: `
                            <h2>Monthly Ratings Reminder</h2>
                            <p>Hello ${manager.name},</p>
                            <p>This is an automated reminder to submit performance ratings for your team for the month of <strong>${currentMonth}</strong>.</p>
                            <p>Please log in to the HRMS Manager Dashboard and complete the evaluations.</p>
                            <br/>
                            <p>Thank you,<br/>HR Team</p>
                        `
                    });
                    remindersSent++;
                } catch (emailErr) {
                    console.error(`Failed to send reminder to ${manager.email}:`, emailErr);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Rating reminders processed',
            reminders_sent: remindersSent,
            month: currentMonth
        });

    } catch (err) {
        console.error('Error in rating reminder cron:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
