-- ============================================================
-- BUSINESS PAGE CMS TABLES
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. BUSINESS PRODUCTS (SaaS Tools)
CREATE TABLE IF NOT EXISTS business_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  cta_link TEXT DEFAULT '/business',
  icon_name TEXT,
  color_accent TEXT DEFAULT '#16a34a',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read business_products" ON business_products FOR SELECT USING (true);
CREATE POLICY "Admin manage business_products" ON business_products FOR ALL USING (true) WITH CHECK (true);

-- 2. BUSINESS PARTNERS (Logo Strip)
CREATE TABLE IF NOT EXISTS business_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read business_partners" ON business_partners FOR SELECT USING (true);
CREATE POLICY "Admin manage business_partners" ON business_partners FOR ALL USING (true) WITH CHECK (true);

-- 3. BUSINESS TESTIMONIALS
CREATE TABLE IF NOT EXISTS business_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read business_testimonials" ON business_testimonials FOR SELECT USING (true);
CREATE POLICY "Admin manage business_testimonials" ON business_testimonials FOR ALL USING (true) WITH CHECK (true);

-- 4. BUSINESS HERO SETTINGS
CREATE TABLE IF NOT EXISTS business_hero (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  subheadline TEXT,
  cycling_words JSONB DEFAULT '["Learn","Build","Earn","Grow"]'::jsonb,
  bg_image_url TEXT,
  demo_video_url TEXT,
  cta_primary_text TEXT DEFAULT 'Start a Project',
  cta_primary_link TEXT DEFAULT '#contact',
  cta_secondary_text TEXT DEFAULT 'Talk to Our Team',
  cta_secondary_link TEXT DEFAULT '#contact',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_hero ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read business_hero" ON business_hero FOR SELECT USING (true);
CREATE POLICY "Admin manage business_hero" ON business_hero FOR ALL USING (true) WITH CHECK (true);

-- 5. BUSINESS STATS (Animated Counters)
CREATE TABLE IF NOT EXISTS business_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value INT NOT NULL,
  suffix TEXT DEFAULT '+',
  icon_name TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read business_stats" ON business_stats FOR SELECT USING (true);
CREATE POLICY "Admin manage business_stats" ON business_stats FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- SEED DATA
-- ============================================================

-- Products
INSERT INTO business_products (name, slug, tagline, description, features, image_url, cta_text, cta_link, icon_name, color_accent, sort_order) VALUES
(
  'LoopMail',
  'loopmail',
  'Bulk Email Sender',
  'Send bulk emails, track opens, clicks and replies with ease. Boost your outreach and engagement with intelligent campaign management.',
  '["Smart campaign builder","Real-time open & click tracking","Template library with drag-and-drop editor","Contact list management & segmentation","Bounce & unsubscribe handling","Detailed analytics dashboard"]'::jsonb,
  '/images/business/loopmail.png',
  'Explore LoopMail',
  '/business',
  'mail',
  '#16a34a',
  1
),
(
  'LoopEvent',
  'loopevent',
  'Meeting Scheduler',
  'Schedule meetings effortlessly, share availability and integrate calendars. Save time and stay organized with automated scheduling.',
  '["One-click meeting scheduling","Calendar sync (Google, Outlook)","Custom availability windows","Automated reminders & follow-ups","Team scheduling & round-robin","Embeddable booking page"]'::jsonb,
  '/images/business/loopevent.png',
  'Explore LoopEvent',
  '/business',
  'calendar',
  '#0ea5e9',
  2
),
(
  'LoopHR',
  'loophr',
  'HRMS Solution',
  'Manage your workforce efficiently with our all-in-one HRMS solution. From attendance to payroll, we''ve got you covered.',
  '["Employee database & profiles","Attendance tracking & leave management","Payroll processing & payslips","Department & role management","Performance reviews & analytics","Document management & compliance"]'::jsonb,
  '/images/business/loophr.png',
  'Explore LoopHR',
  '/business',
  'briefcase',
  '#8b5cf6',
  3
);

-- Partners (dummy logos — text placeholders, admin can upload real logos later)
INSERT INTO business_partners (name, logo_url, website_url, sort_order) VALUES
('Google', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/250px-Google_2015_logo.svg.png', 'https://google.com', 1),
('Microsoft', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png', 'https://microsoft.com', 2),
('Amazon Web Services', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/200px-Amazon_Web_Services_Logo.svg.png', 'https://aws.amazon.com', 3),
('Razorpay', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Razorpay_logo.svg/200px-Razorpay_logo.svg.png', 'https://razorpay.com', 4),
('Zoho', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Zoho_logo.svg/200px-Zoho_logo.svg.png', 'https://zoho.com', 5),
('Freshworks', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Freshworks_Logo.svg/200px-Freshworks_Logo.svg.png', 'https://freshworks.com', 6);

-- Testimonials (dummy)
INSERT INTO business_testimonials (client_name, company, role, quote, rating) VALUES
('Rahul Sharma', 'TechNova Solutions', 'CTO', 'Diverse Loopers delivered our MVP in just 6 weeks. The quality of code and communication was outstanding. Their hybrid model gave us agency-quality work at a fraction of the cost.', 5),
('Priya Krishnan', 'EduBridge Global', 'Head of Product', 'We hired 3 developers from their ecosystem and they ramped up faster than anyone we''ve onboarded before. They came pre-trained on our exact tech stack.', 5),
('Amit Patel', 'GreenLeaf Fintech', 'Founder', 'The LoopMail tool transformed our outreach. We went from 200 emails/day to 10,000+ with better open rates. Their team is responsive and the product keeps improving.', 4);

-- Hero Settings
INSERT INTO business_hero (headline, subheadline, cycling_words, demo_video_url, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link) VALUES
(
  'Custom Software Solutions for Your Business',
  'We build powerful, scalable and secure software that helps businesses automate, grow and succeed.',
  '["Learn","Build","Earn","Grow"]'::jsonb,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Start a Project',
  '#contact',
  'Our Top Performers',
  '/skillsynth'
);

-- Stats
INSERT INTO business_stats (label, value, suffix, icon_name, sort_order) VALUES
('Projects Delivered', 50, '+', 'folder-check', 1),
('Trained Talent', 200, '+', 'users', 2),
('Client Satisfaction', 98, '%', 'heart', 3),
('Active Clients', 15, '+', 'building-2', 4);
