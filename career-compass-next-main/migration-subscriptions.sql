-- ============================================================
-- SUBSCRIPTION SYSTEM UPGRADE
-- Run this in Supabase SQL Editor AFTER migration-client-users.sql
-- ============================================================

-- 1. Add subscription management columns to client_subscriptions
ALTER TABLE client_subscriptions
    ADD COLUMN IF NOT EXISTS payment_id TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Update existing 'free' plans to 'basic'
UPDATE client_subscriptions SET plan = 'basic' WHERE plan = 'free';
UPDATE client_profiles SET plan = 'basic' WHERE plan = 'free';

-- 3. Enterprise Leads table (contact sales form)
CREATE TABLE IF NOT EXISTS enterprise_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    message TEXT,
    product_slug TEXT DEFAULT 'loopmail',
    status TEXT DEFAULT 'new',  -- new, contacted, converted, rejected
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE enterprise_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create leads" ON enterprise_leads
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access leads" ON enterprise_leads
    FOR ALL USING (auth.role() = 'service_role');

-- 4. Update auto-signup trigger to use 'basic' instead of 'free'
CREATE OR REPLACE FUNCTION handle_new_client_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create business profile if user signed up with is_business flag
    IF (NEW.raw_user_meta_data->>'is_business')::boolean IS TRUE THEN
        INSERT INTO client_profiles (id, full_name, company_name, is_business_client)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'company', ''),
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            is_business_client = true,
            company_name = COALESCE(EXCLUDED.company_name, client_profiles.company_name);

        -- Auto-subscribe to basic tier of LoopMail
        INSERT INTO client_subscriptions (user_id, product_slug, status, plan)
        VALUES (NEW.id, 'loopmail', 'active', 'basic')
        ON CONFLICT (user_id, product_slug) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_client_subs_plan ON client_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_client_subs_status ON client_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_leads_status ON enterprise_leads(status);

-- 6. Verify: Check current data
-- SELECT * FROM client_subscriptions LIMIT 10;
-- SELECT * FROM client_profiles LIMIT 10;
