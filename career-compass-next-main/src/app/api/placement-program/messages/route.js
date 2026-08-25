import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: Fetch messages
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const student_id = searchParams.get('student_id');
        const employee_id = searchParams.get('employee_id');

        let query = supabaseAdmin
            .from('placement_team_messages')
            .select('*')
            .order('created_at', { ascending: true });

        if (student_id) {
            query = query.eq('student_id', student_id);
            if (employee_id) {
                query = query.or(`recipient_employee_id.eq.${employee_id},sender_id.eq.${employee_id}`);
            }
        } else if (employee_id) {
            query = query.or(`recipient_employee_id.eq.${employee_id},sender_id.eq.${employee_id}`);
        }

        const { data: messages, error } = await query;
        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ success: true, messages: [] });
        }

        return NextResponse.json({ success: true, messages: messages || [] });
    } catch (err) {
        console.error('Messages GET error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: Send new message
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            student_id,
            sender_type,
            sender_id,
            sender_name,
            recipient_employee_id,
            message,
        } = body;

        if (!student_id || !message || !sender_name) {
            return NextResponse.json({ success: false, error: 'student_id, message, and sender_name are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('placement_team_messages')
            .insert([{
                student_id,
                sender_type: sender_type || 'student',
                sender_id: sender_id || 'student',
                sender_name: sender_name.trim(),
                recipient_employee_id: recipient_employee_id || null,
                message: message.trim(),
                is_read: false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Create unified notification for recipient
        if (recipient_employee_id && sender_type === 'student') {
            try {
                await supabaseAdmin.from('notifications').insert([{
                    recipient_role: 'employee',
                    recipient_id: recipient_employee_id,
                    type: 'student_message',
                    title: `💬 New Message from ${sender_name}`,
                    message: `${sender_name}: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
                    is_read: false,
                }]);
            } catch (notifErr) {
                console.warn('Student msg notif error:', notifErr.message);
            }
        } else if (sender_type === 'employee') {
            // Can notify student
            console.log('Employee reply saved for student:', student_id);
        }

        return NextResponse.json({ success: true, message: data });
    } catch (err) {
        console.error('Messages POST error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
