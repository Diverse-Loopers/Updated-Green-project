import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanPassword = password.trim();

        const { data: student, error } = await supabaseAdmin
            .from('placement_students')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();

        if (error || !student) {
            return NextResponse.json({ success: false, error: 'Invalid student email or password.' }, { status: 401 });
        }

        // Validate portal password
        const storedPass = (student.portal_password || '').trim();
        const isMatch = storedPass === cleanPassword || (student.portal_password && student.portal_password === password);

        if (!isMatch) {
            return NextResponse.json({ success: false, error: 'Invalid student email or password.' }, { status: 401 });
        }

        // Strip sensitive password field
        const { portal_password: _, ...safeStudent } = student;

        // Simple token for student session
        const studentToken = Buffer.from(JSON.stringify({
            student_id: student.id,
            email: student.email,
            name: student.full_name,
            role: 'placement_student',
            iat: Date.now()
        })).toString('base64');

        return NextResponse.json({
            success: true,
            student: safeStudent,
            token: studentToken,
            redirect_to: '/placement-dashboard',
            message: `Welcome back, ${student.full_name}! Redirecting to your Placement Dashboard...`
        });
    } catch (err) {
        console.error('Student auth error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
