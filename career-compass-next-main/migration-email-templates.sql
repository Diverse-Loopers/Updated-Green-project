-- ============================================================
-- EMAIL TEMPLATES MIGRATION
-- Run in Supabase SQL Editor AFTER migration-onboarding.sql
-- ============================================================

-- 1. Email templates table (editable from CSO dashboard)
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,         -- e.g. 'welcome_email', 'howto_email'
    name TEXT NOT NULL,                -- Display name
    subject TEXT NOT NULL,             -- Email subject line
    body_html TEXT NOT NULL,           -- Full HTML body (supports placeholders)
    description TEXT DEFAULT '',       -- Admin description of when this is sent
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Full access policy (managed by service role from API)
DROP POLICY IF EXISTS "Service role manages templates" ON email_templates;
CREATE POLICY "Service role manages templates" ON email_templates FOR ALL USING (true);

-- 3. Seed default templates with placeholders
-- Placeholders: {{full_name}}, {{organization}}, {{plan}}, {{product}}, {{transaction_id}},
--               {{work_email}}, {{billing_address}}, {{industry}}, {{company_size}},
--               {{country}}, {{phone}}, {{gst_number}}, {{date}}

INSERT INTO email_templates (slug, name, subject, body_html, description) VALUES
(
    'welcome_email',
    'Welcome Email',
    'Welcome to {{product}} — Your {{plan}} Plan is Active! 🎉',
    '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
  <tr><td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
    <img src="https://diverseloopers.com/Diverse%20Loopers%20Black%20BG%20(2).png" alt="Diverse Loopers" style="height:48px;margin-bottom:16px;border-radius:8px;">
    <h1 style="color:#4ade80;margin:0;font-size:24px;">Welcome to {{product}}!</h1>
    <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">Your {{plan}} plan has been activated</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="font-size:16px;color:#1e293b;">Hi <strong>{{full_name}}</strong>,</p>
    <p style="font-size:14px;color:#475569;line-height:1.6;">Thank you for subscribing to <strong>{{product}}</strong>! Your <strong style="color:#16a34a;">{{plan}}</strong> plan is now active and ready to use.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#f8fafc;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;font-weight:bold;">Transaction ID</td>
          <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;font-family:monospace;">{{transaction_id}}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;font-weight:bold;">Plan</td>
          <td style="padding:12px 16px;font-size:13px;color:#16a34a;border-bottom:1px solid #e2e8f0;font-weight:bold;text-transform:capitalize;">{{plan}}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;font-weight:bold;">Organization</td>
          <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;">{{organization}}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;font-weight:bold;">Work Email</td>
          <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;">{{work_email}}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;font-weight:bold;">Billing Address</td>
          <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;">{{billing_address}}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;font-weight:bold;">Industry</td>
          <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;">{{industry}}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:bold;">Date</td>
          <td style="padding:12px 16px;font-size:13px;color:#0f172a;">{{date}}</td></tr>
    </table>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://diverseloopers.com/products/loopmail/app" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:bold;">Open {{product}} Dashboard →</a>
    </div>
    <p style="font-size:13px;color:#94a3b8;text-align:center;">Need help? Reply to this email or contact us at contact@diverseloopers.com</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">© 2026 Diverse Loopers. All rights reserved.</p>
  </td></tr>
</table>
</body></html>',
    'Sent automatically when a user successfully enrolls in any plan (Basic, Premium). Contains transaction details and form data.'
),
(
    'howto_email',
    'Getting Started Guide',
    'Getting Started with {{product}} — Setup Guide & Guidelines 📘',
    '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
  <tr><td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
    <h1 style="color:#4ade80;margin:0;font-size:22px;">📘 Getting Started Guide</h1>
    <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">Everything you need to know about {{product}}</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="font-size:16px;color:#1e293b;">Hi <strong>{{full_name}}</strong>,</p>
    <p style="font-size:14px;color:#475569;line-height:1.6;">Welcome aboard! Here is everything you need to get started with <strong>{{product}}</strong>.</p>

    <h2 style="font-size:16px;color:#0f172a;margin:28px 0 12px;border-bottom:2px solid #dcfce7;padding-bottom:8px;">🚀 Quick Setup Steps</h2>
    <ol style="font-size:14px;color:#475569;line-height:1.8;padding-left:20px;">
      <li><strong>Configure SMTP</strong> — Go to Settings → SMTP and add your email provider (Gmail, GoDaddy, BigRock, etc.)</li>
      <li><strong>Import Contacts</strong> — Upload your contact list via CSV or add them manually</li>
      <li><strong>Create Folders</strong> — Organize contacts into folders for targeted campaigns</li>
      <li><strong>Compose Campaign</strong> — Use the rich email editor to create beautiful emails</li>
      <li><strong>Send & Track</strong> — Launch your campaign and monitor delivery analytics</li>
    </ol>

    <h2 style="font-size:16px;color:#0f172a;margin:28px 0 12px;border-bottom:2px solid #dcfce7;padding-bottom:8px;">📋 Rules & Guidelines</h2>
    <ul style="font-size:14px;color:#475569;line-height:1.8;padding-left:20px;">
      <li>Do <strong>NOT</strong> send unsolicited/spam emails. Only email contacts who have opted in.</li>
      <li>Include an <strong>unsubscribe link</strong> in every campaign.</li>
      <li>Do not exceed your plan''s monthly sending limits.</li>
      <li>Comply with <strong>CAN-SPAM Act</strong> and <strong>GDPR</strong> regulations.</li>
      <li>We reserve the right to suspend accounts that violate these guidelines.</li>
      <li>Your SMTP credentials are encrypted and stored securely.</li>
    </ul>

    <h2 style="font-size:16px;color:#0f172a;margin:28px 0 12px;border-bottom:2px solid #dcfce7;padding-bottom:8px;">💡 Pro Tips</h2>
    <ul style="font-size:14px;color:#475569;line-height:1.8;padding-left:20px;">
      <li>Use the <strong>Help</strong> button in the sidebar for detailed feature guides.</li>
      <li>Your sender name and email are auto-filled from your SMTP config.</li>
      <li>Premium users get access to the rich text editor with image embedding.</li>
    </ul>

    <div style="text-align:center;margin:32px 0;">
      <a href="https://diverseloopers.com/products/loopmail/app" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:bold;">Start Using {{product}} →</a>
    </div>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">© 2026 Diverse Loopers. All rights reserved.</p>
  </td></tr>
</table>
</body></html>',
    'Sent automatically after the welcome email. Contains setup instructions, rules, and guidelines.'
)
ON CONFLICT (slug) DO NOTHING;
