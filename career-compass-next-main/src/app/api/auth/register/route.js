import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, username, company, is_business } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();
        const cleanUsername = (username || cleanEmail.split('@')[0]).trim();

        if (cleanPassword.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long.' }, { status: 400 });
        }

        const userMetadata = {
            username: cleanUsername,
            full_name: cleanUsername,
        };
        if (is_business) {
            userMetadata.is_business = true;
            userMetadata.company = company || '';
        }

        // Create user with email pre-confirmed via Admin API
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: cleanPassword,
            email_confirm: true,
            user_metadata: userMetadata
        });

        if (createError) {
            if (createError.message.toLowerCase().includes('already') || createError.message.toLowerCase().includes('exists')) {
                return NextResponse.json({
                    success: false,
                    error: 'An account with this email already exists. Please Sign In.'
                }, { status: 400 });
            }
            return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
        }

        const newUser = userData.user;

        // Ensure user profile exists
        try {
            await supabaseAdmin.from('profiles').upsert({
                id: newUser.id,
                email: cleanEmail,
                full_name: cleanUsername,
                username: cleanUsername,
                created_at: new Date().toISOString()
            });

            if (is_business) {
                await supabaseAdmin.from('client_profiles').upsert({
                    id: newUser.id,
                    user_id: newUser.id,
                    work_email: cleanEmail,
                    full_name: cleanUsername,
                    company_name: company || '',
                    is_business_client: true,
                    created_at: new Date().toISOString()
                });
            }
        } catch (pErr) {
            console.warn('Profile creation non-fatal warning:', pErr);
        }

        return NextResponse.json({
            success: true,
            message: 'Account created successfully!',
            user: { id: newUser.id, email: newUser.email }
        });
    } catch (err) {
        console.error('Registration API error:', err);
        return NextResponse.json({
            success: false,
            error: err.message || 'Server error during registration'
        }, { status: 500 });
    }
}
