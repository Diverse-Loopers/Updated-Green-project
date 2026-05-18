-- ============================================================
-- BLOG SYSTEM MIGRATION
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover_image TEXT DEFAULT '',
    author TEXT DEFAULT 'Diverse Loopers',
    category TEXT DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    meta_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    meta_keywords TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    read_time_minutes INT DEFAULT 5,
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts" ON blog_posts FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Service role manages posts" ON blog_posts;
CREATE POLICY "Service role manages posts" ON blog_posts FOR ALL USING (true);

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, created_at DESC);

-- ============================================================
-- SEED STARTER ARTICLES (SEO-optimized)
-- ============================================================

INSERT INTO blog_posts (slug, title, excerpt, content, author, category, tags, meta_title, meta_description, meta_keywords, is_published, read_time_minutes) VALUES

-- Article 1: SMTP Setup Guide
('how-to-setup-smtp-for-bulk-email-marketing',
'How to Set Up SMTP for Bulk Email Marketing — Complete 2026 Guide',
'Learn how to configure SMTP credentials from Gmail, GoDaddy, Hostinger, and other providers for sending professional bulk email campaigns.',
'<h2>What is SMTP and Why Do You Need It?</h2>
<p>SMTP (Simple Mail Transfer Protocol) is the backbone of email delivery. Whether you''re sending 100 or 100,000 emails, you need a properly configured SMTP server to ensure your messages reach inboxes — not spam folders.</p>
<p>In this guide, we''ll walk you through setting up SMTP with popular providers and connecting it to <strong>LoopMail</strong>, our email marketing platform.</p>

<h2>Step 1: Choose Your SMTP Provider</h2>
<p>Here are the most popular SMTP providers and their sending limits:</p>
<table>
<tr><th>Provider</th><th>Free Limit</th><th>Best For</th></tr>
<tr><td>Gmail SMTP</td><td>500 emails/day</td><td>Small campaigns, testing</td></tr>
<tr><td>GoDaddy Workspace</td><td>500 emails/day</td><td>Business domains</td></tr>
<tr><td>Hostinger</td><td>500 emails/hour</td><td>Budget-friendly bulk</td></tr>
<tr><td>Amazon SES</td><td>62,000 emails/month</td><td>High-volume senders</td></tr>
<tr><td>SendGrid</td><td>100 emails/day (free)</td><td>Transactional + marketing</td></tr>
</table>

<h2>Step 2: Get Your SMTP Credentials</h2>
<h3>Gmail SMTP</h3>
<ol>
<li>Go to <strong>Google Account → Security → App Passwords</strong></li>
<li>Generate a new app password for "Mail"</li>
<li>Use these settings: Host: <code>smtp.gmail.com</code>, Port: <code>465</code> (SSL) or <code>587</code> (TLS)</li>
</ol>

<h3>GoDaddy / Hostinger</h3>
<ol>
<li>Log in to your hosting dashboard</li>
<li>Navigate to <strong>Email → SMTP Settings</strong></li>
<li>Copy the Host, Port, Username, and Password</li>
</ol>

<h2>Step 3: Connect SMTP to LoopMail</h2>
<ol>
<li>Log in to <a href="https://diverseloopers.com/products/loopmail/app">LoopMail</a></li>
<li>Go to <strong>Settings → SMTP Configuration</strong></li>
<li>Enter your SMTP Host, Port, Username, and Password</li>
<li>Click <strong>Save & Test</strong> to verify the connection</li>
<li>Start sending campaigns!</li>
</ol>

<h2>Best Practices for Email Deliverability</h2>
<ul>
<li><strong>Warm up your domain</strong> — Start with 50-100 emails/day and gradually increase</li>
<li><strong>Use a professional sender name</strong> — "Company Name" not "noreply"</li>
<li><strong>Include an unsubscribe link</strong> — Required by CAN-SPAM and GDPR</li>
<li><strong>Authenticate your domain</strong> — Set up SPF, DKIM, and DMARC records</li>
<li><strong>Clean your contact list</strong> — Remove bounced emails regularly</li>
</ul>

<h2>Conclusion</h2>
<p>Setting up SMTP correctly is the foundation of successful email marketing. With LoopMail, you can connect any SMTP provider and start sending professional campaigns in minutes.</p>
<p><a href="https://diverseloopers.com/products/loopmail/pricing">Get started with LoopMail for free →</a></p>',
'Diverse Loopers', 'Email Marketing', ARRAY['smtp', 'email marketing', 'loopmail', 'bulk email'],
'How to Set Up SMTP for Bulk Email Marketing — 2026 Guide',
'Step-by-step guide to configure SMTP from Gmail, GoDaddy, Hostinger for bulk email campaigns. Connect to LoopMail in minutes.',
ARRAY['smtp setup guide', 'bulk email smtp', 'gmail smtp setup', 'email marketing smtp', 'loopmail smtp'],
true, 7),

