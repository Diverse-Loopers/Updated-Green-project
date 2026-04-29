import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const courseId = formData.get('courseId');
    const title = formData.get('title');
    const description = formData.get('description') || '';
    const uploadedBy = formData.get('uploadedBy');
    const files = formData.getAll('files');

    if (!courseId || !title || !files.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const fileUrls = [];
    const fileNames = [];

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const fileName = `${courseId}/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('course-notes')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        console.error('Upload error:', uploadErr);
        // Fallback: store as placeholder URL
        fileUrls.push(`/uploads/${fileName}`);
      } else {
        const { data: urlData } = supabase.storage
          .from('course-notes')
          .getPublicUrl(fileName);
        fileUrls.push(urlData?.publicUrl || `/uploads/${fileName}`);
      }

      fileNames.push(file.name);
    }

    // Save metadata to database
    const { data, error } = await supabase.from('course_notes').insert({
      course_id: courseId,
      title,
      description,
      file_urls: fileUrls,
      file_names: fileNames,
      uploaded_by: uploadedBy,
    }).select().single();

    if (error) {
      console.error('DB insert error:', error);
      return NextResponse.json({ error: 'Failed to save note metadata' }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: data });
  } catch (err) {
    console.error('Course notes upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('course_notes')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
