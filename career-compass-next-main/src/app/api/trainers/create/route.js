import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { trainerId, fullName, email, phone, specialization, password } = await req.json();

    if (!trainerId || !fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const magicEmail = `${trainerId.toUpperCase()}@trainer.local`.toLowerCase();
    let userId = null;

    // Try creating user with admin API
    try {
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: magicEmail,
        password,
        email_confirm: true,
      });

      if (createError) {
        // User already exists — find them and update password
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = listData?.users?.find(u => u.email === magicEmail);

        if (existingUser) {
          userId = existingUser.id;
          // Update password to the new one
          await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        } else {
          return NextResponse.json({ error: 'Failed to create or find auth user: ' + createError.message }, { status: 500 });
        }
      } else {
        userId = createData.user.id;
      }
    } catch (adminErr) {
      // Admin API not available (no service role key) — fallback to regular signUp
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email: magicEmail,
        password,
      });

      if (signUpError) {
        // Try sign in if already exists
        const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
          email: magicEmail,
          password,
        });

        if (signInError) {
          return NextResponse.json({
            error: 'User exists with different password. Please use the original password or contact support.'
          }, { status: 400 });
        }
        userId = signInData?.user?.id;
      } else {
        userId = signUpData?.user?.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Failed to resolve user account' }, { status: 500 });
    }

    // Check if trainer already exists
    const { data: existing } = await supabaseAdmin
      .from('trainers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing trainer
      const { data, error } = await supabaseAdmin
        .from('trainers')
        .update({
          trainer_id: trainerId.toUpperCase(),
          full_name: fullName,
          email,
          phone: phone || null,
          specialization: specialization || null,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'DB Error: ' + error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, trainer: data, updated: true });
    }

    // Insert new trainer
    const { data, error } = await supabaseAdmin.from('trainers').insert([{
      user_id: userId,
      trainer_id: trainerId.toUpperCase(),
      full_name: fullName,
      email,
      phone: phone || null,
      specialization: specialization || null,
    }]).select().single();

    if (error) {
      return NextResponse.json({ error: 'DB Error: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, trainer: data });
  } catch (err) {
    console.error('Trainer create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
