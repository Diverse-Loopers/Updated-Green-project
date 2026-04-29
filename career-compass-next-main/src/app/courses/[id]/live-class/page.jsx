'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import './live-class.css';

export default function LiveClassPage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [isTrainer, setIsTrainer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadClassData();
  }, [id]);

  const loadClassData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Please log in to join the class');
        setLoading(false);
        return;
      }
      setUser(session.user);

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (!courseData) {
        setError('Course not found');
        setLoading(false);
        return;
      }
      setCourse(courseData);
      setMeetLink(courseData.jitsi_room_name || '');

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
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('course_id', id)
          .maybeSingle();

        if (!enrollment) {
          setError('You must be enrolled in this course to join the live class');
          setLoading(false);
          return;
        }

        // Check if class is actually live
        if (!courseData.live_class_active) {
          setError('The trainer has not started this class yet. Please check back when the class is scheduled.');
          setLoading(false);
          return;
        }

        // Check if meeting link exists
        if (!courseData.jitsi_room_name) {
          setError('The meeting link has not been set yet. Please wait for the trainer to configure the class.');
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Live class error:', err);
      setError('Failed to load class data');
      setLoading(false);
    }
  };

  // Trainer: Save meeting link & mark class as active (via server API to bypass RLS)
  const startClass = async () => {
    if (!meetLink.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', courseId: id, meetLink: meetLink.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setCourse(prev => ({ ...prev, jitsi_room_name: meetLink.trim(), live_class_active: true }));

      // Open the meeting link for the trainer
      window.open(meetLink.trim(), '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to start class: ' + err.message);
    }
    setSaving(false);
  };

  // Trainer: End class (via server API to bypass RLS)
  const endClass = async () => {
    try {
      await fetch('/api/live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', courseId: id }),
      });
    } catch {}

    router.push('/trainer-dashboard');
  };

  // Student: Join the meeting
  const joinMeeting = () => {
    if (course?.jitsi_room_name) {
      window.open(course.jitsi_room_name, '_blank');
    }
  };

  const copyLink = () => {
    if (course?.jitsi_room_name) {
      navigator.clipboard.writeText(course.jitsi_room_name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="lc-loading">
        <div className="lc-spinner"></div>
        <p>Loading class details...</p>
      </div>
    );
  }

  if (error) {
    const isNotStarted = error.includes('not started') || error.includes('not been set');
    return (
      <div className="lc-error">
        <div className="lc-error-icon">
          {isNotStarted ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          )}
        </div>
        <h2>{isNotStarted ? 'Class Not Started Yet' : 'Access Denied'}</h2>
        <p>{error}</p>
        <button onClick={() => router.push(`/courses/${id}`)} className="lc-back-btn">
          Back to Course
        </button>
      </div>
    );
  }

  // ========== TRAINER VIEW ==========
  if (isTrainer) {
    return (
      <div className="lc-page">
        <nav className="lc-nav">
          <button onClick={() => router.push('/trainer-dashboard')} className="lc-nav-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Dashboard
          </button>
          <h2 className="lc-nav-title">{course?.title}</h2>
          <span className={`lc-status-badge ${course?.live_class_active ? 'lc-status-live' : 'lc-status-offline'}`}>
            {course?.live_class_active ? '● Live' : '● Offline'}
          </span>
        </nav>

        <div className="lc-trainer-panel">
          <div className="lc-card">
            <div className="lc-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <h3>Live Class Setup</h3>
            </div>

            <p className="lc-card-desc">
              Paste your Google Meet, Zoom, or any meeting link below. Students will be redirected to this link when they click "Join Live Class".
            </p>

            <div className="lc-input-group">
              <label>Meeting Link</label>
              <input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="lc-input"
              />
            </div>

            <div className="lc-actions">
              {!course?.live_class_active ? (
                <button
                  onClick={startClass}
                  disabled={!meetLink.trim() || saving}
                  className="lc-btn lc-btn-start"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  {saving ? 'Starting...' : 'Start Class & Open Meeting'}
                </button>
              ) : (
                <>
                  <button onClick={() => window.open(meetLink, '_blank')} className="lc-btn lc-btn-join">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Open Meeting
                  </button>
                  <button onClick={copyLink} className="lc-btn lc-btn-copy">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={endClass} className="lc-btn lc-btn-end">
                    End Class
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="lc-card lc-card-info">
            <h4>How it works</h4>
            <ol className="lc-steps">
              <li>Create a free meeting on Google Meet, Zoom, or any platform</li>
              <li>Paste the meeting link above and click "Start Class"</li>
              <li>Students enrolled in this course will see "Join Live Class" and be redirected to your meeting</li>
              <li>When done, click "End Class" to hide the join button from students</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ========== STUDENT VIEW ==========
  return (
    <div className="lc-page">
      <nav className="lc-nav">
        <button onClick={() => router.push(`/courses/${id}`)} className="lc-nav-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h2 className="lc-nav-title">{course?.title}</h2>
        <span className="lc-status-badge lc-status-live">● Live Now</span>
      </nav>

      <div className="lc-student-panel">
        <div className="lc-card lc-card-join">
          <div className="lc-join-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>

          <h2>Your class is live!</h2>
          <p>Click the button below to join the live session. The meeting will open in a new tab.</p>

          <button onClick={joinMeeting} className="lc-btn lc-btn-student-join">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Join Live Class
          </button>

          <p className="lc-join-note">
            You will be redirected to the meeting platform (Google Meet / Zoom). Make sure your camera and microphone are ready.
          </p>
        </div>
      </div>
    </div>
  );
}
