import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: List all executives
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('executives')
      .select('id, email, name, role, phone, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, executives: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create, Update, Delete executives
export async function POST(req) {
  try {
    const { action, ...body } = await req.json();

    if (action === 'create') {
      const { email, password, name, role, phone } = body;
      if (!email || !password || !name || !role) {
        return NextResponse.json({ success: false, error: 'Email, password, name, and role are required' }, { status: 400 });
      }

      // Check duplicate email
      const { data: existing } = await supabase
        .from('executives')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: false, error: 'An executive with this email already exists' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('executives')
        .insert({
          email: email.toLowerCase().trim(),
          password,
          name,
          role,
          phone: phone || null,
          is_active: true,
        })
        .select('id, email, name, role, phone, is_active, created_at')
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, executive: data });
    }

    if (action === 'update') {
      const { id, name, role, phone, is_active } = body;
      if (!id) return NextResponse.json({ success: false, error: 'Executive ID required' }, { status: 400 });

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (role !== undefined) updates.role = role;
      if (phone !== undefined) updates.phone = phone;
      if (is_active !== undefined) updates.is_active = is_active;

      const { data, error } = await supabase
        .from('executives')
        .update(updates)
        .eq('id', id)
        .select('id, email, name, role, phone, is_active, created_at')
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, executive: data });
    }

    if (action === 'update-password') {
      const { id, password } = body;
      if (!id || !password) {
        return NextResponse.json({ success: false, error: 'ID and password required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('executives')
        .update({ password })
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const { id } = body;
      if (!id) return NextResponse.json({ success: false, error: 'Executive ID required' }, { status: 400 });

      const { error } = await supabase
        .from('executives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (err) {
    console.error('Executive manage error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
