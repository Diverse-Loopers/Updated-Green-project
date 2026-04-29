import { NextResponse } from 'next/server';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

// Helper to call Daily.co API
async function dailyFetch(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${DAILY_API_URL}${path}`, options);
  return res;
}

// POST: Create a room or get meeting token
export async function POST(req) {
  try {
    const { action, courseId, courseTitle, userName, userRole } = await req.json();

    if (action === 'create-room') {
      // Create a Daily.co room for a live class
      const roomName = `dl-${courseId.replace(/-/g, '').slice(0, 16)}`;

      // Check if room already exists
      const checkRes = await dailyFetch(`/rooms/${roomName}`);
      if (checkRes.ok) {
        const existing = await checkRes.json();
        return NextResponse.json({ success: true, room: existing });
      }

      // Create new room (free plan defaults)
      const createRes = await dailyFetch('/rooms', 'POST', {
        name: roomName,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600 * 4, // 4 hour expiry
          eject_at_room_exp: true,
        },
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        return NextResponse.json({ success: false, error: err.info || 'Failed to create room' }, { status: 500 });
      }

      const room = await createRes.json();
      return NextResponse.json({ success: true, room });
    }

    if (action === 'get-token') {
      // Create a meeting token with role-based permissions
      const roomName = `dl-${courseId.replace(/-/g, '').slice(0, 16)}`;
      const isOwner = userRole === 'trainer';

      const tokenRes = await dailyFetch('/meeting-tokens', 'POST', {
        properties: {
          room_name: roomName,
          user_name: isOwner ? `[Trainer] ${userName}` : userName,
          is_owner: isOwner,
          enable_screenshare: isOwner,
          start_video_off: !isOwner,
          start_audio_off: !isOwner,
          user_id: courseId + '-' + Date.now(),
          exp: Math.floor(Date.now() / 1000) + 3600 * 4,
        },
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        return NextResponse.json({ success: false, error: err.info || 'Failed to create token' }, { status: 500 });
      }

      const tokenData = await tokenRes.json();
      return NextResponse.json({ success: true, token: tokenData.token, roomName });
    }

    if (action === 'delete-room') {
      const roomName = `dl-${courseId.replace(/-/g, '').slice(0, 16)}`;
      await dailyFetch(`/rooms/${roomName}`, 'DELETE');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (err) {
    console.error('Daily API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
