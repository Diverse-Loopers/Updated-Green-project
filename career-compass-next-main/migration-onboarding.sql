-- ============================================================
-- ONBOARDING SYSTEM MIGRATION
-- Run this in Supabase SQL Editor AFTER migration-subscriptions.sql
-- ============================================================

-- 1. Add onboarding columns to client_subscriptions
ALTER TABLE client_subscriptions
    ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

-- 2. Add business profile columns for onboarding data
ALTER TABLE client_profiles
    ADD COLUMN IF NOT EXISTS billing_address TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS gst_number TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS country TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS work_email TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS monthly_sending TEXT DEFAULT '';

-- 3. Mark ALL existing auto-assigned subscriptions as requiring onboarding
-- This forces existing free users to complete onboarding before they can use LoopMail
UPDATE client_subscriptions
SET onboarding_status = 'pending'
WHERE onboarding_status IS NULL OR onboarding_status = '';

-- 4. Remove auto-subscription from the trigger
-- New business signups only get a profile — NO auto subscription
CREATE OR REPLACE FUNCTION handle_new_client_user()
RETURNS TRIGGER AS $$
BEGIN
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

        -- NOTE: We do NOT auto-create a subscription anymore.
        -- Users must complete onboarding at /products/loopmail/onboarding
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS for enterprise_leads - allow service role to update status
DROP POLICY IF EXISTS "Service role full access leads" ON enterprise_leads;
CREATE POLICY "Service role full access leads" ON enterprise_leads
    FOR ALL USING (true);

-- 6. Index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_client_subs_onboarding ON client_subscriptions(onboarding_status);
