import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST: Start or end a live class
export async function POST(req) {
  try {
    const { action, courseId, meetLink } = await req.json();

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Course ID required' }, { status: 400 });
    }

    if (action === 'start') {
      // Trainer starts class — save meeting link and set active
      if (!meetLink) {
        return NextResponse.json({ success: false, error: 'Meeting link required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('courses')
        .update({
          jitsi_room_name: meetLink.trim(),
          live_class_active: true,
        })
        .eq('id', courseId);

      if (error) {
        console.error('Start class error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'end') {
      // Trainer ends class — set inactive
      const { error } = await supabase
        .from('courses')
        .update({ live_class_active: false })
        .eq('id', courseId);

      if (error) {
        console.error('End class error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (err) {
    console.error('Live class API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
