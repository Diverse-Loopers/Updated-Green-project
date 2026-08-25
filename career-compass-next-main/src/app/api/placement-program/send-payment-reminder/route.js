import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { student_id, custom_message, payment_link_override } = body;

        if (!student_id) {
            return NextResponse.json({ success: false, error: 'student_id is required' }, { status: 400 });
        }

        // Fetch student record
        const { data: student, error } = await supabaseAdmin
            .from('placement_students')
            .select('*')
            .eq('id', student_id)
            .single();

        if (error || !student) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
        }

        const dueAmount = Number(student.amount_due || 0);
        const totalFee = Number(student.total_fee || 0);
        const amountPaid = Number(student.amount_paid || 0);
        const dueDate = student.payment_due_date
            ? new Date(student.payment_due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Immediate';

        const paymentLink = payment_link_override || student.payment_link || 'https://diverseloopers.com/pricing';

        const smtpPort = parseInt(process.env.SMTP_PORT || '465');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.titan.email',
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'finance@diverseloopers.com';

        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #0f172a, #1e293b); padding: 30px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
                .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
                .content { padding: 32px 30px; }
                .greeting { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
                .payment-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; }
                .payment-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                .payment-row:last-child { margin-bottom: 0; padding-top: 10px; border-top: 1px dashed #86efac; font-weight: 700; font-size: 16px; color: #166534; }
                .cta-btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #16a34a; color: #ffffff !important; padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; margin: 20px 0 10px; }
                .footer { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Diverse Loopers Placement Program</h1>
                    <p>Official Payment Schedule Notification</p>
                </div>
                <div class="content">
                    <p class="greeting">Dear ${student.full_name},</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                        This is an official reminder regarding your placement program service payment. Below is your updated payment breakdown:
                    </p>
                    <div class="payment-card">
                        <div class="payment-row"><span>Student ID:</span><span style="font-family: monospace; font-weight: 600;">${student.student_id}</span></div>
                        <div class="payment-row"><span>Total Program Fee:</span><span>₹${totalFee.toLocaleString('en-IN')}</span></div>
                        <div class="payment-row"><span>Amount Paid so far:</span><span style="color: #16a34a;">₹${amountPaid.toLocaleString('en-IN')}</span></div>
                        <div class="payment-row"><span>Due Date:</span><span style="color: #dc2626;">${dueDate}</span></div>
                        <div class="payment-row"><span>Remaining Amount Due:</span><span>₹${dueAmount.toLocaleString('en-IN')}</span></div>
                    </div>

                    ${custom_message ? `<p style="font-size: 13px; background: #f8fafc; border-left: 3px solid #3b82f6; padding: 10px 14px; color: #334155; margin: 15px 0;">${custom_message}</p>` : ''}

                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                        Please complete your payment before the due date to ensure uninterrupted placement applications and dedicated marketing support.
                    </p>

                    <a href="${paymentLink}" class="cta-btn" target="_blank">💳 Pay ₹${dueAmount.toLocaleString('en-IN')} Online Now</a>
                </div>
                <div class="footer">
                    <p>If you have already made this payment, please contact your account manager or reply to this email with your transaction receipt.</p>
                    <p>© ${new Date().getFullYear()} Diverse Loopers. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"Diverse Loopers Accounts" <${senderEmail}>`,
            to: student.email,
            subject: `⚠️ Payment Due Reminder (₹${dueAmount.toLocaleString('en-IN')}) — Diverse Loopers Placement Program`,
            html: emailHtml,
            cc: 'ashish.cmgo@diverseloopers.com, ceo@diverseloopers.com',
        };

        const info = await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: `Payment reminder email sent successfully to ${student.email}`,
            messageId: info.messageId,
        });
    } catch (err) {
        console.error('Payment reminder send error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