-- Article 2: Free Email Marketing Tools
('best-free-email-marketing-tools-india-2026',
'5 Best Free Email Marketing Tools in India — 2026 Comparison',
'Compare the top free email marketing tools available in India including LoopMail, Mailchimp, Sendinblue, and more.',
'<h2>Why Email Marketing Still Matters in 2026</h2>
<p>Email marketing delivers an average ROI of ₹3,600 for every ₹100 spent — making it the most cost-effective digital marketing channel. But choosing the right tool can be overwhelming.</p>
<p>We compared the top free email marketing tools available in India to help you make the right choice.</p>

<h2>1. LoopMail by Diverse Loopers — Best Overall Free Option</h2>
<p><strong>Free plan:</strong> Unlimited contacts, bring your own SMTP</p>
<p><strong>Best for:</strong> Startups, SMBs, and businesses who want full control</p>
<p>LoopMail stands out because it lets you use <em>your own SMTP credentials</em> — meaning you''re not locked into any provider''s sending limits. You control deliverability, sender reputation, and costs.</p>
<ul>
<li>✅ Rich HTML email editor</li>
<li>✅ Contact management with folders</li>
<li>✅ CSV import</li>
<li>✅ Campaign analytics</li>
<li>✅ No monthly email limits (depends on your SMTP)</li>
</ul>
<p><a href="https://diverseloopers.com/products/loopmail/pricing">Try LoopMail Free →</a></p>

<h2>2. Mailchimp — Best for Beginners</h2>
<p><strong>Free plan:</strong> 500 contacts, 1,000 emails/month</p>
<p><strong>Best for:</strong> Absolute beginners who need hand-holding</p>
<p>Mailchimp is the most well-known email platform, but the free plan is very limited. You''ll quickly outgrow it.</p>

<h2>3. Brevo (formerly Sendinblue) — Best for Transactional Email</h2>
<p><strong>Free plan:</strong> Unlimited contacts, 300 emails/day</p>
<p><strong>Best for:</strong> Businesses needing both marketing and transactional emails</p>

<h2>4. Zoho Campaigns — Best for Zoho Users</h2>
<p><strong>Free plan:</strong> 2,000 contacts, 6,000 emails/month</p>
<p><strong>Best for:</strong> Businesses already using Zoho ecosystem</p>

<h2>5. Moosend — Best Automation on Free Plan</h2>
<p><strong>Free trial:</strong> 30 days, then paid</p>
<p><strong>Best for:</strong> Automation-heavy workflows</p>

<h2>Comparison Table</h2>
<table>
<tr><th>Tool</th><th>Free Contacts</th><th>Free Emails</th><th>Own SMTP</th><th>Made in India</th></tr>
<tr><td><strong>LoopMail</strong></td><td>Unlimited</td><td>Unlimited*</td><td>✅ Yes</td><td>✅ Yes</td></tr>
<tr><td>Mailchimp</td><td>500</td><td>1,000/mo</td><td>❌ No</td><td>❌ No</td></tr>
<tr><td>Brevo</td><td>Unlimited</td><td>300/day</td><td>❌ No</td><td>❌ No</td></tr>
<tr><td>Zoho</td><td>2,000</td><td>6,000/mo</td><td>❌ No</td><td>❌ No</td></tr>
<tr><td>Moosend</td><td>Trial only</td><td>Trial only</td><td>❌ No</td><td>❌ No</td></tr>
</table>
<p><em>* LoopMail sending limits depend on your SMTP provider</em></p>

<h2>Verdict</h2>
<p>If you want maximum flexibility and zero vendor lock-in, <strong>LoopMail</strong> is the clear winner. It''s the only tool that lets you bring your own SMTP — meaning you control costs and deliverability.</p>',
'Diverse Loopers', 'Email Marketing', ARRAY['email marketing', 'free tools', 'comparison', 'india'],
'5 Best Free Email Marketing Tools in India — 2026',
'Compare free email marketing tools: LoopMail, Mailchimp, Brevo, Zoho, Moosend. Find the best option for Indian businesses.',
ARRAY['free email marketing tools', 'best email marketing india', 'mailchimp alternative india', 'loopmail vs mailchimp', 'bulk email tool free'],
true, 8),

