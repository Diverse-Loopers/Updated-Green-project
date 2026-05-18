-- ============================================================
-- LoopMail SaaS — Database Migration
-- Multi-tenant bulk email sender
-- ============================================================

-- 1. SMTP Configurations (per user, encrypted passwords)
CREATE TABLE IF NOT EXISTS loopmail_smtp_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'custom',          -- google, godaddy, bigrock, hostinger, titan, outlook, custom
    label TEXT DEFAULT 'My Email',                     -- user-friendly label
    host TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 465,
    secure BOOLEAN DEFAULT true,
    username TEXT NOT NULL,
    encrypted_password TEXT NOT NULL,                   -- AES-256-GCM encrypted
    from_email TEXT NOT NULL,
    from_name TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Contact Folders
CREATE TABLE IF NOT EXISTS loopmail_contact_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    contact_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Contacts
CREATE TABLE IF NOT EXISTS loopmail_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES loopmail_contact_folders(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    company TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'manual',
    is_subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, email)
);

-- 4. Email Campaigns
CREATE TABLE IF NOT EXISTS loopmail_campaigns (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    smtp_config_id UUID REFERENCES loopmail_smtp_configs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    status TEXT DEFAULT 'draft',                       -- draft, sending, paused, sent, failed
    recipient_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    sent_by TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Campaign Recipients
CREATE TABLE IF NOT EXISTS loopmail_campaign_recipients (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES loopmail_campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES loopmail_contacts(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending',                     -- pending, sent, failed
    error_message TEXT,
    sent_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_loopmail_smtp_user ON loopmail_smtp_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_loopmail_contacts_user ON loopmail_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_loopmail_contacts_folder ON loopmail_contacts(folder_id);
CREATE INDEX IF NOT EXISTS idx_loopmail_contacts_email ON loopmail_contacts(user_id, email);
CREATE INDEX IF NOT EXISTS idx_loopmail_folders_user ON loopmail_contact_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_loopmail_campaigns_user ON loopmail_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_loopmail_recipients_campaign ON loopmail_campaign_recipients(campaign_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE loopmail_smtp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loopmail_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loopmail_contact_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loopmail_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE loopmail_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- SMTP Configs: users can only see/edit their own
CREATE POLICY "Users manage own smtp configs" ON loopmail_smtp_configs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Contacts: users can only see/edit their own
CREATE POLICY "Users manage own contacts" ON loopmail_contacts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Folders: users can only see/edit their own
CREATE POLICY "Users manage own folders" ON loopmail_contact_folders
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Campaigns: users can only see/edit their own
CREATE POLICY "Users manage own campaigns" ON loopmail_campaigns
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recipients: users can see recipients of their own campaigns
CREATE POLICY "Users view own campaign recipients" ON loopmail_campaign_recipients
    FOR ALL USING (
        campaign_id IN (SELECT id FROM loopmail_campaigns WHERE user_id = auth.uid())
    );

-- Service role bypass (for API routes using service role key)
CREATE POLICY "Service role full access smtp" ON loopmail_smtp_configs
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access contacts" ON loopmail_contacts
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access folders" ON loopmail_contact_folders
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access campaigns" ON loopmail_campaigns
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access recipients" ON loopmail_campaign_recipients
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGER: Auto-update folder contact_count
-- ============================================================
CREATE OR REPLACE FUNCTION update_loopmail_folder_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.folder_id IS NOT NULL THEN
            UPDATE loopmail_contact_folders SET contact_count = (
                SELECT COUNT(*) FROM loopmail_contacts WHERE folder_id = NEW.folder_id
            ) WHERE id = NEW.folder_id;
        END IF;
        IF TG_OP = 'UPDATE' AND OLD.folder_id IS NOT NULL AND OLD.folder_id != NEW.folder_id THEN
            UPDATE loopmail_contact_folders SET contact_count = (
                SELECT COUNT(*) FROM loopmail_contacts WHERE folder_id = OLD.folder_id
            ) WHERE id = OLD.folder_id;
        END IF;
    END IF;
    IF TG_OP = 'DELETE' THEN
        IF OLD.folder_id IS NOT NULL THEN
            UPDATE loopmail_contact_folders SET contact_count = (
                SELECT COUNT(*) FROM loopmail_contacts WHERE folder_id = OLD.folder_id
            ) WHERE id = OLD.folder_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_loopmail_folder_count ON loopmail_contacts;
CREATE TRIGGER trg_loopmail_folder_count
    AFTER INSERT OR UPDATE OF folder_id OR DELETE ON loopmail_contacts
    FOR EACH ROW EXECUTE FUNCTION update_loopmail_folder_count();
