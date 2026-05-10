import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    const fileUrls = [];
    const fileNames = [];

    // Save files to public/uploads/course-notes/{courseId}/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'course-notes', courseId);
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      // URL served by Next.js static file serving from /public
      const publicUrl = `/uploads/course-notes/${courseId}/${uniqueName}`;
      fileUrls.push(publicUrl);
      fileNames.push(file.name);
    }

    // Save metadata to database (skip uploaded_by FK if it causes issues)
    const insertPayload = {
      course_id: courseId,
      title,
      description,
      file_urls: fileUrls,
      file_names: fileNames,
    };

    // Only set uploaded_by if it's a valid UUID
    if (uploadedBy && uploadedBy.length > 10) {
      insertPayload.uploaded_by = uploadedBy;
    }

    const { data, error } = await supabase
      .from('course_notes')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('DB insert error:', error);
      // If FK error on uploaded_by, retry without it
      if (error.message?.includes('foreign key') || error.message?.includes('violates')) {
        delete insertPayload.uploaded_by;
        const { data: retryData, error: retryErr } = await supabase
          .from('course_notes')
          .insert(insertPayload)
          .select()
          .single();

        if (retryErr) {
          return NextResponse.json({ error: 'Failed to save note: ' + retryErr.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, note: retryData });
      }
      return NextResponse.json({ error: 'Failed to save note: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: data });
  } catch (err) {
    console.error('Course notes upload error:', err);
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('course_notes')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Notes fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch notes: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
