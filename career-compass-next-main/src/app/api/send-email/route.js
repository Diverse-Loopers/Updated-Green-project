import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { to, subject, body, cc } = await request.json();

        if (!to || !subject || !body) {
            return Response.json({ success: false, error: 'Missing required fields: to, subject, body' }, { status: 400 });
        }

        const smtpPort = parseInt(process.env.SMTP_PORT || '465');
        console.log('SMTP Config:', { host: process.env.SMTP_HOST, port: smtpPort, user: process.env.SMTP_USER, passLength: process.env.SMTP_PASS?.length });
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
            debug: true,
            logger: true,
        });

        const senderEmail = process.env.SMTP_FROM || 'hr@diverseloopers.com';
        const mailOptions = {
            from: `"Diverse Loopers HR" <${senderEmail}>`,
            to,
            subject,
            html: body,
            ...(cc && { cc }),
            bcc: senderEmail, // BCC yourself to keep a record in your inbox
        };

        const info = await transporter.sendMail(mailOptions);

        return Response.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Email send error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
