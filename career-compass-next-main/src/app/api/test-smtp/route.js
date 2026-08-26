import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

function cleanEnv(val) {
    if (!val) return '';
    let str = String(val).trim();
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        str = str.slice(1, -1).trim();
    }
    return str;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const testTo = searchParams.get('to');

        const host = cleanEnv(process.env.SMTP_HOST) || 'smtp.titan.email';
        const port = parseInt(cleanEnv(process.env.SMTP_PORT) || '465', 10);
        const user = cleanEnv(process.env.SMTP_USER);
        const pass = cleanEnv(process.env.SMTP_PASS);
        const from = cleanEnv(process.env.SMTP_FROM) || user || 'hr@diverseloopers.com';

        const configSummary = {
            host,
            port,
            secure: port === 465,
            user: user || '(NOT SET)',
            hasPass: !!pass,
            passLength: pass ? pass.length : 0,
            from,
            nodeEnv: process.env.NODE_ENV
        };

        if (!user || !pass) {
            return NextResponse.json({
                success: false,
                status: 'MISSING_CREDENTIALS',
                message: 'SMTP_USER or SMTP_PASS is not set in environment variables. Note: If you recently added them to Vercel, you must REDEPLOY for them to take effect.',
                config: configSummary
            }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            debug: true
        });

        // Verify connection configuration
        try {
            await transporter.verify();
        } catch (verifyErr) {
            return NextResponse.json({
                success: false,
                status: 'AUTH_OR_CONNECTION_FAILED',
                error_message: verifyErr.message,
                error_code: verifyErr.code,
                error_response: verifyErr.response,
                config: configSummary,
                hint: verifyErr.code === 'EAUTH'
                    ? 'Authentication failed. Please verify that SMTP_USER and SMTP_PASS match your Titan / email provider password.'
                    : 'Connection error. Please check SMTP_HOST and SMTP_PORT.'
            }, { status: 500 });
        }

        // If 'to' parameter is supplied, send a test email
        let testSendResult = null;
        if (testTo) {
            try {
                const info = await transporter.sendMail({
                    from: `"Diverse Loopers HR Test" <${from}>`,
                    to: testTo,
                    subject: 'Diverse Loopers SMTP Test Email',
                    html: '<div style="font-family:Arial,sans-serif;padding:20px;"><h2>SMTP Test Successful! ✅</h2><p>Your Diverse Loopers email system is working properly.</p></div>'
                });
                testSendResult = { sent: true, messageId: info.messageId };
            } catch (sendErr) {
                testSendResult = { sent: false, error: sendErr.message };
            }
        }

        return NextResponse.json({
            success: true,
            status: 'CONNECTED',
            message: 'SMTP connection verified successfully! Email service is ready.',
            config: configSummary,
            test_send: testSendResult
        });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
