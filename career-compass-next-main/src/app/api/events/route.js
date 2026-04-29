// src/app/api/events/route.js
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events  →  fetches all rows from your Supabase "events" table
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Reads your .env.local values automatically — no need to import them manually
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('events')          // ← your Supabase table name (change if different)
      .select('*')
      .order('date', { ascending: false }); // newest first

    if (error) throw error;

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err) {
    console.error('GET /api/events error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}