-- Article 3: Student Projects
('how-students-get-real-project-experience',
'How Students Can Get Real-World Project Experience in 2026',
'Discover how the Hybrid Hustle model at Diverse Loopers connects students to live business projects for career-ready experience.',
'<h2>The Problem: Degrees Without Experience</h2>
<p>Every year, millions of graduates enter the job market with degrees but zero practical experience. Employers want candidates who can <em>do the work</em>, not just talk about theory.</p>
<p>The gap between academic learning and industry requirements has never been wider. But there''s a solution.</p>

<h2>The Hybrid Hustle Model</h2>
<p>At <strong>Diverse Loopers</strong>, we created the Hybrid Hustle model — a framework that connects students directly to live business projects while they''re still studying.</p>
<p>Here''s how it works:</p>
<ol>
<li><strong>Learn</strong> — Take industry-relevant courses with expert trainers</li>
<li><strong>Build</strong> — Work on real client projects (not dummy assignments)</li>
<li><strong>Earn</strong> — Get paid for your contributions</li>
<li><strong>Grow</strong> — Build a portfolio that impresses employers</li>
</ol>

<h2>Types of Projects Students Work On</h2>
<ul>
<li>🌐 <strong>Web Development</strong> — Building real websites and web apps for clients</li>
<li>📊 <strong>Data Analytics</strong> — Analyzing real business data for insights</li>
<li>📱 <strong>Mobile App Development</strong> — Creating apps from concept to deployment</li>
<li>🎨 <strong>UI/UX Design</strong> — Designing interfaces for real products</li>
<li>📧 <strong>Digital Marketing</strong> — Running actual campaigns with real budgets</li>
</ul>

<h2>Why This Beats Traditional Internships</h2>
<table>
<tr><th>Traditional Internship</th><th>Hybrid Hustle</th></tr>
<tr><td>3-6 month commitment</td><td>Flexible project-based</td></tr>
<tr><td>Often unpaid</td><td>Paid contributions</td></tr>
<tr><td>May do only admin work</td><td>Real development work</td></tr>
<tr><td>One company experience</td><td>Multiple project exposure</td></tr>
<tr><td>Limited mentorship</td><td>Guided by industry experts</td></tr>
</table>

<h2>How to Get Started</h2>
<ol>
<li>Visit <a href="https://diverseloopers.com">diverseloopers.com</a> and sign up</li>
<li>Complete your skill profile</li>
<li>Browse available projects</li>
<li>Apply and start building!</li>
</ol>

<h2>Success Stories</h2>
<p>Our students have worked on projects for companies across e-commerce, fintech, healthcare, and education — building portfolios that land them jobs at top companies.</p>
<p><a href="https://diverseloopers.com/fame-wall">See our Fame Wall →</a></p>',
'Diverse Loopers', 'Career', ARRAY['students', 'projects', 'career', 'hybrid hustle'],
'How Students Get Real-World Project Experience — Hybrid Hustle',
'Learn how the Hybrid Hustle model connects students to live business projects. Get paid, build skills, and launch your career.',
ARRAY['real world projects for students', 'student project experience', 'hybrid hustle', 'internship alternative', 'project-based learning'],
true, 6)

ON CONFLICT (slug) DO NOTHING;
