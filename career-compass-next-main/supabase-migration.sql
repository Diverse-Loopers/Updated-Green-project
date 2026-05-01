-- ================================================
-- PAYMENT GATEWAY & EXECUTIVE SYSTEM MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================

-- 1. EXECUTIVES TABLE
CREATE TABLE IF NOT EXISTS executives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'sales',
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. PAYMENT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway_name text NOT NULL,
  api_key text NOT NULL,
  api_secret text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  user_name text,
  user_email text,
  user_phone text,
  course_id uuid,
  course_title text,
  amount decimal DEFAULT 0,
  currency text DEFAULT 'INR',
  coupon_code text,
  discount_amount decimal DEFAULT 0,
  gateway text,
  transaction_id text,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. ADD live_class_link COLUMN TO COURSES (if not already there)
-- Using jitsi_room_name which already exists, so this is optional
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS live_class_link text;

-- 5. DISABLE RLS ON NEW TABLES (for service role access)
ALTER TABLE executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "Service role full access on executives" ON executives
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on payment_settings" ON payment_settings
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

-- 6. SEED DEFAULT SALES EXECUTIVE
INSERT INTO executives (email, password, name, role, phone, is_active)
VALUES ('diverseloopers@gmail.com', 'Diverseloopers@123', 'Sales Executive', 'sales', NULL, true)
ON CONFLICT (email) DO NOTHING;

-- 7. HELPER FUNCTION: Increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code_param text)
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET times_used = COALESCE(times_used, 0) + 1
  WHERE code = coupon_code_param;
END;
$$ LANGUAGE plpgsql;

-- Done! All tables and seed data created.
