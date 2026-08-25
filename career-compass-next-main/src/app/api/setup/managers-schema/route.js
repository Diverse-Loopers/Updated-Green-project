import { NextResponse } from 'next/server';

export async function GET(request) {
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== 'hrms-admin-access') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const sql = `
-- managers table
CREATE TABLE IF NOT EXISTS managers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id text UNIQUE,
    name text NOT NULL,
    email text NOT NULL,
    designation text,
    project_name text,
    signature_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- employee_managers assignment table
CREATE TABLE IF NOT EXISTS employee_managers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id text NOT NULL,
    manager_id uuid NOT NULL REFERENCES managers(id),
    assigned_at timestamptz DEFAULT now(),
    UNIQUE(employee_id)
);

-- ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id text NOT NULL,
    rated_by text NOT NULL,
    rated_by_role text NOT NULL DEFAULT 'manager',
    rating integer NOT NULL CHECK (rating >= 0 AND rating <= 100),
    month text NOT NULL,
    comments text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(employee_id, rated_by, month)
);

-- announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    posted_by text NOT NULL,
    posted_by_role text NOT NULL DEFAULT 'manager',
    scope text NOT NULL DEFAULT 'team',
    manager_id uuid REFERENCES managers(id),
    created_at timestamptz DEFAULT now()
);

-- projects table
CREATE TABLE IF NOT EXISTS projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    manager_id uuid REFERENCES managers(id),
    start_date date,
    end_date date,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- hrms_security_settings table
CREATE TABLE IF NOT EXISTS hrms_security_settings (
    id text PRIMARY KEY DEFAULT 'global',
    password_hash text NOT NULL,
    updated_by text DEFAULT 'CEO',
    updated_at timestamptz DEFAULT now()
);
  `;

  return NextResponse.json({
    success: true,
    message: 'Run this SQL in Supabase Dashboard > SQL Editor to setup the database tables for the managers system.',
    sql
  });
}
