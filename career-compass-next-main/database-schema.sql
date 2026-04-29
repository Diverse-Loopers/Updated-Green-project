-- ============================================================
-- Career Compass — Database Schema for New Features
-- Run each section in Supabase SQL Editor
-- ============================================================

-- 1. ALTER courses table — add new columns
-- ============================================================
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS has_live_class BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS jitsi_room_name TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS trainer_id UUID;

-- 2. Trainers table
-- ============================================================
CREATE TABLE IF NOT EXISTS trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  trainer_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Trainers readable by all" ON trainers;
CREATE POLICY "Trainers readable by all" ON trainers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Trainers updatable by self" ON trainers;
CREATE POLICY "Trainers updatable by self" ON trainers FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert trainers" ON trainers;
CREATE POLICY "Allow insert trainers" ON trainers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow delete trainers" ON trainers;
CREATE POLICY "Allow delete trainers" ON trainers FOR DELETE USING (true);

-- 3. Enrollments table
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  order_id TEXT,
  amount_paid NUMERIC,
  coupon_code TEXT,
  discount_applied NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own enrollments" ON enrollments;
CREATE POLICY "Users see own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Insert own enrollment" ON enrollments;
CREATE POLICY "Insert own enrollment" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service can update enrollments" ON enrollments;
CREATE POLICY "Service can update enrollments" ON enrollments FOR UPDATE USING (true);

-- 4. Coupons table
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  course_id UUID,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coupons readable by all" ON coupons;
CREATE POLICY "Coupons readable by all" ON coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage coupons" ON coupons;
CREATE POLICY "Admin can manage coupons" ON coupons FOR ALL USING (true);

-- 5. Course Notes table
-- ============================================================
CREATE TABLE IF NOT EXISTS course_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  file_urls TEXT[] NOT NULL,
  file_names TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE course_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notes readable by enrolled or trainer" ON course_notes;
CREATE POLICY "Notes readable by enrolled or trainer" ON course_notes FOR SELECT USING (
  -- Trainers can always see notes
  EXISTS (SELECT 1 FROM trainers WHERE trainers.user_id = auth.uid())
  OR
  -- Enrolled students who have paid can see notes
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = course_notes.course_id
    AND enrollments.user_id = auth.uid()
    AND enrollments.payment_status = 'paid'
  )
);
DROP POLICY IF EXISTS "Trainers can insert notes" ON course_notes;
CREATE POLICY "Trainers can insert notes" ON course_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM trainers WHERE trainers.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Trainers can delete own notes" ON course_notes;
CREATE POLICY "Trainers can delete own notes" ON course_notes FOR DELETE USING (auth.uid() = uploaded_by);

-- 6. Trainer Announcements table
-- ============================================================
CREATE TABLE IF NOT EXISTS trainer_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID,
  trainer_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trainer_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Announcements readable" ON trainer_announcements;
CREATE POLICY "Announcements readable" ON trainer_announcements FOR SELECT USING (
  -- The trainer who created it can always see it
  trainer_id = auth.uid()
  OR
  -- Enrolled students who have paid can see announcements
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = trainer_announcements.course_id
    AND enrollments.user_id = auth.uid()
    AND enrollments.payment_status = 'paid'
  )
);
DROP POLICY IF EXISTS "Trainers manage own announcements" ON trainer_announcements;
CREATE POLICY "Trainers manage own announcements" ON trainer_announcements FOR INSERT WITH CHECK (trainer_id = auth.uid());
DROP POLICY IF EXISTS "Trainers update own announcements" ON trainer_announcements;
CREATE POLICY "Trainers update own announcements" ON trainer_announcements FOR UPDATE USING (trainer_id = auth.uid());
DROP POLICY IF EXISTS "Trainers delete own announcements" ON trainer_announcements;
CREATE POLICY "Trainers delete own announcements" ON trainer_announcements FOR DELETE USING (trainer_id = auth.uid());

-- 7. Storage bucket (run via Supabase Dashboard > Storage > Create Bucket)
-- Name: course-notes
-- Public: false
