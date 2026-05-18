-- ============================================================
-- FIX BROKEN PARTNER LOGOS
-- The logo_url values were pointing to non-existent images.
-- This updates them to use reliable logo.clearbit.com URLs.
-- Run this in Supabase SQL Editor.
-- ============================================================

UPDATE business_partners SET logo_url = 'https://logo.clearbit.com/microsoft.com' WHERE name ILIKE '%microsoft%';
UPDATE business_partners SET logo_url = 'https://logo.clearbit.com/aws.amazon.com' WHERE name ILIKE '%amazon%' OR name ILIKE '%aws%';
UPDATE business_partners SET logo_url = 'https://logo.clearbit.com/razorpay.com' WHERE name ILIKE '%razorpay%';
UPDATE business_partners SET logo_url = 'https://logo.clearbit.com/zoho.com' WHERE name ILIKE '%zoho%';
UPDATE business_partners SET logo_url = 'https://logo.clearbit.com/freshworks.com' WHERE name ILIKE '%freshworks%';
UPDATE business_partners SET logo_url = 'https://logo.clearbit.com/google.com' WHERE name ILIKE '%google%';
