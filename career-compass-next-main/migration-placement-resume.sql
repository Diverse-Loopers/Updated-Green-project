-- Migration: Add resume_url column to placement_applications table
ALTER TABLE placement_applications ADD COLUMN IF NOT EXISTS resume_url text;

-- Add comment explaining column purpose
COMMENT ON COLUMN placement_applications.resume_url IS 'Public URL of uploaded resume/CV file in storage';
