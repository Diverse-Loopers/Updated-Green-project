-- ============================================================
-- LOOPMAIL CLIENT USERS & SUBSCRIPTIONS
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Fix LoopMail product CTA link (it was pointing to /business)
UPDATE business_products SET cta_link = '/products/loopmail' WHERE slug = 'loopmail';

-- 2. CLIENT PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    company_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    plan TEXT DEFAULT 'free',                            -- free, starter, pro, enterprise
    is_business_client BOOLEAN DEFAULT false,            -- true if signed up via business page
    onboarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCT SUBSCRIPTIONS (which tools a client has access to)
CREATE TABLE IF NOT EXISTS client_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,                          -- loopmail, loopevent, loophr, etc.
    status TEXT DEFAULT 'active',                        -- active, paused, cancelled, trial
    plan TEXT DEFAULT 'free',                            -- free, pro, enterprise
    started_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_slug)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_client_profiles_plan ON client_profiles(plan);
CREATE INDEX IF NOT EXISTS idx_client_subs_user ON client_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_client_subs_product ON client_subscriptions(product_slug);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view/edit their own profile
CREATE POLICY "Users manage own profile" ON client_profiles
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can view their own subscriptions
CREATE POLICY "Users view own subscriptions" ON client_subscriptions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY "Service role full access profiles" ON client_profiles
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access subs" ON client_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGER: Auto-create client profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_client_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO client_profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;

    -- Auto-subscribe to free tier of LoopMail
    INSERT INTO client_subscriptions (user_id, product_slug, status, plan)
    VALUES (NEW.id, 'loopmail', 'active', 'free')
    ON CONFLICT (user_id, product_slug) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_client_user();
