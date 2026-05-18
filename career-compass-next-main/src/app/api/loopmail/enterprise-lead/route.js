import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST — Store enterprise lead
export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, company, phone, message } = body;

        if (!name || !email) {
            return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 });
        }

        // Check if user is logged in
        let userId = null;
        const auth = req.headers.get('authorization');
        if (auth?.startsWith('Bearer ')) {
            const { data: { user } } = await supabase.auth.getUser(auth.slice(7));
            if (user) userId = user.id;
        }

        const { error } = await supabase
            .from('enterprise_leads')
            .insert({
                user_id: userId,
                full_name: name,
                email,
                company: company || '',
                phone: phone || '',
                message: message || '',
                product_slug: 'loopmail',
                status: 'new',
            });

        if (error) {
            console.error('Enterprise lead insert error:', error);
            return NextResponse.json({ success: false, error: 'Failed to submit inquiry' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
