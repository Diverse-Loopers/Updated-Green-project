'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import './live-class.css';

export default function LiveClassPage() {
  const { id } = useParams();
  const router = useRouter();
  const iframeRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [isTrainer, setIsTrainer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('loading'); // loading | connecting | live | error | not-started
  const [error, setError] = useState(null);
  const [dailyUrl, setDailyUrl] = useState(null);

  useEffect(() => {
    loadClassData();
  }, [id]);

  // Listen for Daily.co iframe messages (when user leaves)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.action === 'left-meeting' || event.data?.event === 'left-meeting') {
        handleLeave();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isTrainer]);

  const loadClassData = async () => {
    try {
      // Auth check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Please log in to join the class');
        setStatus('error');
        setLoading(false);
        return;
      }
      setUser(session.user);

      // Get course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (!courseData) {
        setError('Course not found');
        setStatus('error');
        setLoading(false);
        return;
      }
      setCourse(courseData);

      // Check if trainer
      const { data: trainerData } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const isUserTrainer = !!trainerData;
      setIsTrainer(isUserTrainer);

      // Student checks
      if (!isUserTrainer) {
        // Enrollment check
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('course_id', id)
          .maybeSingle();

        if (!enrollment) {
          setError('You must be enrolled in this course to join the live class');
          setStatus('error');
          setLoading(false);
          return;
        }

        // Check if class is actually live
        if (!courseData.live_class_active) {
          setError('The trainer has not started this class yet. Please check back when the class is scheduled.');
          setStatus('not-started');
          setLoading(false);
          return;
        }
      }

      // --- All checks passed, set up Daily.co ---
      setLoading(false);
      setStatus('connecting');

      const displayName = session.user.user_metadata?.full_name
        || session.user.email?.split('@')[0]
        || 'Participant';

      if (isUserTrainer) {
        await startTrainerSession(courseData, displayName);
      } else {
        await joinStudentSession(courseData, displayName);
      }

    } catch (err) {
      console.error('Live class error:', err);
      setError('Failed to load class. Please try again.');
      setStatus('error');
      setLoading(false);
    }
  };

  const startTrainerSession = async (courseData, displayName) => {
    try {
      // 1. Create room
      const roomRes = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-room',
          courseId: id,
          courseTitle: courseData.title,
        }),
      });
      const roomData = await roomRes.json();
      if (!roomData.success) throw new Error(roomData.error);

      // 2. Get owner token
      const tokenRes = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-token',
          courseId: id,
          userName: displayName,
          userRole: 'trainer',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.success) throw new Error(tokenData.error);

      // 3. Mark class as active
      await supabase
        .from('courses')
        .update({ live_class_active: true })
        .eq('id', id);

      // 4. Build Daily.co prebuilt URL
      const url = roomData.room.url + `?t=${tokenData.token}`;
      setDailyUrl(url);
      setStatus('live');

    } catch (err) {
      console.error('Trainer session error:', err);
      setError('Failed to start the class: ' + err.message);
      setStatus('error');
    }
  };

  const joinStudentSession = async (courseData, displayName) => {
    try {
      // Get the existing room URL
      const roomRes = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-room',
          courseId: id,
          courseTitle: courseData.title,
        }),
      });
      const roomData = await roomRes.json();
      if (!roomData.success) throw new Error(roomData.error);

      // Get participant token (restricted permissions — no screen share, can't kick, locked name)
      const tokenRes = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-token',
          courseId: id,
          userName: displayName,
          userRole: 'student',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.success) throw new Error(tokenData.error);

      // Join with restricted token
      const finalUrl = roomData.room.url + `?t=${tokenData.token}`;
      setDailyUrl(finalUrl);
      setStatus('live');

    } catch (err) {
      console.error('Student join error:', err);
      setError('Failed to join the class: ' + err.message);
      setStatus('error');
    }
  };

  const handleLeave = async () => {
    if (isTrainer) {
      // End class — delete room and mark inactive
      try {
        await fetch('/api/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete-room', courseId: id }),
        });
        await supabase
          .from('courses')
          .update({ live_class_active: false })
          .eq('id', id);
      } catch {}
      router.push('/trainer-dashboard');
    } else {
      router.push(`/courses/${id}`);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="lc-loading">
        <div className="lc-spinner"></div>
        <p>Preparing your classroom...</p>
      </div>
    );
  }

  if (status === 'error' || status === 'not-started') {
    return (
      <div className="lc-error">
        <div className="lc-error-icon">
          {status === 'not-started' ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          )}
        </div>
        <h2>{status === 'not-started' ? 'Class Not Started Yet' : 'Access Denied'}</h2>
        <p>{error}</p>
        <button onClick={() => router.push(`/courses/${id}`)} className="lc-back-btn">
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="lc-container">
      {/* Top Bar */}
      <div className="lc-topbar">
        <div className="lc-topbar-left">
          <button onClick={handleLeave} className="lc-topbar-back">
            {isTrainer ? 'End Class' : 'Leave'}
          </button>
          <div className="lc-topbar-info">
            <span className={`lc-live-badge ${status === 'live' ? '' : 'lc-connecting'}`}>
              {status === 'live' ? '● LIVE' : '● CONNECTING'}
            </span>
            <h3 className="lc-topbar-title">{course?.title}</h3>
          </div>
        </div>
        <div className="lc-topbar-right">
          <span className="lc-role-badge">
            {isTrainer ? 'Trainer' : 'Student'}
          </span>
        </div>
      </div>

      {/* Video Area */}
      <div className="lc-body">
        <div className="lc-jitsi-wrap">
          {status === 'connecting' && (
            <div className="lc-jitsi-loading">
              <div className="lc-spinner"></div>
              <p>Connecting to Daily.co...</p>
            </div>
          )}
          {dailyUrl && (
            <iframe
              ref={iframeRef}
              src={dailyUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              style={{ width: '100%', height: '100%', border: 'none' }}
              onLoad={() => setStatus('live')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
