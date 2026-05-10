-- ============================================
-- CMO Dashboard Migration — COMPLETE
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Marketing Contacts Table
CREATE TABLE IF NOT EXISTS marketing_contacts (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    company TEXT,
    source TEXT DEFAULT 'manual',
    tags TEXT[] DEFAULT '{}',
    is_subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_by TEXT,
    recipient_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Campaign Recipients Table
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES email_campaigns(id) ON DELETE CASCADE,
    contact_id BIGINT REFERENCES marketing_contacts(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON marketing_contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON marketing_contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_subscribed ON marketing_contacts(is_subscribed);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON campaign_recipients(campaign_id);

-- RLS Policies (allow service role full access)
ALTER TABLE marketing_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_contacts' AND policyname = 'service_full_marketing_contacts') THEN
    CREATE POLICY "service_full_marketing_contacts" ON marketing_contacts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_campaigns' AND policyname = 'service_full_email_campaigns') THEN
    CREATE POLICY "service_full_email_campaigns" ON email_campaigns FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_recipients' AND policyname = 'service_full_campaign_recipients') THEN
    CREATE POLICY "service_full_campaign_recipients" ON campaign_recipients FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 4. COPY ALL EXISTING EMAILS INTO CONTACTS
-- ============================================

-- From auth.users (all signed-up users)
INSERT INTO marketing_contacts (email, name, source, tags)
SELECT 
    LOWER(u.email),
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    'signup',
    ARRAY['user']
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- From applications (job applicants) — deduplicated
INSERT INTO marketing_contacts (email, name, phone, source, tags)
SELECT 
    LOWER(a.applicant_email),
    a.applicant_name,
    a.applicant_phone,
    'career_form',
    ARRAY['applicant']
FROM (
    SELECT DISTINCT ON (LOWER(applicant_email)) applicant_email, applicant_name, applicant_phone
    FROM applications
    WHERE applicant_email IS NOT NULL
    ORDER BY LOWER(applicant_email), submitted_at DESC
) a
ON CONFLICT (email) DO NOTHING;

-- From employees
INSERT INTO marketing_contacts (email, name, source, tags)
SELECT 
    LOWER(e.email),
    e.full_name,
    'employee',
    ARRAY['employee']
FROM employees e
WHERE e.email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 5. AUTO-ADD NEW SIGNUPS (Trigger)
-- ============================================

CREATE OR REPLACE FUNCTION add_new_user_to_marketing_contacts()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO marketing_contacts (email, name, source, tags)
    VALUES (
        LOWER(NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'signup',
        ARRAY['user']
    )
    ON CONFLICT (email) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid duplicate
DROP TRIGGER IF EXISTS trg_new_user_marketing_contact ON auth.users;

CREATE TRIGGER trg_new_user_marketing_contact
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION add_new_user_to_marketing_contacts();

-- ============================================
-- DONE! Check results:
-- ============================================
SELECT 'Total contacts imported:' AS info, COUNT(*) AS count FROM marketing_contacts;
