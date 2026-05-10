import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop() || 'png';
        const fileName = `email-media/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;

        const { error } = await supabase.storage
            .from('marketing')
            .upload(fileName, buffer, { contentType: file.type, upsert: true });

        if (error) {
            // Bucket may not exist, create it
            if (error.message?.includes('not found') || error.statusCode === '404') {
                await supabase.storage.createBucket('marketing', { public: true });
                const { error: e2 } = await supabase.storage
                    .from('marketing')
                    .upload(fileName, buffer, { contentType: file.type, upsert: true });
                if (e2) throw e2;
            } else throw error;
        }

        const { data: urlData } = supabase.storage.from('marketing').getPublicUrl(fileName);

        return NextResponse.json({ success: true, url: urlData.publicUrl });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
