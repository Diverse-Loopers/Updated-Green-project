import { NextResponse } from 'next/server';

export async function GET(request) {
    const sql = `
-- 1. Placement Students Table with Extended Fields & Multi-Assignee Support
CREATE TABLE IF NOT EXISTS placement_students (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id text UNIQUE NOT NULL,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    target_roles text,
    
    -- Full Address
    country text,
    state text,
    city text,
    zip_code text,
    street_address text,
    location text,
    
    -- Extended Student Profile
    marketing_email text,
    personal_email text,
    highest_qualification text,
    college_university text,
    graduation_year text,
    years_of_experience text,
    tech_skills text,
    linkedin_url text,
    portfolio_url text,
    
    -- Tracking Spreadsheet
    spreadsheet_url text,
    
    -- Service Duration
    service_start_date date,
    service_end_date date,
    status text DEFAULT 'active', -- 'active', 'placed', 'paused', 'completed'
    
    -- Assigned Team (Multi-Select JSON arrays + Legacy Fallbacks)
    marketing_person_ids jsonb DEFAULT '[]'::jsonb,
    support_person_ids jsonb DEFAULT '[]'::jsonb,
    hr_person_ids jsonb DEFAULT '[]'::jsonb,
    manager_person_ids jsonb DEFAULT '[]'::jsonb,
    marketing_person_id text,
    support_person_id text,
    hr_person_id text,
    manager_person_id text,
    
    -- Multi-Installment Payment Schedule
    total_fee numeric DEFAULT 0,
    amount_paid numeric DEFAULT 0,
    amount_due numeric DEFAULT 0,
    payment_installments jsonb DEFAULT '[]'::jsonb, -- Array of { id, title, amount, due_date, payment_link, status }
    payment_due_date date,
    payment_link text,
    payment_status text DEFAULT 'due', -- 'paid', 'partially_paid', 'due', 'overdue'
    
    -- Documents
    mou_url text,
    credentials_url text,
    additional_docs jsonb DEFAULT '[]'::jsonb,
    
    -- Auth
    portal_password text,
    created_by text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure columns exist if table was already created earlier:
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS street_address text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS marketing_email text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS personal_email text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS highest_qualification text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS college_university text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS graduation_year text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS years_of_experience text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS tech_skills text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS portfolio_url text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS spreadsheet_url text;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS marketing_person_ids jsonb DEFAULT '[]'::jsonb;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS support_person_ids jsonb DEFAULT '[]'::jsonb;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS hr_person_ids jsonb DEFAULT '[]'::jsonb;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS manager_person_ids jsonb DEFAULT '[]'::jsonb;
ALTER TABLE placement_students ADD COLUMN IF NOT EXISTS payment_installments jsonb DEFAULT '[]'::jsonb;

-- 2. Daily Application Logs Table
CREATE TABLE IF NOT EXISTS placement_application_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES placement_students(id) ON DELETE CASCADE,
    applied_date date NOT NULL,
    company_name text NOT NULL,
    job_role text NOT NULL,
    application_type text NOT NULL DEFAULT 'Easy Apply', -- 'Easy Apply', 'Long Form / Portal', 'Referral', 'Email Outreach'
    job_url text,
    status text DEFAULT 'applied',
    notes text,
    logged_by text,
    created_at timestamptz DEFAULT now()
);

-- 3. Team & Student Messages Table
CREATE TABLE IF NOT EXISTS placement_team_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES placement_students(id) ON DELETE CASCADE,
    sender_type text NOT NULL, -- 'student', 'employee', 'sales'
    sender_id text NOT NULL,
    sender_name text NOT NULL,
    recipient_employee_id text,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Ensure storage bucket for placement documents exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('placement-documents', 'placement-documents', true) 
ON CONFLICT (id) DO NOTHING;
    `;

    return NextResponse.json({
        success: true,
        message: 'Placement Program schema ready. Run this SQL in Supabase SQL Editor if tables are not yet updated.',
        sql
    });
}
