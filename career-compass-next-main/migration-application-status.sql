-- Migration: Add status column to applications table
-- Run this in your Supabase SQL Editor

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' 
CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected', 'interviewed'));

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Update existing rows to 'new' status
UPDATE applications SET status = 'new' WHERE status IS NULL;
